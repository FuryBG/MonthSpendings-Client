package app.expo.tavira

import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WalletSyncModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "WalletSync"

    @ReactMethod
    fun isNotificationListenerEnabled(promise: Promise) {
        try {
            val enabled = NotificationManagerCompat.getEnabledListenerPackages(reactContext)
                .contains(reactContext.packageName)
            promise.resolve(enabled)
        } catch (_: Exception) {
            promise.resolve(false)
        }
    }
}
