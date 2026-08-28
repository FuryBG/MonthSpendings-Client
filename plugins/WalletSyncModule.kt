package app.expo.tavira

import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

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

    @ReactMethod
    fun setToken(token: String, promise: Promise) {
        try {
            File(reactContext.filesDir, "wallet_token").writeText(token)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERR_TOKEN_WRITE", e.message)
        }
    }

    @ReactMethod
    fun deleteToken(promise: Promise) {
        try {
            File(reactContext.filesDir, "wallet_token").delete()
            promise.resolve(null)
        } catch (_: Exception) {
            promise.resolve(null)
        }
    }
}
