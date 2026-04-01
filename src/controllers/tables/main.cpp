
#include "controllers/tables/main.h"
#include "functions/action.h"
#include "tools/random_generator.h"
#include <Poco/JSON/Object.h>

using namespace StructBX::Controllers::Tables;

Main::Main(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,function_data_(function_data)
    ,function_columns_(function_data)
    ,function_permissions_(function_data)
    ,function_views_(function_data)
    ,function_filters_(function_data)
    ,struct_read_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

Main::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/read", HTTP::EnumMethods::kHTTP_GET);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action1: Read all tables en database
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Setup custom process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1](StructBX::Functions::Function& self)
    {
        // Action1: Read all tables en database
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error to Read all tables en database 36i89vE0XqYr");
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
            auto action2 = Functions::Action("a2");
            action2.set_sql_code(
                "SELECT COUNT(1) AS total " \
                "FROM " + database_id + "." + identifier.get()->ToString_());
            if(!action2.Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error JNt2Std2sh");
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

void Main::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "f.* " \
        "FROM tables f " \
        "JOIN `databases` d ON f.id_database = d.id " \
        "WHERE " \
            "d.identifier = ? "
    );
    action->AddParameter_("database_identifier", get_database_id(), false);
}

Main::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/read/identifier
    StructBX::Functions::Function::Ptr function1 = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/read/identifier", HTTP::EnumMethods::kHTTP_GET);

    // Action1: Read specific table by identifier
    auto action1 = function1->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function1);
}

void Main::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "f.identifier, f.name, f.public_form, f.description " \
        "FROM tables f " \
        "WHERE " \
            "f.identifier = ? "
    );

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
}

Main::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
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
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Add the new table
    auto action2 = function->AddAction_("a2");
    A2(action2);
    
    // Action 3_1: Add table permissions to current user
    auto action3_1 = function->AddAction_("a3_1");
    A3(action3_1);

    // Action 4: Create the table
    auto action4 = function->AddAction_("a4");
    
    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([delete_table, database_id, action1, action2, action3_1, action4](StructBX::Functions::Function& self)
    {
        Tools::RandomGenerator rg;
        auto table_identifier = rg.GenerateAlphanumericID_(20);
        
        // Action 1: Verify that the table name don't exists in current database
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error to Verify that the table name don't exists in current database 2Orhhz7lUEbJ");
            return;
        }
        // Action 2: Add the new table
        action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(table_identifier)), "identifier");
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error to add the new table oF4Ksu32OEYm");
            return;
        }

        // Action 3_1: Add table permissions to current user
        action3_1->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(table_identifier)), "table_identifier");
        if(!action3_1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action3_1->get_identifier() + ": " + action3_1->get_custom_error());
            return;
        }

        // Action 4: Create the table
        action4->set_sql_code(
            "CREATE TABLE " + database_id + "." + table_identifier + " " \
            "(" \
                "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, " \
                "_structbx_column_created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " \
                "_structbx_column_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " \
                "_structbx_column_user_owner INT NULL, " \
                "_structbx_column_colorHeader VARCHAR(100) DEFAULT NULL, " \
                "INDEX (_structbx_column_created_at) USING BTREE, " \
                "INDEX (_structbx_column_updated_at) USING BTREE, " \
                "INDEX (_structbx_column_user_owner) USING BTREE, " \
                "INDEX (_structbx_column_colorHeader) USING BTREE " \
            ")"
        );
        if(!action4->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error " + action4->get_identifier() + ": No se pudo crear la tabla");
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
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo crear el directorio de archivos de la tabla");
                delete_table(table_identifier);
                return;
            }

            // Send results
            self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
        }
        catch(Poco::FileException& e)
        {
            delete_table(table_identifier);
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/main.cpp on Add::Add(): " + e.displayText());
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo crear el directorio de archivos del formulario");
            return;
        }
        catch(std::exception& e)
        {
            delete_table(table_identifier);
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/main.cpp on Add::Add(): " + std::string(e.what()));
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo crear el directorio de archivos del formulario");
            return;
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Main::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT id FROM tables WHERE name = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("Una tabla con este nombre para esta base de datos ya existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El nombre no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_database", get_database_id(), false);
}

