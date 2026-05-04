import * as migration_20260504_210932_initial from './20260504_210932_initial';

export const migrations = [
  {
    up: migration_20260504_210932_initial.up,
    down: migration_20260504_210932_initial.down,
    name: '20260504_210932_initial'
  },
];
