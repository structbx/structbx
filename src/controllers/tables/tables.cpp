
#include "controllers/tables/tables.h"
#include "controllers/tables/column_types.h"
#include "functions/action.h"
#include "tools/random_generator.h"
#include "core/error_codes.h"
#include <Poco/JSON/Object.h>

using namespace StructBX::Controllers::Tables;

Tables::Tables(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,function_data_(function_data)
    ,function_columns_(function_data)
    ,function_permissions_(function_data)
    ,function_views_(function_data)
    ,function_filters_(function_data)
    ,function_sorts_(function_data)
    ,struct_read_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

Tables::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/read", HTTP::EnumMethods::kHTTP_GET);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action1: Read all tables en database
    auto action1 = function->AddAction_("read_tables_by_database");
    ReadTablesByDatabase(action1);

    // Setup custom process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1](StructBX::Functions::Function& self)
    {
        // Action1: Read all tables en database
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Table not found in current database.", ERR_TBL_NOT_FOUND);
            return;
        }

        // Iterate over results
        for(auto row : *action1->get_results())
        {
            // Get table identifier
            auto identifier = row->ExtractField_("identifier");
            if(identifier->IsNull_())
                continue;

            // Action 2: COUNT
            auto action2 = Functions::Action("count_table_records");
            action2.set_sql_code(
                "SELECT COUNT(1) AS total " \
                "FROM " + database_id + "." + identifier.get()->ToString_());
            if(!action2.Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to count table records.", ERR_ACTION_FAILED);
                return;
            }

            // Get results
            auto total = action2.get_results()->First_();
            if(total->IsNull_())
                continue;

            row->AddField_("total", Tools::DValue::Ptr(new Tools::DValue(total->Int_())));
        }

        // JSON Results
        auto json_results = action1->CreateJSONResult_();

        // Send results
        self.CompoundResponse_(HTTP::Status::kHTTP_OK, json_results);
    });

    get_functions()->push_back(function);
}

void Tables::Read::ReadTablesByDatabase(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT identifier, name, state, public_form, description, id_column_display " \
        "FROM tables " \
        "WHERE " \
            "id_database = ?"
    );
    action->AddParameter_("database_identifier", get_database_id(), false);
}

Tables::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/read/identifier
    StructBX::Functions::Function::Ptr function1 = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/read/identifier", HTTP::EnumMethods::kHTTP_GET);

    // Action1: Read specific table by identifier
    auto action1 = function1->AddAction_("read_table_by_identifier");
    ReadTableByIdentifier(action1);

    get_functions()->push_back(function1);
}

void Tables::ReadSpecific::ReadTableByIdentifier(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "identifier, name, state, public_form, description, id_column_display " \
        "FROM tables " \
        "WHERE " \
            "identifier = ? "
    );

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

