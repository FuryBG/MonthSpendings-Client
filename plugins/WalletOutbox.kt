package app.expo.tavira

import android.content.Context
import java.io.File
import java.io.IOException
import java.io.RandomAccessFile
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.atomic.AtomicBoolean
import org.json.JSONArray
import org.json.JSONObject

/**
 * Durable queue of captured wallet notifications. Every notification is written here first and removed only
 * once the API accepted it (or rejected it for good), so nothing is lost when the phone is offline or the
 * token is missing. Used from both the :wallet process (service) and the main process (WalletSync module),
 * hence the file lock instead of in-memory synchronization.
 */
object WalletOutbox {
    private const val OUTBOX_FILE = "wallet_outbox.json"
    private const val LOCK_FILE = "wallet_outbox.lock"
    private const val TOKEN_FILE = "wallet_token"
    private const val MAX_ITEMS = 200
    private const val MAX_SEEN = 50
    private const val MAX_AGE_MS = 7L * 24 * 60 * 60 * 1000

    private val flushing = AtomicBoolean(false)

    data class Item(val id: String, val title: String?, val text: String, val packageName: String, val postedAt: Long)

    /** Queues the notification unless the same one (key + text) was already captured. */
    fun enqueue(context: Context, notificationKey: String, title: String?, text: String, packageName: String, postedAt: Long) {
        val id = "$notificationKey|${(title.orEmpty() + "\n" + text).hashCode()}"
        withState(context) { items, seen ->
            if (seen.contains(id)) return@withState
            seen.add(id)
            while (seen.size > MAX_SEEN) seen.removeAt(0)
            items.add(Item(id, title, text, packageName, postedAt))
            while (items.size > MAX_ITEMS) items.removeAt(0)
        }
    }

    /** Sends every queued item on a background thread; no-op if a flush is already running in this process. */
    fun flushAsync(context: Context) {
        val appContext = context.applicationContext
        if (!flushing.compareAndSet(false, true)) return
        Thread {
            try {
                flush(appContext)
            } finally {
                flushing.set(false)
            }
        }.start()
    }

    private fun flush(context: Context) {
        val token = readToken(context) ?: return
        val baseUrl = context.getString(R.string.wallet_api_url).trimEnd('/')

        var pending: List<Item> = emptyList()
        withState(context) { items, _ ->
            val cutoff = System.currentTimeMillis() - MAX_AGE_MS
            items.removeAll { it.postedAt < cutoff }
            pending = items.toList()
        }

        val done = mutableSetOf<String>()
        for (item in pending) {
            when (send(baseUrl, token, item)) {
                Outcome.DONE -> done.add(item.id)
                Outcome.RETRY_LATER -> {}
                Outcome.STOP -> break
            }
        }

        if (done.isNotEmpty()) {
            withState(context) { items, _ -> items.removeAll { it.id in done } }
        }
    }

    private enum class Outcome { DONE, RETRY_LATER, STOP }

    private fun send(baseUrl: String, token: String, item: Item): Outcome {
        return try {
            val conn = URL("$baseUrl/api/notification-transactions").openConnection() as HttpURLConnection
            try {
                conn.requestMethod = "POST"
                conn.setRequestProperty("Authorization", "Bearer $token")
                conn.setRequestProperty("Content-Type", "application/json")
                conn.doOutput = true
                conn.connectTimeout = 15_000
                conn.readTimeout = 15_000
                val body = JSONObject().apply {
                    put("title", item.title ?: JSONObject.NULL)
                    put("text", item.text)
                    put("packageName", item.packageName)
                    put("postedAt", isoUtc(item.postedAt))
                }.toString()
                conn.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }

                when (val code = conn.responseCode) {
                    in 200..299 -> Outcome.DONE
                    // Token missing/expired: keep everything until the app hands us a fresh one.
                    401 -> Outcome.STOP
                    408, 429 -> Outcome.RETRY_LATER
                    in 500..599 -> Outcome.RETRY_LATER
                    // Other 4xx (sync turned off, invalid payload) will never succeed.
                    else -> if (code in 400..499) Outcome.DONE else Outcome.RETRY_LATER
                }
            } finally {
                conn.disconnect()
            }
        } catch (_: IOException) {
            // Offline: stop and retry on the next notification / app open.
            Outcome.STOP
        }
    }

    private fun readToken(context: Context): String? = try {
        File(context.filesDir, TOKEN_FILE).readText().trim().takeIf { it.isNotEmpty() }
    } catch (_: Exception) {
        null
    }

    private fun isoUtc(millis: Long): String =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
            .apply { timeZone = TimeZone.getTimeZone("UTC") }
            .format(Date(millis))

    /** Read-modify-write of the outbox file under a cross-process lock. */
    private fun withState(context: Context, block: (MutableList<Item>, MutableList<String>) -> Unit) {
        RandomAccessFile(File(context.filesDir, LOCK_FILE), "rw").use { lockFile ->
            lockFile.channel.lock().use {
                val file = File(context.filesDir, OUTBOX_FILE)
                val items = mutableListOf<Item>()
                val seen = mutableListOf<String>()
                try {
                    if (file.exists()) {
                        val root = JSONObject(file.readText())
                        val itemsJson = root.optJSONArray("items") ?: JSONArray()
                        for (i in 0 until itemsJson.length()) {
                            val o = itemsJson.getJSONObject(i)
                            items.add(
                                Item(
                                    id = o.getString("id"),
                                    title = if (o.isNull("title")) null else o.getString("title"),
                                    text = o.getString("text"),
                                    packageName = o.getString("packageName"),
                                    postedAt = o.getLong("postedAt"),
                                ),
                            )
                        }
                        val seenJson = root.optJSONArray("seen") ?: JSONArray()
                        for (i in 0 until seenJson.length()) seen.add(seenJson.getString(i))
                    }
                } catch (_: Exception) {
                    // Corrupt file: start over rather than crash the listener.
                }

                block(items, seen)

                val root = JSONObject().apply {
                    put("items", JSONArray().apply {
                        items.forEach { item ->
                            put(JSONObject().apply {
                                put("id", item.id)
                                put("title", item.title ?: JSONObject.NULL)
                                put("text", item.text)
                                put("packageName", item.packageName)
                                put("postedAt", item.postedAt)
                            })
                        }
                    })
                    put("seen", JSONArray(seen))
                }
                file.writeText(root.toString())
            }
        }
    }
}
