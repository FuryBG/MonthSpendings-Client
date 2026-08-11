const { withAndroidManifest } = require('@expo/config-plugins');

const withAllowBackupFix = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const app = manifest.application[0];
    app.$ = app.$ || {};
    app.$['tools:replace'] = 'android:allowBackup';

    return config;
  });

module.exports = withAllowBackupFix;