Tables::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/add", HTTP::EnumMethods::kHTTP_POST);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Lambda function to delete table (error case)
    auto delete_table = [](std::string table_identifier)
    {
        // Delete from tables
        StructBX::Functions::Action tmp_action("");
        tmp_action.set_sql_code("DELETE FROM tables WHERE identifier = ?");
        tmp_action.AddParameter_("identifier", table_identifier, false);
        tmp_action.Work_();
    };

    // Action 1: Verify that the table name don't exists in current database
    auto action1 = function->AddAction_("verify_table_name_not_taken");
    VerifyTableNameNotTaken(action1);

    // Action 2: Add the new table
    auto action2 = function->AddAction_("insert_table_metadata");
    InsertTableMetadata(action2);
    
    // Action: Add default view
    auto add_view = function->AddAction_("add_view");
    AddView(add_view);

    // Action: Add default column
    auto add_default_column = function->AddAction_("add_default_column");
    AddDefaultColumn(add_default_column);

    // Action 3_1: Add table permissions to current user
    auto action3_1 = function->AddAction_("grant_creator_full_permissions");
    GrantCreatorFullPermissions(action3_1);

    // Action 4: Create the table
    auto action4 = function->AddAction_("create_mysql_table");
    
    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_(
        [
            add_default_column, delete_table, database_id, action1, action2
            ,action3_1, action4, add_view
        ](StructBX::Functions::Function& self)
    {
        Tools::RandomGenerator rg;
        auto table_identifier = rg.GenerateAlphanumericID_(20);
        
        // Action 1: Verify that the table name don't exists in current database
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Table name verification failed.", ERR_TBL_NOT_FOUND);
            return;
        }
        // Action 2: Add the new table
        action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(table_identifier)), "identifier");
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Failed to add new table.", ERR_TBL_CREATE_FAIL);
            return;
        }

        // Action 3_1: Add table permissions to current user
        action3_1->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(table_identifier)), "table_identifier");
        if(!action3_1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action3_1->get_custom_error(), action3_1->get_custom_error_code());
            return;
        }

        // Action: Add default view
        auto view_identifier = rg.GenerateAlphanumericID_(20);
        add_view->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(view_identifier)), "identifier");
        add_view->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(table_identifier)), "table_identifier");
        if(!add_view->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, add_view->get_custom_error(), add_view->get_custom_error_code());
            return;
        }

        // Action: Add default column
        auto default_column = rg.GenerateAlphanumericID_(20);
        add_default_column->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(default_column)), "identifier");
        add_default_column->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(table_identifier)), "table_identifier");
        if(!add_default_column->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, add_default_column->get_custom_error(), add_default_column->get_custom_error_code());
            return;
        }

        // Action 4: Create the table
        action4->set_sql_code(
            "CREATE TABLE " + database_id + "." + table_identifier + " " \
            "(" \
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, " \
                "identifier VARCHAR(20) NOT NULL UNIQUE, " \
                "" + default_column + " VARCHAR(500) NULL, " \
                "_structbx_column_created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " \
                "_structbx_column_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " \
                "_structbx_column_user_owner VARCHAR(20) NULL, " \
                "_structbx_column_colorHeader VARCHAR(100) DEFAULT NULL, " \
                "INDEX (_structbx_column_created_at) USING BTREE, " \
                "INDEX (_structbx_column_updated_at) USING BTREE, " \
                "INDEX (_structbx_column_user_owner) USING BTREE, " \
                "INDEX (_structbx_column_colorHeader) USING BTREE " \
            ")"
        );
        if(!action4->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to create the table.", ERR_TBL_CREATE_FAIL);
            delete_table(table_identifier);

            return;
        }

        // Create the directory to store files
        try
        {
            auto directory = Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded");
            directory += "/" + database_id + "/" + table_identifier;
            Poco::File file(directory);
            if(file.exists())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
                return;
            }
            if(!file.createDirectory())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to create table file directory.", ERR_DB_DIR_CREATE_FAIL);
                delete_table(table_identifier);
                return;
            }

            // Send results
            self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
        }
        catch(Poco::FileException& e)
        {
            delete_table(table_identifier);
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/tables.cpp on Add::Add(): " + e.displayText());
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to create form file directory.", ERR_DB_DIR_CREATE_FAIL);
            return;
        }
        catch(std::exception& e)
        {
            delete_table(table_identifier);
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/tables.cpp on Add::Add(): " + std::string(e.what()));
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to create form file directory.", ERR_DB_DIR_CREATE_FAIL);
            return;
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Tables::Add::VerifyTableNameNotTaken(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT id FROM tables WHERE name = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("A table with this name already exists in this database.");
            self.set_custom_error_code(ERR_TBL_CREATE_FAIL);
            return false;
        }

        return true;
    });

    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The name cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_database", get_database_id(), false);
}

void Tables::Add::InsertTableMetadata(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("INSERT INTO tables (identifier, name, state, public_form, description, id_database) VALUES (?, ?, ?, ?, ?, ?)");

    action->AddParameter_("identifier", "", false);
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("The name must be a string.");
            return false;
        }
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The name cannot be empty.");
            return false;
        }
        if(param->get_value()->ToString_().size() < 3)
        {
            param->set_error("The name must be at least 3 characters.");
            return false;
        }
        return true;
    });
    action->AddParameter_("state", "", true);
    action->AddParameter_("public_form", 0, true);
    action->AddParameter_("description", "", true);
    action->AddParameter_("id_database", get_database_id(), false);
}

void Tables::Add::GrantCreatorFullPermissions(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_permissions (identifier, `read`, `add`, `modify`, `delete`, id_user, id_table) " \
        "SELECT ?, 1, 1, 1, 1, ?, ?"
    );

    auto identifier = Tools::RandomGenerator().GenerateAlphanumericID_(20);
    action->AddParameter_("identifier", identifier, false);
    action->AddParameter_("user_id", get_id_user(), false);
    action->AddParameter_("table_identifier", 0, false);
}

void Tables::Add::AddView(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO views (identifier, name, id_table) " \
        "VALUES (?, ?, ?)"
    );

    action->AddParameter_("identifier", "", false);
    action->AddParameter_("name", "Default", false);
    action->AddParameter_("table_identifier", 0, false);
}

