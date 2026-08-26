const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withWalletKotlinFiles(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const kotlinDir = path.join(
        platformRoot,
        'app/src/main/java/app/expo/tavira',
      );
      fs.mkdirSync(kotlinDir, { recursive: true });

      const templates = ['WalletNotificationService.kt', 'WalletSyncModule.kt', 'WalletSyncPackage.kt'];
      for (const filename of templates) {
        const src = fs.readFileSync(path.join(__dirname, filename), 'utf-8');
        fs.writeFileSync(path.join(kotlinDir, filename), src);
      }

      return config;
    },
  ]);
}

function withWalletManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const app = manifest.application[0];

    app.service = app.service || [];

    const alreadyAdded = app.service.some(
      (s) => s.$?.['android:name'] === '.WalletNotificationService',
    );

    if (!alreadyAdded) {
      app.service.push({
        $: {
          'android:name': '.WalletNotificationService',
          'android:label': 'Tavira Wallet Sync',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:process': ':wallet',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: { 'android:name': 'android.service.notification.NotificationListenerService' },
              },
            ],
          },
        ],
      });
    }

    return config;
  });
}

function withWalletMainApplication(config) {
  return withDangerousMod(config, [
    'android',
    (config) => {
      const platformRoot = config.modRequest.platformProjectRoot;
      const mainAppPath = path.join(
        platformRoot,
        'app/src/main/java/app/expo/tavira/MainApplication.kt',
      );

      if (!fs.existsSync(mainAppPath)) return config;

      let src = fs.readFileSync(mainAppPath, 'utf-8');

      if (!src.includes('WalletSyncPackage')) {
        // Insert import after the last "import com.facebook.react.*" line
        src = src.replace(
          /((?:import com\.facebook\.react\.[^\n]+\n)+)/,
          (match) => `${match}import app.expo.tavira.WalletSyncPackage\n`,
        );
        // Register package before "return packages"
        src = src.replace(
          '// packages.add(MyReactNativePackage())',
          '// packages.add(MyReactNativePackage())\n        packages.add(WalletSyncPackage())',
        );
      }

      fs.writeFileSync(mainAppPath, src);
      return config;
    },
  ]);
}

module.exports = (config) => {
  config = withWalletKotlinFiles(config);
  config = withWalletManifest(config);
  config = withWalletMainApplication(config);
  return config;
};
