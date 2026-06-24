
#include "controllers/databases/databases.h"
#include "core/error_codes.h"

using namespace StructBX::Controllers::Databases;

Databases::Databases(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,function_users_(function_data)
    ,struct_read_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_change_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

Databases::Read::Read(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/read", HTTP::EnumMethods::kHTTP_GET);
    
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    auto action = function->AddAction_("a1");
    A1(action);

    // Setup custom process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The user is not in any database.", ERR_DB_NOT_FOUND);
            return;
        }

        // Iterate over results
        for(auto row : *action->get_results())
        {
            // Get database identifier
            auto identifier = row->ExtractField_("identifier");
            if(identifier->IsNull_())
                continue;

            // Action 2: Size
            auto action2 = StructBX::Functions::Action("a2");
            action2.set_sql_code(
                "SELECT ROUND(SUM((DATA_LENGTH + INDEX_LENGTH)) / 1024 / 1024, 2) AS 'size' " \
                "FROM information_schema.TABLES " \
                "WHERE TABLE_SCHEMA = '" + identifier->ToString_() + "'"
            );
            if(!action2.Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Action failed.", ERR_ACTION_FAILED);
                return;
            }

            // Size of database directory
            auto directory = StructBX::Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded");
            directory += "/" + identifier->ToString_();
            float directory_size = 0;

            // Verify if directory exists
            Poco::File file(directory);
            if(!file.exists())
            {
                try
                {
                    file.createDirectory();
                }
                catch(Poco::FileException& e)
                {
                    StructBX::Tools::OutputLogger::Error_("Could not create directory " + directory + ": " + e.displayText());
                }
            }
            if(file.isDirectory())
            {
                DirectoryIterator it(directory);
                DirectoryIterator end;
                while (it != end)
                {
                    if(it->isDirectory())
                    {
                        directory_size += it->getSize();
                        DirectoryIterator it2(it.path());
                        while (it2 != end)
                        {
                            directory_size += it2->getSize();
                            ++it2;
                        }
                    }
                    else
                        directory_size += it->getSize();

                    ++it;
                }
                directory_size = directory_size / 1024.f / 1024.f;
            }

            // Get results
            auto size = action2.get_results()->First_();
            if(size->IsNull_())
            {
                row->AddField_("size", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(0)));
                row->AddField_("directory_size", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(directory_size)));
            }
            else
            {
                row->AddField_("size", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(size->Float_())));
                row->AddField_("directory_size", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(directory_size)));
            }

        }

        // JSON Results
        auto json_results = action->CreateJSONResult_();

        // Send results
        self.CompoundResponse_(HTTP::Status::kHTTP_OK, json_results);
    });

    get_functions()->push_back(function);
}

void Databases::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.identifier, s.name, s.state, s.logo, s.description, s.created_at " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.identifier " \
        "WHERE su.id_user = ?"
    );
    action->AddParameter_("id_user", get_id_user(), false);
}

Databases::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/read/identifier
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/read/identifier", HTTP::EnumMethods::kHTTP_GET);
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    auto action = function->AddAction_("a1");
    A1(action);

    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action](StructBX::Functions::Function& self)
    {
        if(!action->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The user is not in any database.", ERR_DB_NOT_FOUND);
            return;
        }
        
        self.CompoundResponse_(HTTP::Status::kHTTP_OK, action->get_json_result());
    });

    get_functions()->push_back(function);
}

void Databases::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.identifier, s.name, s.state, s.logo, s.description, s.created_at " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.identifier " \
        "WHERE su.id_user = ? AND s.identifier = ?" \
    );
    action->AddParameter_("id_user", get_id_user(), false);
    action->AddParameter_("identifier", get_database_id(), true);
}