void Tables::Add::AddDefaultColumn(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_columns (identifier, name, column_type, id_table) " \
        "VALUES (?, ?, ?, ?)"
    );

    action->AddParameter_("identifier", "", false);
    action->AddParameter_("name", "Default", false);
    action->AddParameter_("column_type", std::string(ColumnType::Text), false);
    action->AddParameter_("table_identifier", 0, false);
}

Tables::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function PUT /api/tables/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/modify", HTTP::EnumMethods::kHTTP_PUT);

    // Action 1: Verify tables existence
    auto action1 = function->AddAction_("verify_table_exists");
    VerifyTableExists(action1);

    // Action 2: Verify that the table identifier don't exists
    auto action2 = function->AddAction_("verify_table_new_name");
    VerifyTableNewName(action2);

    // Action 3: Modify table
    auto action3 = function->AddAction_("update_table_metadata");
    UpdateTableMetadata(action3);

    get_functions()->push_back(function);
}

void Tables::Modify::VerifyTableExists(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT id FROM tables WHERE identifier = ? AND id_database = ?");
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("The requested table does not exist.");
            self.set_custom_error_code(ERR_TBL_NOT_FOUND);
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_identifier", get_database_id(), false);
}

void Tables::Modify::VerifyTableNewName(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT id FROM tables WHERE name = ? AND identifier != ? AND id_database = ?");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("A table with this name already exists in this database.");
            self.set_custom_error_code(ERR_TBL_UPDATE_FAIL);
            return false;
        }

        return true;
    });

    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The name cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The identifier cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_id", get_database_id(), false);
}

void Tables::Modify::UpdateTableMetadata(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE tables " \
        "SET name = ?, state = ?, public_form = ?, description = ? " \
        "WHERE identifier = ? AND id_database = ?"
    );

    // Parameters and conditions
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("The name must be a string.");
            return false;
        }
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The name cannot be empty.");
            return false;
        }
        if(param->get_value()->ToString_().size() < 3)
        {
            param->set_error("The name must be at least 3 characters.");
            return false;
        }
        return true;
    });
    action->AddParameter_("state", "", true);
    action->AddParameter_("public_form", 0, true);
    action->AddParameter_("description", "", true);

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_id", get_database_id(), false);
}

Tables::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function DEL /api/tables/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/delete", HTTP::EnumMethods::kHTTP_DEL);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Verify table existence
    auto action1 = function->AddAction_("verify_table_exists_for_delete");
    VerifyTableExistsForDelete(action1);

    // Action 2: Delete table record
    auto action2 = function->AddAction_("delete_table_metadata");
    DeleteTableMetadata(action2);

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2](StructBX::Functions::Function& self)
    {
        // Action 1: Verify tables existence
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Table existence verification failed.", ERR_TBL_NOT_FOUND);
            return;
        }
            
        auto identifier = self.GetParameter_("identifier");
        if(identifier == action1->get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Table identifier not provided.", ERR_TBL_ID_EMPTY);
            return;
        }

        // Action 3: Drop table
        auto action3 = self.AddAction_("drop_mysql_table");
        action3->set_sql_code("DROP TABLE IF EXISTS " + database_id + "." + identifier->get()->ToString_());
        if(!action3->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Cannot delete table, there are references to it.", ERR_TBL_DELETE_FAIL);
            return;
        }

        // Action 2: Delete table record
        self.IdentifyParameters_(action2);
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to delete table record.", ERR_TBL_DELETE_FAIL);
            return;
        }

        // Delete table directory
        try
        {
            auto directory = StructBX::Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded");
            directory += "/" + database_id + "/" + identifier->get()->ToString_();
            Poco::File file(directory);
            if(file.exists())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
                return;
            }
            file.remove(true);

            // Send results
            self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
        }
        catch(Poco::FileException& e)
        {
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/tables.cpp on Delete::Delete(): " + e.displayText());
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to delete form file directory.", ERR_DB_DIR_CREATE_FAIL);
            return;
        }
        catch(std::exception& e)
        {
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/tables.cpp on Delete::Delete(): " + std::string(e.what()));
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to delete form file directory.", ERR_DB_DIR_CREATE_FAIL);
            return;
        }
        
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Tables::Delete::VerifyTableExistsForDelete(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT identifier FROM tables WHERE identifier = ? AND id_database = ?");
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("The requested table does not exist.");
            self.set_custom_error_code(ERR_TBL_NOT_FOUND);
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_identifier", get_database_id(), false);
}

void Tables::Delete::DeleteTableMetadata(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("DELETE FROM tables WHERE identifier = ? AND id_database = ?");
    action->AddParameter_("identifier", "", true);
    action->AddParameter_("database_identifier", get_database_id(), false);
}
