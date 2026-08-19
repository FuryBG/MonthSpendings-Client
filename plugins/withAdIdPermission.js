const { withAndroidManifest } = require('@expo/config-plugins');

const withAdIdPermission = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    const permissions = manifest['uses-permission'] || [];
    const AD_ID = 'com.google.android.gms.permission.AD_ID';
    const alreadyAdded = permissions.some((p) => p.$?.['android:name'] === AD_ID);

    if (!alreadyAdded) {
      permissions.push({ $: { 'android:name': AD_ID } });
      manifest['uses-permission'] = permissions;
    }

    return config;
  });

module.exports = withAdIdPermission;
