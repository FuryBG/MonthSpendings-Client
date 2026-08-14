const { withAndroidManifest } = require('@expo/config-plugins');

const withNoSaveEnabled = (config) =>
  withAndroidManifest(config, (config) => {
    const activities = config.modResults.manifest.application[0].activity ?? [];
    const main = activities.find(
      (a) => a.$?.['android:name'] === '.MainActivity'
    );
    if (main) {
      main.$['android:saveEnabled'] = 'false';
    }
    return config;
  });

module.exports = withNoSaveEnabled;
