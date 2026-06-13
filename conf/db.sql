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
  CONSTRAINT `UQ_groups_identifier` UNIQUE (`identifier`),
  CONSTRAINT `UQ_groups_group` UNIQUE (`group`)
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
  CONSTRAINT `UQ_tables_identifier` UNIQUE (`identifier`),
  CONSTRAINT `UQ_tables_id_column_display` UNIQUE (`id_column_display`)
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
   PRIMARY KEY (`id`),
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
ALTER TABLE `views_columns` ADD CONSTRAINT `FK_views_columns_id_column` FOREIGN KEY (`id_column`) REFERENCES `tables_columns` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_columns` ADD CONSTRAINT `FK_views_columns_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `permissions` ADD CONSTRAINT `FK_permissions_id_group` FOREIGN KEY (`id_group`) REFERENCES `groups` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `changes` ADD CONSTRAINT `FK_changes_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_filters` ADD CONSTRAINT `FK_views_filters_id_column` FOREIGN KEY (`id_column`) REFERENCES `tables_columns` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_filters` ADD CONSTRAINT `FK_views_filters_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_permissions` ADD CONSTRAINT `FK_views_permissions_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_permissions` ADD CONSTRAINT `FK_views_permissions_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views` ADD CONSTRAINT `FK_views_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `tables` ADD CONSTRAINT `FK_tables_id_database` FOREIGN KEY (`id_database`) REFERENCES `databases` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `databases_users` ADD CONSTRAINT `FK_databases_users_id_database` FOREIGN KEY (`id_database`) REFERENCES `databases` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `databases_users` ADD CONSTRAINT `FK_databases_users_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_sorts` ADD CONSTRAINT `FK_views_sort_id_column` FOREIGN KEY (`id_column`) REFERENCES `tables_columns` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `views_sorts` ADD CONSTRAINT `FK_views_sort_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sessions` ADD CONSTRAINT `FK_sessions_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `tables_permissions` ADD CONSTRAINT `FK_tables_permissions_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `tables_permissions` ADD CONSTRAINT `FK_tables_permissions_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `users` ADD CONSTRAINT `FK_users_id_group` FOREIGN KEY (`id_group`) REFERENCES `groups` (`identifier`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `tables_columns` ADD CONSTRAINT `FK_tables_columns_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;
