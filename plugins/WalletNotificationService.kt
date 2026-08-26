package app.expo.tavira

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject

class WalletNotificationService : NotificationListenerService() {

    private val walletPackages = setOf(
        "com.google.android.apps.walletnfcrel",
        "com.google.android.gms",
    )

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (sbn.packageName !in walletPackages) return

        val extras = sbn.notification?.extras ?: return
        val title = extras.getCharSequence("android.title")?.toString() ?: return
        val text = extras.getCharSequence("android.bigText")?.toString()
            ?: extras.getCharSequence("android.text")?.toString()
            ?: return

        val parsed = parseWalletNotification(title, text) ?: return

        Thread {
            val token = readToken() ?: return@Thread
            postTransaction(token, parsed)
        }.start()
    }

    private fun readToken(): String? = try {
        File(filesDir, "wallet_token").readText().trim().takeIf { it.isNotEmpty() }
    } catch (_: Exception) {
        null
    }

    private fun postTransaction(token: String, parsed: ParsedTransaction) {
        try {
            val url = URL("https://api.taviraofficial.com/api/notification-transactions")
            val conn = url.openConnection() as HttpURLConnection
            conn.apply {
                requestMethod = "POST"
                setRequestProperty("Authorization", "Bearer $token")
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 15_000
                readTimeout = 15_000
            }
            val body = JSONObject().apply {
                put("merchantName", parsed.merchantName)
                put("amount", parsed.amount)
                put("currency", parsed.currency)
                put("rawTitle", parsed.rawTitle)
                put("rawBody", parsed.rawBody)
            }.toString()
            conn.outputStream.use { it.write(body.toByteArray()) }
            conn.responseCode
            conn.disconnect()
        } catch (_: Exception) {}
    }

    private data class ParsedTransaction(
        val merchantName: String,
        val amount: Double,
        val currency: String,
        val rawTitle: String,
        val rawBody: String,
    )

    private fun parseWalletNotification(title: String, text: String): ParsedTransaction? {
        val body = text.trim()

        // €5.50, $5.50, £5.50 etc. at start
        Regex("""^([€$£₺₴₽₾])\s*([\d]+[.,][\d]{1,2})""").find(body)?.let {
            val amount = it.groupValues[2].replace(',', '.').toDoubleOrNull() ?: return null
            if (amount <= 0) return null
            return ParsedTransaction(title.trim(), amount, detectCurrency(it.groupValues[1], "", body), title, text)
        }

        // лв 5.50
        Regex("""^лв\.?\s*([\d]+[.,][\d]{1,2})""").find(body)?.let {
            val amount = it.groupValues[1].replace(',', '.').toDoubleOrNull() ?: return null
            if (amount <= 0) return null
            return ParsedTransaction(title.trim(), amount, "BGN", title, text)
        }

        // 5.50 BGN
        Regex("""([\d]+[.,][\d]{1,2})\s+([A-Z]{3})\b""").find(body)?.let {
            val amount = it.groupValues[1].replace(',', '.').toDoubleOrNull() ?: return null
            if (amount <= 0) return null
            return ParsedTransaction(title.trim(), amount, detectCurrency("", it.groupValues[2], body), title, text)
        }

        return null
    }

    private fun detectCurrency(symbol: String, code: String, body: String): String = when {
        symbol == "€" || code == "EUR" || body.contains("EUR", ignoreCase = true) -> "EUR"
        symbol == "$" || code == "USD" || body.contains("USD", ignoreCase = true) -> "USD"
        symbol == "£" || code == "GBP" || body.contains("GBP", ignoreCase = true) -> "GBP"
        symbol == "₺" || code == "TRY" || body.contains("TRY", ignoreCase = true) -> "TRY"
        symbol == "₾" || code == "GEL" || body.contains("GEL", ignoreCase = true) -> "GEL"
        else -> "BGN"
    }
}
