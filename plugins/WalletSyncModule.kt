package app.expo.tavira

import android.provider.Settings
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
            val pkgName = reactContext.packageName
            val listeners = Settings.Secure.getString(
                reactContext.contentResolver,
                "enabled_notification_listeners",
            ) ?: ""
            promise.resolve(listeners.contains(pkgName))
        } catch (_: Exception) {
            promise.resolve(false)
        }
    }
}
