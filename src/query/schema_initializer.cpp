
#include "query/schema_initializer.h"

#include <algorithm>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

#include <Poco/Data/Session.h>
#include <Poco/Data/Statement.h>
#include <Poco/Data/MySQL/Connector.h>
#include <Poco/Exception.h>

#include "tools/settings_manager.h"
#include "tools/hmac_tool.h"
#include "tools/random_generator.h"

namespace
{
    const std::vector<std::string> kCreateTables =
    {
        R"(CREATE TABLE IF NOT EXISTS `views_columns` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `id_view` VARCHAR(20) NOT NULL,
  `id_column` VARCHAR(20) NOT NULL,
  `position` DECIMAL(10,2) NULL DEFAULT 1.00 ,
  `visible` TINYINT NULL DEFAULT NULL ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `permissions` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `endpoint` VARCHAR(500) NOT NULL,
  `action` VARCHAR(10) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_group` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `databases` ( 
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
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `changes` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `id_row` VARCHAR(20) NOT NULL,
  `operation` VARCHAR(10) NOT NULL,
  `id_table` VARCHAR(20) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `views_filters` ( 
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
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `views_permissions` ( 
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
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `views` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_table` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_views_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `groups` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `group` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_groups_group` UNIQUE (`group`),
  CONSTRAINT `UQ_groups_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `tables` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NULL DEFAULT 'active' ,
  `change_int` INT NULL DEFAULT 1 ,
  `public_form` TINYINT NULL DEFAULT 0 ,
  `description` TEXT NULL DEFAULT NULL ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_database` VARCHAR(20) NOT NULL,
  `id_column_display` VARCHAR(20) NULL DEFAULT NULL ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_tables_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `databases_users` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_user` VARCHAR(20) NOT NULL,
  `id_database` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `views_sorts` ( 
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
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `settings` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `value` TEXT NULL DEFAULT NULL ,
  `updated_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`),
   CONSTRAINT `UQ_settings_name` UNIQUE (`name`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `endpoints` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `endpoint` VARCHAR(100) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `action` VARCHAR(10) NOT NULL DEFAULT '' ,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_endpoints_endpoint` UNIQUE (`endpoint`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `sessions` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(50) NOT NULL,
  `path` TEXT NOT NULL,
  `max_age` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp() ,
  `id_user` VARCHAR(20) NOT NULL,
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_sessions_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `tables_permissions` ( 
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
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `users` ( 
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
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `tables_columns` ( 
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
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `tables_row_policies` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `identifier` VARCHAR(20) NOT NULL,
  `id_table` VARCHAR(20) NOT NULL,
  `policy_name` VARCHAR(100) DEFAULT NULL,
  `target_type` VARCHAR(20) NOT NULL DEFAULT 'all',
  `target_id` VARCHAR(100) DEFAULT NULL,
  `action_type` VARCHAR(20) NOT NULL DEFAULT 'filter',
  `filter_column` VARCHAR(100) DEFAULT NULL,
  `filter_operator` VARCHAR(20) DEFAULT NULL,
  `filter_value` VARCHAR(500) DEFAULT NULL,
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `priority` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT current_timestamp(),
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_tables_row_policies_identifier` UNIQUE (`identifier`)
)
ENGINE = InnoDB;)",
        R"(CREATE TABLE IF NOT EXISTS `schema_patches` ( 
  `id` INT AUTO_INCREMENT NOT NULL,
  `patch_id` VARCHAR(100) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `applied_at` DATETIME NOT NULL DEFAULT current_timestamp(),
   PRIMARY KEY (`id`),
  CONSTRAINT `UQ_schema_patches_patch_id` UNIQUE (`patch_id`)
)
ENGINE = InnoDB;)"
    };

    const std::vector<std::string> kCreateIndexes =
    {
        R"(CREATE INDEX `IX_views_columns_position` ON `views_columns` (`position` ASC);)",
        R"(CREATE INDEX `FK_views_columns_id_column` ON `views_columns` (`id_column` ASC);)",
        R"(CREATE INDEX `FK_views_columns_id_view` ON `views_columns` (`id_view` ASC);)",
        R"(CREATE INDEX `IX_views_columns_visible` ON `views_columns` (`visible` ASC);)",
        R"(CREATE INDEX `IX_views_columns_created_at` ON `views_columns` (`created_at` ASC);)",
        R"(CREATE INDEX `FK_permissions_endpoint` ON `permissions` (`endpoint` ASC);)",
        R"(CREATE INDEX `FK_permissions_id_user` ON `permissions` (`id_group` ASC);)",
        R"(CREATE INDEX `IX_permissions_created_at` ON `permissions` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_permissions_action` ON `permissions` (`action` ASC);)",
        R"(CREATE INDEX `IX_databases_state` ON `databases` (`state` ASC);)",
        R"(CREATE INDEX `IX_databases_created_at` ON `databases` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_databases_name` ON `databases` (`name` ASC);)",
        R"(CREATE INDEX `IX_changes_operation` ON `changes` (`operation` ASC);)",
        R"(CREATE INDEX `IX_changes_created_at` ON `changes` (`created_at` ASC);)",
        R"(CREATE INDEX `FK_changes_id_table` ON `changes` (`id_table` ASC);)",
        R"(CREATE INDEX `IX_changes_id_row` ON `changes` (`id_row` ASC);)",
        R"(CREATE INDEX `IX_views_filters_value` ON `views_filters` (`value` ASC);)",
        R"(CREATE INDEX `IX_views_filters_op` ON `views_filters` (`op` ASC);)",
        R"(CREATE INDEX `FK_views_filters_id_column` ON `views_filters` (`id_column` ASC);)",
        R"(CREATE INDEX `FK_views_filters_id_view` ON `views_filters` (`id_view` ASC);)",
        R"(CREATE INDEX `IX_views_filters_created_at` ON `views_filters` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_views_filters_position` ON `views_filters` (`position` ASC);)",
        R"(CREATE INDEX `FK_views_permissions_id_view` ON `views_permissions` (`id_view` ASC);)",
        R"(CREATE INDEX `IX_views_permissions_delete` ON `views_permissions` (`delete` ASC);)",
        R"(CREATE INDEX `IX_views_permissions_add` ON `views_permissions` (`add` ASC);)",
        R"(CREATE INDEX `IX_views_permissions_read` ON `views_permissions` (`read` ASC);)",
        R"(CREATE INDEX `FK_views_permissions_id_user` ON `views_permissions` (`id_user` ASC);)",
        R"(CREATE INDEX `IX_views_permissions_modify` ON `views_permissions` (`modify` ASC);)",
        R"(CREATE INDEX `IX_views_name` ON `views` (`name` ASC);)",
        R"(CREATE INDEX `IX_views_created_at` ON `views` (`created_at` ASC);)",
        R"(CREATE INDEX `FK_views_id_table` ON `views` (`id_table` ASC);)",
        R"(CREATE INDEX `IX_groups_created_at` ON `groups` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_groups_group` ON `groups` (`group` ASC);)",
        R"(CREATE INDEX `IX_tables_state` ON `tables` (`state` ASC);)",
        R"(CREATE INDEX `IX_tables_created_at` ON `tables` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_tables_public_form` ON `tables` (`public_form` ASC);)",
        R"(CREATE INDEX `IX_tables_identifier` ON `tables` (`identifier` ASC);)",
        R"(CREATE INDEX `IX_tables_name` ON `tables` (`name` ASC);)",
        R"(CREATE INDEX `FK_tables_id_database` ON `tables` (`id_database` ASC);)",
        R"(CREATE INDEX `FK_databases_users_id_database` ON `databases_users` (`id_database` ASC);)",
        R"(CREATE INDEX `IX_databases_users_created_at` ON `databases_users` (`created_at` ASC);)",
        R"(CREATE INDEX `FK_databases_users_id_user` ON `databases_users` (`id_user` ASC);)",
        R"(CREATE INDEX `IX_views_sort_created_at` ON `views_sorts` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_views_sort_is_active` ON `views_sorts` (`is_active` ASC);)",
        R"(CREATE INDEX `FK_views_sort_id_view` ON `views_sorts` (`id_view` ASC);)",
        R"(CREATE INDEX `FK_views_sort_id_column` ON `views_sorts` (`id_column` ASC);)",
        R"(CREATE INDEX `IX_views_sort_sort` ON `views_sorts` (`sort` ASC);)",
        R"(CREATE INDEX `IX_views_sort_position` ON `views_sorts` (`position` ASC);)",
        R"(CREATE INDEX `IX_settings_updated_at` ON `settings` (`updated_at` ASC);)",
        R"(CREATE INDEX `IX_settings_name` ON `settings` (`name` ASC);)",
        R"(CREATE INDEX `IX_endpoints_title` ON `endpoints` (`title` ASC);)",
        R"(CREATE INDEX `IX_endpoints_action` ON `endpoints` (`action` ASC);)",
        R"(CREATE INDEX `IX_endpoints_created_at` ON `endpoints` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_sessions_identifier` ON `sessions` (`identifier` ASC);)",
        R"(CREATE INDEX `IX_sessions_path` ON `sessions` (`path` ASC);)",
        R"(CREATE INDEX `IX_sessions_max_age` ON `sessions` (`max_age` ASC);)",
        R"(CREATE INDEX `FK_sessions_id_user` ON `sessions` (`id_user` ASC);)",
        R"(CREATE INDEX `IX_sessions_created_at` ON `sessions` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_tables_permissions_created_at` ON `tables_permissions` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_tables_permissions_add` ON `tables_permissions` (`add` ASC);)",
        R"(CREATE INDEX `FK_tables_permissions_id_table` ON `tables_permissions` (`id_table` ASC);)",
        R"(CREATE INDEX `IX_tables_permissions_modify` ON `tables_permissions` (`modify` ASC);)",
        R"(CREATE INDEX `FK_tables_permissions_id_user` ON `tables_permissions` (`id_user` ASC);)",
        R"(CREATE INDEX `IX_tables_permissions_delete` ON `tables_permissions` (`delete` ASC);)",
        R"(CREATE INDEX `IX_tables_permissions_read` ON `tables_permissions` (`read` ASC);)",
        R"(CREATE INDEX `IX_users_password` ON `users` (`password` ASC);)",
        R"(CREATE INDEX `IX_users_username` ON `users` (`username` ASC);)",
        R"(CREATE INDEX `IX_users_type` ON `users` (`type` ASC);)",
        R"(CREATE INDEX `IX_users_status` ON `users` (`status` ASC);)",
        R"(CREATE INDEX `IX_users_created_at` ON `users` (`created_at` ASC);)",
        R"(CREATE INDEX `FK_users_id_group` ON `users` (`id_group` ASC);)",
        R"(CREATE INDEX `IX_tables_columns_name` ON `tables_columns` (`name` ASC);)",
        R"(CREATE INDEX `IX_tables_columns_required` ON `tables_columns` (`required` ASC);)",
        R"(CREATE INDEX `FK_tables_columns_id_table` ON `tables_columns` (`id_table` ASC);)",
        R"(CREATE INDEX `IX_tables_columns_created_at` ON `tables_columns` (`created_at` ASC);)",
        R"(CREATE INDEX `IX_tables_columns_default_value` ON `tables_columns` (`default_value` ASC);)",
        R"(CREATE INDEX `IX_tables_columns_identifier` ON `tables_columns` (`identifier` ASC);)",
        R"(CREATE INDEX `IX_tables_columns_link_to` ON `tables_columns` (`link_to` ASC);)",
        R"(CREATE INDEX `FK_tables_columns_id_column_type` ON `tables_columns` (`column_type` ASC);)"
    };

    const std::vector<std::string> kCreateForeignKeys =
    {
        R"(ALTER TABLE `views_columns` ADD CONSTRAINT `FK_views_columns_id_column` FOREIGN KEY (`id_column`) REFERENCES `tables_columns` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `views_columns` ADD CONSTRAINT `FK_views_columns_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `permissions` ADD CONSTRAINT `FK_permissions_id_group` FOREIGN KEY (`id_group`) REFERENCES `groups` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `changes` ADD CONSTRAINT `FK_changes_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `views_filters` ADD CONSTRAINT `FK_views_filters_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `views_filters` ADD CONSTRAINT `FK_views_filters_id_column` FOREIGN KEY (`id_column`) REFERENCES `tables_columns` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `views_permissions` ADD CONSTRAINT `FK_views_permissions_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `views_permissions` ADD CONSTRAINT `FK_views_permissions_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `views` ADD CONSTRAINT `FK_views_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `tables` ADD CONSTRAINT `FK_tables_id_database` FOREIGN KEY (`id_database`) REFERENCES `databases` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `tables` ADD CONSTRAINT `FK_tables_id_column_display` FOREIGN KEY (`id_column_display`) REFERENCES `tables_columns` (`identifier`) ON DELETE SET NULL ON UPDATE CASCADE;)",
        R"(ALTER TABLE `databases_users` ADD CONSTRAINT `FK_databases_users_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `databases_users` ADD CONSTRAINT `FK_databases_users_id_database` FOREIGN KEY (`id_database`) REFERENCES `databases` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `views_sorts` ADD CONSTRAINT `FK_views_sort_id_column` FOREIGN KEY (`id_column`) REFERENCES `tables_columns` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `views_sorts` ADD CONSTRAINT `FK_views_sort_id_view` FOREIGN KEY (`id_view`) REFERENCES `views` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `sessions` ADD CONSTRAINT `FK_sessions_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `tables_permissions` ADD CONSTRAINT `FK_tables_permissions_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `tables_permissions` ADD CONSTRAINT `FK_tables_permissions_id_user` FOREIGN KEY (`id_user`) REFERENCES `users` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `users` ADD CONSTRAINT `FK_users_id_group` FOREIGN KEY (`id_group`) REFERENCES `groups` (`identifier`) ON DELETE SET NULL ON UPDATE CASCADE;)",
        R"(ALTER TABLE `tables_columns` ADD CONSTRAINT `FK_tables_columns_id_table` FOREIGN KEY (`id_table`) REFERENCES `tables` (`identifier`) ON DELETE CASCADE ON UPDATE CASCADE;)",
        R"(ALTER TABLE `tables_columns` ADD CONSTRAINT `FK_tables_columns_link_to` FOREIGN KEY (`link_to`) REFERENCES `tables` (`identifier`) ON DELETE SET NULL ON UPDATE CASCADE;)"
    };

    struct PatchDef
    {
        std::string id;
        std::string description;
        std::string sql;
    };

    const std::vector<PatchDef> kPatches =
    {
        {"001_remove_uq_tables_id_column_display",
         "Remove UNIQUE constraint on tables.id_column_display to allow multiple tables to share the same display column identifier.",
         "ALTER TABLE `tables` DROP INDEX `UQ_tables_id_column_display`"}
    };

    const std::string kSeedEndpoints = R"(INSERT IGNORE INTO `endpoints` (`endpoint`, `title`, `action`) VALUES
