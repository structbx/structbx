
#include "controllers/databases/main.h"

using namespace StructBX::Controllers::Databases;

Main::Main(Tools::FunctionData& function_data) :
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

Main::Read::Read(Tools::FunctionData& function_data) :
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
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action->get_identifier() + ": " + action->get_custom_error());
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
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error KXkg8nuaNB");
                return;
            }

            // Size of database directory
            auto directory = StructBX::Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded");
            directory += "/" + identifier->ToString_();
            float directory_size = 0;
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
                {
                    directory_size += it->getSize();
                }

                ++it;
            }
            directory_size = directory_size / 1024.f / 1024.f;

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

void Main::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.* " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.id " \
        "WHERE su.id_naf_user = ?"
    );
    action->AddParameter_("id_naf_user", get_id_user(), false);
}

Main::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/read/id
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/read/id", HTTP::EnumMethods::kHTTP_GET);
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    auto action = function->AddAction_("a1");
    A1(action);

    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action](StructBX::Functions::Function& self)
    {
        if(!action->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action->get_identifier() + ": " + action->get_custom_error());
            return;
        }
        
        self.CompoundResponse_(HTTP::Status::kHTTP_OK, action->get_json_result());
    });

    get_functions()->push_back(function);
}

void Main::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.* " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.id " \
        "WHERE su.id_naf_user = ? AND s.id = (SELECT id FROM `databases` WHERE identifier = ?)" \
    );
    action->AddParameter_("id_naf_user", get_id_user(), false);
    action->AddParameter_("identifier", get_database_id(), true);
}

Main::Add::Add(Tools::FunctionData& function_data) :
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
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }
        // Action2: Add database
        action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(database_identifier)), "identifier");
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2->get_identifier() + ": " + action2->get_custom_error());
            return;
        }
        // Action3: Add current user to the new database
        action3->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(database_identifier)), "identifier");
        if(!action3->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action3->get_identifier() + ": " + action3->get_custom_error());
            return;
        }

        // Create database
        action4->set_sql_code("CREATE DATABASE " + database_identifier);
        if(!action4->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error " + action4->get_identifier() + ": No se pudo crear la base de datos");
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
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo crear el directorio de archivos de la base de datos");
                delete_database(database_identifier);
                return;
            }

            // Send results
            self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
        }
        catch(Poco::FileException& e)
        {
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/databases/main.cpp on Add::Add(): " + e.displayText());
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo crear el directorio de archivos de la base de datos");
            delete_database(database_identifier);
            return;
        }
        catch(std::exception& e)
        {
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/main.cpp on Add::Add(): " + std::string(e.what()));
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo crear el directorio de archivos de la base de datos");
            delete_database(database_identifier);
            return;
        }
    });

    get_functions()->push_back(function);
}

void Main::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT s.id FROM `databases` s WHERE s.identifier = ?");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("Una base de datos con este identificador ya existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", false);
}

void Main::Add::A2(StructBX::Functions::Action::Ptr action)
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
            param->set_error("El nombre de la base de datos no puede estar vacío");
            return false;
        }
        if(param->ToString_().size() <= 3)
        {
            param->set_error("El nombre de la base de datos debe tener más de 3 caracteres");
            return false;
        }
        return true;
    });
    action->AddParameter_("description", "", true);
}

void Main::Add::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO databases_users (id_naf_user, id_database) " \
        "SELECT ?, s.id FROM `databases` s WHERE identifier = ?"
    );
    action->AddParameter_("id_naf_user", get_id_user(), false);
    action->AddParameter_("identifier", "", false);
}

Main::Change::Change(Tools::FunctionData& function_data) :
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
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action->get_custom_error());
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
            cookie.setSameSite(Net::HTTPCookie::SAME_SITE_STRICT);
            cookie.setSecure(true);
            cookie.setHttpOnly();

            auto& response = self.get_http_server_response().value();
            response->addCookie(cookie);
            
            // Send results
            self.CompoundResponse_(HTTP::Status::kHTTP_OK, action->get_json_result());
        }
        else
            self.JSONResponse_(HTTP::Status::kHTTP_FORBIDDEN, "El usuario no est&aacute; en alguna base de datos.");
    });

    get_functions()->push_back(function);
}

void Main::Change::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.id, s.identifier, s.name, s.state, s.logo, s.description, s.created_at " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.id " \
        "WHERE su.id_naf_user = ? AND s.id = (SELECT id FROM `databases` WHERE identifier = ?)" \
    );
    action->AddParameter_("id_naf_user", get_id_user(), false);
    action->AddParameter_("id_database", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()), true)
    ->SetupCondition_("condition-id_database", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de cambio de base de datos no puede estar vacío");
            return false;
        }
        return true;
    });
}

Main::Modify::Modify(Tools::FunctionData& function_data) :
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

void Main::Modify::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.id " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.id " \
        "WHERE su.id_naf_user = ?"
    );
    action->SetupCondition_("verify-user-in-database", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("El usuario actual no pertenece a la base de datos que intenta modificar");
            return false;
        }

        return true;
    });

    action->AddParameter_("id_naf_user", get_id_user(), false);
}

void Main::Modify::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT id FROM `databases` WHERE name = ? AND identifier != ?");
    action->SetupCondition_("verify-database-name", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("Una base de datos con este nombre ya existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El name no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Main::Modify::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE `databases` s " \
        "JOIN databases_users su ON su.id_database = s.id " \
        "SET s.name = ?, s.description = ? " \
        "WHERE su.id_naf_user = ? AND s.identifier = ?"
    );

    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("El nombre debe ser una cadena de texto");
            return false;
        }
        if(param->ToString_() == "")
        {
            param->set_error("El nombre no puede estar vacío");
            return false;
        }
        if(param->ToString_().size() < 3)
        {
            param->set_error("El nombre no puede ser menor a 3 dígitos");
            return false;
        }
        return true;
    });
    action->AddParameter_("description", "", true);
    action->AddParameter_("id_naf_user", get_id_user(), false);
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador no puede estar vacío");
            return false;
        }
        return true;
    });
}

Main::Delete::Delete(Tools::FunctionData& function_data) :
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

void Main::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT s.id " \
        "FROM `databases` s " \
        "JOIN databases_users su ON su.id_database = s.id " \
        "WHERE su.id_naf_user = ?"
    );
    action->SetupCondition_("verify-user-in-database", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("El usuario actual no pertenece a la base de datos que intenta eliminar");
            return false;
        }

        return true;
    });

    action->AddParameter_("id_naf_user", get_id_user(), false);
}

void Main::Delete::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE `databases` s " \
        "JOIN databases_users su ON su.id_database = s.id " \
        "SET s.state = 'DELETED' " \
        "WHERE su.id_naf_user = ? AND s.id = (SELECT id FROM `databases` WHERE identifier = ?)"
    );

    action->AddParameter_("id_naf_user", get_id_user(), false);
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de base de datos no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Main::Delete::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("DELETE FROM databases_users WHERE id_database = (SELECT id FROM `databases` WHERE identifier = ?)");

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de base de datos no puede estar vacío");
            return false;
        }
        return true;
    });
}