Databases::Add::Add(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/add", HTTP::EnumMethods::kHTTP_POST);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Lambda function to delete database (error case)
    auto delete_database = [](const std::string& database_identifier)
    {
        // Delete database from table
        StructBX::Functions::Action action("action_delete_database");
        action.set_sql_code("DELETE FROM `databases` WHERE identifier = ?");
        action.AddParameter_("identifier", database_identifier, false);
        action.Work_();
    };

    // Action1: Verify database if exists
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action2: Add database
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Action3: Add current user to the new database
    auto action3 = function->AddAction_("a3");
    A3(action3);

    // Action4: Create database
    auto action4 = function->AddAction_("a4");

    // Setup Custom Process
    function->SetupCustomProcess_([delete_database, action1, action2, action3, action4](StructBX::Functions::Function& self)
    {
        Tools::RandomGenerator rg;
        auto database_identifier = rg.GenerateAlphanumericID_(20);
        
        // Action1: Verify database if exists
        action1->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(database_identifier)), "identifier");
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action1->get_custom_error(), action1->get_custom_error_code());
            return;
        }
        // Action2: Add database
        action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(database_identifier)), "identifier");
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action2->get_custom_error(), action2->get_custom_error_code());
            return;
        }
        // Action3: Add current user to the new database
        action3->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(database_identifier)), "identifier");
        if(!action3->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action3->get_custom_error(), action3->get_custom_error_code());
            return;
        }

        // Create database
        action4->set_sql_code("CREATE DATABASE " + database_identifier);
        if(!action4->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to create database.", ERR_DB_CREATE_FAIL);
            delete_database(database_identifier);

            return;
        }

        // Create the directory to store files
        try
        {
            auto directory = StructBX::Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded");
            directory += "/" + database_identifier;
            Poco::File file(directory);
            if(file.exists())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
                return;
            }
            if(!file.createDirectory())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to create database file directory.", ERR_DB_DIR_CREATE_FAIL);
                delete_database(database_identifier);
                return;
            }

            // Send results
            self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
        }
        catch(Poco::FileException& e)
        {
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/databases/databases.cpp on Add::Add(): " + e.displayText());
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to create database file directory.", ERR_DB_DIR_CREATE_FAIL);
            delete_database(database_identifier);
            return;
        }
        catch(std::exception& e)
        {
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/databases/databases.cpp on Add::Add(): " + std::string(e.what()));
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Failed to create database file directory.", ERR_DB_DIR_CREATE_FAIL);
            delete_database(database_identifier);
            return;
        }
    });

    get_functions()->push_back(function);
}

void Databases::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT s.identifier FROM `databases` s WHERE s.identifier = ?");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("A database with this identifier already exists.");
            self.set_custom_error_code(ERR_DB_DUP_IDENT);
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", false);
}

void Databases::Add::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT IGNORE INTO `databases` (identifier, name, description) VALUES (?, ?, ?)"
    );
    action->AddParameter_("identifier", "", false);
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The database name cannot be empty.");
            return false;
        }
        if(param->ToString_().size() <= 3)
        {
            param->set_error("The database name must be more than 3 characters.");
            return false;
        }
        return true;
    });
    action->AddParameter_("description", "", true);
}

void Databases::Add::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO databases_users (id_user, id_database) " \
        "VALUES (?, ?)"
    );
    action->AddParameter_("id_user", get_id_user(), false);
    action->AddParameter_("identifier", "", false);
}

