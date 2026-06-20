CREATE TABLE `views_columns` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `id_view` VARCHAR(20) NOT NULL,
  `id_column` VARCHAR(20) NOT NULL,
  `position` DECIMAL(10,2) NULL DEFAULT 1.00 ,
  `visible` TINYINT NULL DEFAULT NULL ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`)
)
ENGINE = InnoDB;
CREATE TABLE `permissions` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `endpoint` VARCHAR(500) NOT NULL,
  `action` VARCHAR(10) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_group` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`)
)
ENGINE = InnoDB;
CREATE TABLE `databases` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NULL DEFAULT NULL ,
  `logo` TEXT NULL DEFAULT NULL ,
  `description` TEXT NULL DEFAULT NULL ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_databases_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `changes` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `id_row` VARCHAR(20) NOT NULL,
  `operation` VARCHAR(10) NOT NULL,
  `id_table` VARCHAR(20) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`)
)
ENGINE = InnoDB;
CREATE TABLE `views_filters` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `id_view` VARCHAR(20) NOT NULL,
  `id_column` VARCHAR(20) NOT NULL,
  `op` VARCHAR(20) NOT NULL DEFAULT '=' ,
  `value` VARCHAR(100) NULL DEFAULT NULL ,
  `position` DECIMAL(10,5) NULL DEFAULT NULL ,
  `is_active` TINYINT NOT NULL DEFAULT 0 ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_views_filters_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `views_permissions` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `id_view` VARCHAR(20) NOT NULL,
  `id_user` VARCHAR(100) NOT NULL,
  `read` TINYINT NOT NULL DEFAULT 0 ,
  `add` TINYINT NOT NULL DEFAULT 0 ,
  `modify` TINYINT NOT NULL DEFAULT 0 ,
  `delete` TINYINT NOT NULL DEFAULT 0 ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_views_permissions_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `views` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_table` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_views_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `groups` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `group` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_groups_group` UNIQUE (`group`),
  CONSTRAINT `UQ_groups_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `tables` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NULL DEFAULT NULL ,
  `change_int` INT NULL DEFAULT 1 ,
  `public_form` TINYINT NULL DEFAULT 0 ,
  `description` TEXT NULL DEFAULT NULL ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_database` VARCHAR(20) NOT NULL,
  `id_column_display` VARCHAR(20) NULL DEFAULT NULL ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_tables_id_column_display` UNIQUE (`id_column_display`),
  CONSTRAINT `UQ_tables_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `databases_users` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_user` VARCHAR(20) NOT NULL,
  `id_database` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`)
)
ENGINE = InnoDB;
CREATE TABLE `views_sorts` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `id_view` VARCHAR(20) NOT NULL,
  `id_column` VARCHAR(20) NOT NULL,
  `sort` VARCHAR(100) NOT NULL DEFAULT 'ASC' ,
  `position` DECIMAL(10,5) NOT NULL DEFAULT 1.00000 ,
  `is_active` TINYINT NOT NULL DEFAULT 0 ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_views_sort_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `settings` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `value` TEXT NULL DEFAULT NULL ,
  `updated_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`)
)
ENGINE = InnoDB;
CREATE TABLE `endpoints` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `endpoint` VARCHAR(100) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `action` VARCHAR(10) NOT NULL DEFAULT '' ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_endpoints_endpoint` UNIQUE (`endpoint`)
)
ENGINE = InnoDB;
CREATE TABLE `sessions` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(50) NOT NULL,
  `path` TEXT NOT NULL,
  `max_age` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_user` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_sessions_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `tables_permissions` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `read` TINYINT NOT NULL DEFAULT 0 ,
  `add` TINYINT NOT NULL DEFAULT 0 ,
  `modify` TINYINT NOT NULL DEFAULT 0 ,
  `delete` TINYINT NOT NULL DEFAULT 0 ,
  `just_owner` TINYINT NOT NULL DEFAULT 0 ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_table` VARCHAR(20) NOT NULL,
  `id_user` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_tables_permissions_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `users` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `status` VARCHAR(100) NULL DEFAULT NULL ,
  `type` VARCHAR(100) NOT NULL DEFAULT 'default' ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_group` VARCHAR(100) NULL DEFAULT NULL ,
  `api_key` VARCHAR(64) NULL DEFAULT NULL ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_users_api_key` UNIQUE (`api_key`),
  CONSTRAINT `UQ_users_username` UNIQUE (`username`),
  CONSTRAINT `UQ_users_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE TABLE `tables_columns` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(100) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `column_type` VARCHAR(50) NOT NULL,
  `position` INT UNSIGNED NULL DEFAULT 1 ,
  `required` TINYINT NULL DEFAULT 0 ,
  `default_value` VARCHAR(100) NULL DEFAULT NULL ,
  `link_to` VARCHAR(20) NULL DEFAULT NULL ,
  `description` TEXT NULL DEFAULT NULL ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_table` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_tables_columns_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;
CREATE INDEX `IX_views_columns_position` 
ON `views_columns` (
  `position` ASC
);
CREATE INDEX `FK_views_columns_id_column` 
ON `views_columns` (
  `id_column` ASC
);
CREATE INDEX `FK_views_columns_id_view` 
ON `views_columns` (
  `id_view` ASC
);
CREATE INDEX `IX_views_columns_visible` 
ON `views_columns` (
  `visible` ASC
);
CREATE INDEX `IX_views_columns_created_at` 
ON `views_columns` (
  `created_at` ASC
);
CREATE INDEX `FK_permissions_endpoint` 
ON `permissions` (
  `endpoint` ASC
);
CREATE INDEX `FK_permissions_id_user` 
ON `permissions` (
  `id_group` ASC
);
CREATE INDEX `IX_permissions_created_at` 
ON `permissions` (
  `created_at` ASC
);
CREATE INDEX `IX_permissions_action` 
ON `permissions` (
  `action` ASC
);
CREATE INDEX `IX_databases_state` 
ON `databases` (
  `state` ASC
);
CREATE INDEX `IX_databases_created_at` 
ON `databases` (
  `created_at` ASC
);
CREATE INDEX `IX_databases_name` 
ON `databases` (
  `name` ASC
);
CREATE INDEX `IX_changes_operation` 
ON `changes` (
  `operation` ASC
);
CREATE INDEX `IX_changes_created_at` 
ON `changes` (
  `created_at` ASC
);
CREATE INDEX `FK_changes_id_table` 
ON `changes` (
  `id_table` ASC
);
CREATE INDEX `IX_changes_id_row` 
ON `changes` (
  `id_row` ASC
);
CREATE INDEX `IX_views_filters_value` 
ON `views_filters` (
  `value` ASC
);
CREATE INDEX `IX_views_filters_op` 
ON `views_filters` (
  `op` ASC
);
CREATE INDEX `FK_views_filters_id_column` 
ON `views_filters` (
  `id_column` ASC
);
CREATE INDEX `FK_views_filters_id_view` 
ON `views_filters` (
  `id_view` ASC
);
CREATE INDEX `IX_views_filters_created_at` 
ON `views_filters` (
  `created_at` ASC
);
CREATE INDEX `IX_views_filters_position` 
ON `views_filters` (
  `position` ASC
);
CREATE INDEX `FK_views_permissions_id_view` 
ON `views_permissions` (
  `id_view` ASC
);
CREATE INDEX `IX_views_permissions_delete` 
ON `views_permissions` (
  `delete` ASC
);
CREATE INDEX `IX_views_permissions_add` 
ON `views_permissions` (
  `add` ASC
);
CREATE INDEX `IX_views_permissions_read` 
ON `views_permissions` (
  `read` ASC
);
CREATE INDEX `FK_views_permissions_id_user` 
ON `views_permissions` (
  `id_user` ASC
);
CREATE INDEX `IX_views_permissions_modify` 
ON `views_permissions` (
  `modify` ASC
);
CREATE INDEX `IX_views_name` 
ON `views` (
  `name` ASC
);
CREATE INDEX `IX_views_created_at` 
ON `views` (
  `created_at` ASC
);
CREATE INDEX `FK_views_id_table` 
ON `views` (
  `id_table` ASC
);
CREATE INDEX `IX_groups_created_at` 
ON `groups` (
  `created_at` ASC
);
CREATE INDEX `IX_groups_group` 
ON `groups` (
  `group` ASC
);
CREATE INDEX `IX_tables_state` 
ON `tables` (
  `state` ASC
);
CREATE INDEX `IX_tables_created_at` 
ON `tables` (
  `created_at` ASC
);
CREATE INDEX `IX_tables_public_form` 
ON `tables` (
  `public_form` ASC
);
CREATE INDEX `IX_tables_identifier` 
ON `tables` (
  `identifier` ASC
);
CREATE INDEX `IX_tables_name` 
ON `tables` (
  `name` ASC
);
CREATE INDEX `FK_tables_id_database` 
ON `tables` (
  `id_database` ASC
);
CREATE INDEX `FK_databases_users_id_database` 
ON `databases_users` (
  `id_database` ASC
);
CREATE INDEX `IX_databases_users_created_at` 
ON `databases_users` (
  `created_at` ASC
);
CREATE INDEX `FK_databases_users_id_user` 
ON `databases_users` (
  `id_user` ASC
);
CREATE INDEX `IX_views_sort_created_at` 
ON `views_sorts` (
  `created_at` ASC
);
CREATE INDEX `IX_views_sort_is_active` 
ON `views_sorts` (
  `is_active` ASC
);
CREATE INDEX `FK_views_sort_id_view` 
ON `views_sorts` (
  `id_view` ASC
);
CREATE INDEX `FK_views_sort_id_column` 
ON `views_sorts` (
  `id_column` ASC
);
CREATE INDEX `IX_views_sort_sort` 
ON `views_sorts` (
  `sort` ASC
);
CREATE INDEX `IX_views_sort_position` 
ON `views_sorts` (
  `position` ASC
);
CREATE INDEX `IX_settings_updated_at` 
ON `settings` (
  `updated_at` ASC
);
CREATE INDEX `IX_settings_name` 
ON `settings` (
  `name` ASC
);
CREATE INDEX `IX_endpoints_title` 
ON `endpoints` (
  `title` ASC
);
CREATE INDEX `IX_endpoints_action` 
ON `endpoints` (
  `action` ASC
);
CREATE INDEX `IX_endpoints_created_at` 
ON `endpoints` (
  `created_at` ASC
);
CREATE INDEX `IX_sessions_identifier` 
ON `sessions` (
  `identifier` ASC
);
CREATE INDEX `IX_sessions_path` 
ON `sessions` (
  `path` ASC
);
CREATE INDEX `IX_sessions_max_age` 
ON `sessions` (
  `max_age` ASC
);
CREATE INDEX `FK_sessions_id_user` 
ON `sessions` (
  `id_user` ASC
);
CREATE INDEX `IX_sessions_created_at` 
ON `sessions` (
  `created_at` ASC
);
CREATE INDEX `IX_tables_permissions_created_at` 
ON `tables_permissions` (
  `created_at` ASC
);
CREATE INDEX `IX_tables_permissions_add` 
ON `tables_permissions` (
  `add` ASC
);
CREATE INDEX `FK_tables_permissions_id_table` 
ON `tables_permissions` (
  `id_table` ASC
);
CREATE INDEX `IX_tables_permissions_modify` 
ON `tables_permissions` (
  `modify` ASC
);
CREATE INDEX `FK_tables_permissions_id_user` 
ON `tables_permissions` (
  `id_user` ASC
);
CREATE INDEX `IX_tables_permissions_delete` 
ON `tables_permissions` (
  `delete` ASC
);
CREATE INDEX `IX_tables_permissions_read` 
ON `tables_permissions` (
  `read` ASC
);
CREATE INDEX `IX_users_password` 
ON `users` (
  `password` ASC
);
CREATE INDEX `IX_users_username` 
ON `users` (
  `username` ASC
);
CREATE INDEX `IX_users_type` 
ON `users` (
  `type` ASC
);
CREATE INDEX `IX_users_status` 
ON `users` (
  `status` ASC
);
CREATE INDEX `IX_users_created_at` 
ON `users` (
  `created_at` ASC
);
CREATE INDEX `FK_users_id_group` 
ON `users` (
  `id_group` ASC
);
CREATE INDEX `IX_tables_columns_name` 
ON `tables_columns` (
  `name` ASC
);
CREATE INDEX `IX_tables_columns_required` 
ON `tables_columns` (
  `required` ASC
);
CREATE INDEX `FK_tables_columns_id_table` 
ON `tables_columns` (
  `id_table` ASC
);
CREATE INDEX `IX_tables_columns_created_at` 
ON `tables_columns` (
  `created_at` ASC
);
CREATE INDEX `IX_tables_columns_default_value` 
ON `tables_columns` (
  `default_value` ASC
);
CREATE INDEX `IX_tables_columns_identifier` 
ON `tables_columns` (
  `identifier` ASC
);
CREATE INDEX `IX_tables_columns_link_to` 
ON `tables_columns` (
  `link_to` ASC
);
CREATE INDEX `FK_tables_columns_id_column_type` 
ON `tables_columns` (
  `column_type` ASC
);
ALTER TABLE `views_columns` ADD CONSTRAINT `FK_views_columns_id_column` FOREIGN KEY (`id_column`) REFERENCES `tables_columns` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_columns` ADD CONSTRAINT `FK_views_columns_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `permissions` ADD CONSTRAINT `FK_permissions_id_group` FOREIGN KEY (`id_group`) REFERENCES `groups` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `changes` ADD CONSTRAINT `FK_changes_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_filters` ADD CONSTRAINT `FK_views_filters_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_filters` ADD CONSTRAINT `FK_views_filters_id_column` FOREIGN KEY (`id_column`) REFERENCES `tables_columns` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_permissions` ADD CONSTRAINT `FK_views_permissions_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_permissions` ADD CONSTRAINT `FK_views_permissions_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views` ADD CONSTRAINT `FK_views_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `tables` ADD CONSTRAINT `FK_tables_id_database` FOREIGN KEY (`id_database`) REFERENCES `databases` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `databases_users` ADD CONSTRAINT `FK_databases_users_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `databases_users` ADD CONSTRAINT `FK_databases_users_id_database` FOREIGN KEY (`id_database`) REFERENCES `databases` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_sorts` ADD CONSTRAINT `FK_views_sort_id_column` FOREIGN KEY (`id_column`) REFERENCES `tables_columns` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_sorts` ADD CONSTRAINT `FK_views_sort_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sessions` ADD CONSTRAINT `FK_sessions_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `tables_permissions` ADD CONSTRAINT `FK_tables_permissions_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `tables_permissions` ADD CONSTRAINT `FK_tables_permissions_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `users` ADD CONSTRAINT `FK_users_id_group` FOREIGN KEY (`id_group`) REFERENCES `groups` (`identifier`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `tables_columns` ADD CONSTRAINT `FK_tables_columns_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