void Main::Add::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("INSERT INTO tables (identifier, name, state, public_form, description, id_database) VALUES (?, ?, ?, ?, ?, (SELECT id FROM `databases` WHERE identifier = ?))");

    action->AddParameter_("identifier", "", false);
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("El nombre debe ser una cadena de texto");
            return false;
        }
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El nombre no puede estar vacío");
            return false;
        }
        if(param->get_value()->ToString_().size() < 3)
        {
            param->set_error("El nombre no puede ser menor a 3 dígitos");
            return false;
        }
        return true;
    });
    action->AddParameter_("state", "", true);
    action->AddParameter_("public_form", 0, true);
    action->AddParameter_("description", "", true);
    action->AddParameter_("id_database", get_database_id(), false);
}

void Main::Add::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_permissions (`read`, `add`, `modify`, `delete`, id_user, id_table) " \
        "SELECT 1, 1, 1, 1, ?, (SELECT id FROM tables WHERE identifier = ?)"
    );

    action->AddParameter_("user_id", get_id_user(), false);
    action->AddParameter_("table_identifier", 0, false);
}

Main::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function PUT /api/tables/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/modify", HTTP::EnumMethods::kHTTP_PUT);

    // Action 1: Verify tables existence
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Verify that the table identifier don't exists
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Action 3: Modify table
    auto action3 = function->AddAction_("a3");
    A3(action3);

    get_functions()->push_back(function);
}

void Main::Modify::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)");
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("La tabla solicitada no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_identifier", get_database_id(), false);
}

void Main::Modify::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT id FROM tables WHERE name = ? AND identifier != ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("Una tabla con este nombre en esta base de datos ya existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El nombre no puede estar vacío");
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
    action->AddParameter_("database_id", get_database_id(), false);
}

void Main::Modify::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE tables " \
        "SET name = ?, state = ?, public_form = ?, description = ? " \
        "WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)"
    );

    // Parameters and conditions
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("El nombre debe ser una cadena de texto");
            return false;
        }
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El nombre no puede estar vacío");
            return false;
        }
        if(param->get_value()->ToString_().size() < 3)
        {
            param->set_error("El nombre no puede ser menor a 3 caracteres");
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
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_id", get_database_id(), false);
}

Main::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function DEL /api/tables/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/delete", HTTP::EnumMethods::kHTTP_DEL);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Verify table existence
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Delete table record
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2](StructBX::Functions::Function& self)
    {
        // Action 1: Verify tables existence
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error Verify tables existence WSDjvfkKGUSu");
            return;
        }
            
        auto identifier = self.GetParameter_("identifier");
        if(identifier == action1->get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error J5pktjAN5K");
            return;
        }

        // Action 3: Drop table
        auto action3 = self.AddAction_("a3");
        action3->set_sql_code("DROP TABLE IF EXISTS " + database_id + "." + identifier->get()->ToString_());
        if(!action3->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error lOuU13kOu6, asegúrese que no hayan enlaces creados hacia su formulario");
            return;
        }

        // Action 2: Delete table record
        self.IdentifyParameters_(action2);
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error kJ79T9LBRw");
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
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/main.cpp on Delete::Delete(): " + e.displayText());
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo borrar el directorio de archivos del formulario");
            return;
        }
        catch(std::exception& e)
        {
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/main.cpp on Delete::Delete(): " + std::string(e.what()));
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo borrar el directorio de archivos del formulario");
            return;
        }
        
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Main::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)");
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("La tabla solicitada no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_identifier", get_database_id(), false);
}

void Main::Delete::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("DELETE FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)");
    action->AddParameter_("identifier", "", true);
    action->AddParameter_("database_identifier", get_database_id(), false);
}