('/api/tables/add', 'Tables: Add', 'POST'),
('/api/tables/columns/add', 'Columns: Add', 'POST'),
('/api/tables/columns/delete', 'Columns: Delete', 'DEL'),
('/api/tables/columns/modify', 'Columns: Modify', 'PUT'),
('/api/tables/columns/read', 'Columns: Read', 'GET'),
('/api/tables/columns/read/identifier', 'Columns: Read (1)', 'GET'),
('/api/tables/columns/types/read', 'Columns: Types: Read', 'GET'),
('/api/tables/data/add', 'Data: Add', 'POST'),
('/api/tables/data/columns/read', 'Data: Columns: Read', 'GET'),
('/api/tables/data/delete', 'Data: Delete', 'DEL'),
('/api/tables/data/file/read', 'Data: File: Read', 'GET'),
('/api/tables/data/modify', 'Data: Modify', 'PUT'),
('/api/tables/data/modify/changeInt', 'Data: Changes: Modify', 'PUT'),
('/api/tables/data/read', 'Data: Read', 'GET'),
('/api/tables/data/read/changeInt', 'Data: Changes: Read', 'GET'),
('/api/tables/data/read/identifier', 'Data: Read (1)', 'GET'),
('/api/tables/delete', 'Tables: Delete', 'DEL'),
('/api/tables/modify', 'Tables: Modify', 'PUT'),
('/api/tables/permissions/add', 'Tables: Permissions: Add', 'POST'),
('/api/tables/permissions/delete', 'Tables: Permissions: Delete', 'DEL'),
('/api/tables/permissions/modify', 'Tables: Permissions: Modify', 'PUT'),
('/api/tables/permissions/read', 'Tables: Permissions: Read', 'GET'),
('/api/tables/permissions/read/identifier', 'Tables: Permissions: Read (1)', 'GET'),
('/api/tables/permissions/users/out/read', 'Tables: Permissions: Users Out: Read', 'GET'),
('/api/tables/read', 'Tables: Read', 'GET'),
('/api/tables/read/identifier', 'Tables: Read (1)', 'GET'),
('/api/general/groups/add', 'Groups: Add', 'POST'),
('/api/general/groups/delete', 'Groups: Delete', 'DEL'),
('/api/general/groups/modify', 'Groups: Modify', 'PUT'),
('/api/general/groups/read', 'Groups: Read', 'GET'),
('/api/general/groups/read/identifier', 'Groups: Read (1)', 'GET'),
('/api/general/instanceName/modify', 'Instance: Name: Modify', 'PUT'),
('/api/general/instanceName/read', 'Instance: Name: Read', 'GET'),
('/api/general/permissions/add', 'Permissions: Add', 'POST'),
('/api/general/permissions/delete', 'Permissions: Delete', 'DEL'),
('/api/general/permissions/read', 'Permissions: Read', 'GET'),
('/api/general/users/add', 'Users: Add', 'POST'),
('/api/general/users/current/password/modify', 'Users: Current Password: Modify', 'PUT'),
('/api/general/users/current/read', 'Users: Current User: Read', 'GET'),
('/api/general/users/current/username/modify', 'Users: Current Username: Modify', 'PUT'),
('/api/general/users/delete', 'Users: Delete', 'DEL'),
('/api/general/users/modify', 'Users: Modify', 'PUT'),
('/api/general/users/read', 'Users: Read', 'GET'),
('/api/general/users/read/identifier', 'Users: Read (1)', 'GET'),
('/api/databases/add', 'Databases: Add', 'POST'),
('/api/databases/change', 'Databases: Change', 'POST'),
('/api/databases/delete', 'Databases: Delete', 'DEL'),
('/api/databases/modify', 'Databases: Modify', 'PUT'),
('/api/databases/read', 'Databases: Read', 'GET'),
('/api/databases/read/identifier', 'Databases: Read (1)', 'GET'),
('/api/databases/users/add', 'Databases: Users: Add', 'POST'),
('/api/databases/users/delete', 'Databases: Users: Delete', 'DEL'),
('/api/databases/users/out/read', 'Databases: Users Out: Read', 'GET'),
('/api/databases/users/read', 'Databases: Users: Read', 'GET'),
('/api/general/permissions/out/read', 'Permissions: Out: Read', 'GET'),
('/api/general/instanceLogo/read', 'Instance: Logo: Read', 'GET'),
('/api/general/instanceLogo/modify', 'Instance: Logo: Modify', 'PUT'),
('/api/tables/data/import', 'Data: Import', 'POST'),
('/api/tables/views/read', 'Views: Read', 'GET'),
('/api/tables/views/add', 'Views: Add', 'POST'),
('/api/tables/views/modify', 'Views: Modify', 'PUT'),
('/api/tables/views/delete', 'Views: Delete', 'DEL'),
('/api/tables/views/read/identifier', 'Views: Read (1)', 'GET'),
('/api/databases/users/current/read', 'Databases: Users: Current: Read', 'GET'),
('/api/forms/columns/read', 'Forms: Columns: Read', 'GET'),
('/api/tables/permissions/current/read', 'Tables: Permissions: Current: Read', 'GET'),
('/api/tables/columns/position/modify', 'Columns: Position: Modify', 'PUT'),
('/api/tables/columns/visible/modify', 'Columns: Visible: Modify', 'PUT'),
('/api/tables/filters/read', 'Filters: Read', 'GET'),
('/api/tables/filters/add', 'Filters: Add', 'POST'),
('/api/tables/filters/modify', 'Filters: Modify', 'PUT'),
('/api/tables/filters/delete', 'Filters: Delete', 'DEL'),
('/api/tables/filters/position/modify', 'Filters: Position: Modify', 'PUT'),
('/api/tables/filters/visible/modify', 'Filters: Visible: Modify', 'PUT'),
('/api/tables/sorts/read', 'Sorts: Read', 'GET'),
('/api/tables/sorts/add', 'Sorts: Add', 'POST'),
('/api/tables/sorts/modify', 'Sorts: Modify', 'PUT'),
('/api/tables/sorts/delete', 'Sorts: Delete', 'DEL'),
('/api/tables/sorts/position/modify', 'Sorts: Position: Modify', 'PUT'),
('/api/tables/sorts/visible/modify', 'Sorts: Visible: Modify', 'PUT'),
('/api/general/users/apikey/read', 'Users: API Key: Read', 'GET'),
('/api/general/users/apikey/generate', 'Users: API Key: Generate', 'PUT'),
('/api/general/users/apikey/revoke', 'Users: API Key: Revoke', 'PUT');)";

    void InsertSeedData_(Poco::Data::Session& session)
    {
        int count = 0;
        session << "SELECT COUNT(*) FROM `users` WHERE `username` = 'admin'", Poco::Data::Keywords::into(count), Poco::Data::Keywords::now;

        if (count > 0)
        {
            std::cout << "[SchemaInitializer] Seed data already exists. Skipping." << std::endl;
            return;
        }

        StructBX::Tools::RandomGenerator rng;
        auto db_id = rng.GenerateAlphanumericID_(20);
        auto user_id = rng.GenerateAlphanumericID_(20);
        auto password_hash = StructBX::Tools::HMACTool().Encode_("admin");

        session << "CREATE DATABASE IF NOT EXISTS `" + db_id + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", Poco::Data::Keywords::now;
        std::cout << "[SchemaInitializer] Seed: Physical database created (id=" << db_id << ")." << std::endl;

        session << "INSERT INTO `databases` (`identifier`, `name`, `state`) VALUES ('" + db_id + "', 'Default', 'active')", Poco::Data::Keywords::now;
        std::cout << "[SchemaInitializer] Seed: Default database created (id=" << db_id << ")." << std::endl;

        session << "INSERT INTO `users` (`identifier`, `username`, `password`, `status`, `type`) VALUES ('" + user_id + "', 'admin@admin', '" + password_hash + "', 'active', 'admin')", Poco::Data::Keywords::now;
        std::cout << "[SchemaInitializer] Seed: Admin user created (id=" << user_id << ")." << std::endl;

        session << "INSERT INTO `databases_users` (`id_user`, `id_database`) VALUES ('" + user_id + "', '" + db_id + "')", Poco::Data::Keywords::now;
        std::cout << "[SchemaInitializer] Seed: User-database assignment created." << std::endl;

        session << kSeedEndpoints, Poco::Data::Keywords::now;
        std::cout << "[SchemaInitializer] Seed: Endpoints inserted." << std::endl;

        session << "INSERT INTO `settings` (`name`, `value`) VALUES ('instance_name', 'StructBX')", Poco::Data::Keywords::now;
        std::cout << "[SchemaInitializer] Seed: Setting 'instance_name' inserted." << std::endl;

        session << "INSERT INTO `settings` (`name`, `value`) VALUES ('instance_logo', NULL)", Poco::Data::Keywords::now;
        std::cout << "[SchemaInitializer] Seed: Setting 'instance_logo' inserted." << std::endl;
    }

    void ApplyPatches_(Poco::Data::Session& session)
    {
        // Collect already-applied patches
        std::vector<std::string> applied;
        try
        {
            Poco::Data::Statement stmt(session);
            stmt << "SELECT `patch_id` FROM `schema_patches` ORDER BY `id` ASC",
                Poco::Data::Keywords::into(applied);
            stmt.execute();
        }
        catch (Poco::Exception& e)
        {
            std::cerr << "[SchemaInitializer] Warning (patches read): " << e.displayText() << std::endl;
            return;
        }

        for (const auto& patch : kPatches)
        {
            auto it = std::find(applied.begin(), applied.end(), patch.id);
            if (it != applied.end())
                continue;

            try
            {
                session << patch.sql, Poco::Data::Keywords::now;
                std::string pid = patch.id;
                std::string pdesc = patch.description;
                session << "INSERT INTO `schema_patches` (`patch_id`, `description`) VALUES (?, ?)",
                    Poco::Data::Keywords::use(pid),
                    Poco::Data::Keywords::use(pdesc),
                    Poco::Data::Keywords::now;
                std::cout << "[SchemaInitializer] Patch applied: " << patch.id << " - " << patch.description << std::endl;
            }
            catch (Poco::Exception& e)
            {
                std::cerr << "[SchemaInitializer] Error applying patch '" << patch.id << "': " << e.displayText() << std::endl;
            }
        }
    }
}