Databases::Change::Change(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/change
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/change", HTTP::EnumMethods::kHTTP_POST);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action1: Database info
    auto action = function->AddAction_("a1");
    A1(action);

    function->SetupCustomProcess_([action](StructBX::Functions::Function& self)
    {   
        // Action1: Database info
        if(!action->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action->get_custom_error(), action->get_custom_error_code());
            return;
        }
        auto first = action->get_results()->begin();

        // Set Database ID Cookie to the client
        if(first != action->get_results()->end() && !first->get()->ExtractField_("identifier")->IsNull_())
        {
            auto database_identifier = first->get()->ExtractField_("identifier");

            // Set Cookie Database ID
            auto database_id_encoded = StructBX::Tools::Base64Tool().Encode_(database_identifier->ToString_());
            Net::HTTPCookie cookie(StructBX::Tools::SettingsManager::GetSetting_("database_id_cookie_name", "1f3efd18688d2"), database_id_encoded);
            cookie.setPath("/");
            cookie.setSecure(true);

            auto& response = self.get_http_server_response().value();
            response->addCookie(cookie);
            
            // Send results
            self.CompoundResponse_(HTTP::Status::kHTTP_OK, action->get_json_result());
        }
        else
            self.JSONResponse_(HTTP::Status::kHTTP_FORBIDDEN, "The user is not in any database.", ERR_DB_NOT_FOUND);
    });

    get_functions()->push_back(function);
}

void Databases::Change::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.identifier, s.name, s.state, s.logo, s.description, s.created_at " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.identifier " \
        "WHERE su.id_user = ? AND s.identifier = ?" \
    );
    action->AddParameter_("id_user", get_id_user(), false);
    action->AddParameter_("id_database", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()), true)
    ->SetupCondition_("condition-id_database", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The database switch identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

Databases::Modify::Modify(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function PUT /api/databases/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/modify", HTTP::EnumMethods::kHTTP_PUT);

    // Action 1: Verify that current user is in the database
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Verify database identifier
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Action 3: Modify database
    auto action3 = function->AddAction_("a3");
    A3(action3);

    get_functions()->push_back(function);
}

void Databases::Modify::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.identifier " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.identifier " \
        "WHERE su.id_user = ?"
    );
    action->SetupCondition_("verify-user-in-database", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("The current user does not belong to the database they are trying to modify.");
            self.set_custom_error_code(ERR_DB_USER_NOT_OWNED);
            return false;
        }

        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

void Databases::Modify::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT id FROM `databases` WHERE name = ? AND identifier != ?");
    action->SetupCondition_("verify-database-name", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("A database with this name already exists.");
            self.set_custom_error_code(ERR_DB_DUP_NAME);
            return false;
        }

        return true;
    });

    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The database name cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The database identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

void Databases::Modify::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE `databases` s " \
        "JOIN databases_users su ON su.id_database = s.identifier " \
        "SET s.name = ?, s.description = ? " \
        "WHERE su.id_user = ? AND s.identifier = ?"
    );

    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("The name must be a text string.");
            return false;
        }
        if(param->ToString_() == "")
        {
            param->set_error("The database name cannot be empty.");
            return false;
        }
        if(param->ToString_().size() < 3)
        {
            param->set_error("The database name must be more than 3 characters.");
            return false;
        }
        return true;
    });
    action->AddParameter_("description", "", true);
    action->AddParameter_("id_user", get_id_user(), false);
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The database identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

Databases::Delete::Delete(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/delete", HTTP::EnumMethods::kHTTP_DEL);

    // Action 1: Verify that current user is in the database
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Mark database like "deleted"
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Action 3: Delete users from database
    auto action3 = function->AddAction_("a3");
    A3(action3);

    get_functions()->push_back(function);
}

void Databases::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.identifier " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.identifier " \
        "WHERE su.id_user = ?"
    );
    action->SetupCondition_("verify-user-in-database", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("The current user does not belong to the database they are trying to modify.");
            self.set_custom_error_code(ERR_DB_USER_NOT_OWNED);
            return false;
        }

        return true;
    });

    action->AddParameter_("id_user", get_id_user(), false);
}

void Databases::Delete::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE `databases` s " \
        "JOIN databases_users su ON su.id_database = s.identifier " \
        "SET s.state = 'DELETED' " \
        "WHERE su.id_user = ? AND s.identifier = ?"
    );

    action->AddParameter_("id_user", get_id_user(), false);
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The database identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

void Databases::Delete::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("DELETE FROM databases_users WHERE id_database = ?");

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The database identifier cannot be empty.");
            return false;
        }
        return true;
    });
}
