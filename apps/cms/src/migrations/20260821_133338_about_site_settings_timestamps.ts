import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`UPDATE \`about\` SET \`updated_at\` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE \`updated_at\` IS NULL;`)
  await db.run(sql`UPDATE \`about\` SET \`created_at\` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE \`created_at\` IS NULL;`)
  await db.run(sql`UPDATE \`site_settings\` SET \`updated_at\` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE \`updated_at\` IS NULL;`)
  await db.run(sql`UPDATE \`site_settings\` SET \`created_at\` = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE \`created_at\` IS NULL;`)

  await db.run(sql`CREATE TABLE \`about_new\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`content\` text,
  	\`photo_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`about_new\` SELECT \`id\`, \`heading\`, \`content\`, \`photo_id\`, \`updated_at\`, \`created_at\` FROM \`about\`;`)
  await db.run(sql`DROP TABLE \`about\`;`)
  await db.run(sql`ALTER TABLE \`about_new\` RENAME TO \`about\`;`)
  await db.run(sql`CREATE INDEX \`about_photo_idx\` ON \`about\` (\`photo_id\`);`)

  await db.run(sql`CREATE TABLE \`site_settings_new\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`telegram_url\` text,
  	\`instagram_url\` text,
  	\`vk_url\` text,
  	\`site_url\` text,
  	\`last_build_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`site_settings_new\` SELECT \`id\`, \`telegram_url\`, \`instagram_url\`, \`vk_url\`, \`site_url\`, \`last_build_at\`, \`updated_at\`, \`created_at\` FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_new\` RENAME TO \`site_settings\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`about_old\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`heading\` text NOT NULL,
  	\`content\` text,
  	\`photo_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`about_old\` SELECT \`id\`, \`heading\`, \`content\`, \`photo_id\`, \`updated_at\`, \`created_at\` FROM \`about\`;`)
  await db.run(sql`DROP TABLE \`about\`;`)
  await db.run(sql`ALTER TABLE \`about_old\` RENAME TO \`about\`;`)
  await db.run(sql`CREATE INDEX \`about_photo_idx\` ON \`about\` (\`photo_id\`);`)

  await db.run(sql`CREATE TABLE \`site_settings_old\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`telegram_url\` text,
  	\`instagram_url\` text,
  	\`vk_url\` text,
  	\`site_url\` text,
  	\`last_build_at\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`site_settings_old\` SELECT \`id\`, \`telegram_url\`, \`instagram_url\`, \`vk_url\`, \`site_url\`, \`last_build_at\`, \`updated_at\`, \`created_at\` FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`site_settings_old\` RENAME TO \`site_settings\`;`)
}
