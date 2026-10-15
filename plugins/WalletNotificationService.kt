package app.expo.tavira

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

/**
 * Captures Google Wallet payment notifications and queues them raw; the API parses amount/currency/merchant,
 * so new notification formats are fixed server-side without an app release.
 */
class WalletNotificationService : NotificationListenerService() {

    companion object {
        private val WALLET_PACKAGES = setOf(
            "com.google.android.apps.walletnfcrel",
            "com.google.android.gms",
        )
    }

    override fun onListenerConnected() {
        WalletOutbox.flushAsync(this)
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (!isWalletPackage(sbn.packageName)) return

        val notification = sbn.notification ?: return
        if (notification.flags and Notification.FLAG_GROUP_SUMMARY != 0) return
        if (notification.flags and Notification.FLAG_ONGOING_EVENT != 0) return

        val extras = notification.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()?.takeIf { it.isNotBlank() }
        val text = (extras.getCharSequence(Notification.EXTRA_BIG_TEXT) ?: extras.getCharSequence(Notification.EXTRA_TEXT))
            ?.toString()
            ?.takeIf { it.isNotBlank() }
            ?: return

        // A payment always shows an amount; skips Play services noise like "Device backed up".
        if (text.none { it.isDigit() } && title?.none { it.isDigit() } != false) return

        WalletOutbox.enqueue(this, sbn.key, title, text, sbn.packageName, sbn.postTime)
        WalletOutbox.flushAsync(this)
    }

    // Debug builds also accept the app's own notifications, for testing with self-posted ones.
    private fun isWalletPackage(packageName: String): Boolean =
        packageName in WALLET_PACKAGES || (BuildConfig.DEBUG && packageName == this.packageName)
}