void StructBX::Query::SchemaInitializer::Initialize_()
{
    auto db_host = Tools::SettingsManager::GetSetting_("db_host", "127.0.0.1");
    auto db_port = Tools::SettingsManager::GetSetting_("db_port", "3306");
    auto db_name = Tools::SettingsManager::GetSetting_("db_name", "");
    auto db_user = Tools::SettingsManager::GetSetting_("db_user", "");
    auto db_password = Tools::SettingsManager::GetSetting_("db_password", "");

    if (db_name.empty())
        throw Poco::Exception("[SchemaInitializer] 'db_name' is not configured in properties file.");

    std::cout << "[SchemaInitializer] Initializing database '" << db_name << "'..." << std::endl;

    // Step 1: Ensure the database exists
    {
        Poco::Data::Session session("MySQL",
            "host=" + db_host + ";port=" + db_port + ";user=" + db_user + ";password=" + db_password + ";");
        session << "CREATE DATABASE IF NOT EXISTS `" + db_name + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", Poco::Data::Keywords::now;
        std::cout << "[SchemaInitializer] Database ensured." << std::endl;
    }

    // Step 2: Connect to the database and create schema objects
    Poco::Data::Session session("MySQL",
        "host=" + db_host + ";port=" + db_port + ";db=" + db_name + ";user=" + db_user + ";password=" + db_password + ";");

    for (const auto& stmt : kCreateTables)
    {
        try
        {
            session << stmt, Poco::Data::Keywords::now;
        }
        catch (Poco::Exception& e)
        {
            std::cerr << "[SchemaInitializer] Warning (table): " << e.displayText() << std::endl;
        }
    }
    std::cout << "[SchemaInitializer] Tables created." << std::endl;

    for (const auto& stmt : kCreateIndexes)
    {
        try
        {
            session << stmt, Poco::Data::Keywords::now;
        }
        catch (Poco::Exception& e)
        {
            std::cerr << "[SchemaInitializer] Warning (index): " << e.displayText() << std::endl;
        }
    }
    std::cout << "[SchemaInitializer] Indexes created." << std::endl;

    for (const auto& stmt : kCreateForeignKeys)
    {
        try
        {
            session << stmt, Poco::Data::Keywords::now;
        }
        catch (Poco::Exception& e)
        {
            std::cerr << "[SchemaInitializer] Warning (FK): " << e.displayText() << std::endl;
        }
    }
    std::cout << "[SchemaInitializer] Foreign keys created." << std::endl;

    InsertSeedData_(session);

    ApplyPatches_(session);

    std::cout << "[SchemaInitializer] Database initialization completed successfully." << std::endl;
}
