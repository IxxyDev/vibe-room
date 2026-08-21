import * as migration_20260504_210932_initial from './20260504_210932_initial';
import * as migration_20260821_133338_about_site_settings_timestamps from './20260821_133338_about_site_settings_timestamps';

export const migrations = [
  {
    up: migration_20260504_210932_initial.up,
    down: migration_20260504_210932_initial.down,
    name: '20260504_210932_initial'
  },
  {
    up: migration_20260821_133338_about_site_settings_timestamps.up,
    down: migration_20260821_133338_about_site_settings_timestamps.down,
    name: '20260821_133338_about_site_settings_timestamps'
  },
];
