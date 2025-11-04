
#include "controllers/tables/main.h"

using namespace StructBX::Controllers::Tables;

Main::Main(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,function_data_(function_data)
    ,function_columns_(function_data)
    ,function_permissions_(function_data)
    ,function_views_(function_data)
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

    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Setup custom process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }

        // Iterate over results
        for(auto row : *action1->get_results())
        {
            // Get table id
            auto id = row->ExtractField_("id");
            if(id->IsNull_())
                continue;

            // Action 2: COUNT
            auto action2 = StructBX::Functions::Action("a2");
            action2.set_sql_code(
                "SELECT COUNT(1) AS total " \
                "FROM _structbx_database_" + database_id + "._structbx_table_" + id.get()->ToString_());
            if(!action2.Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error JNt2Std2sh");
                return;
            }

            // Get results
            auto total = action2.get_results()->First_();
            if(total->IsNull_())
                continue;

            row->AddField_("total", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(total->Int_())));

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
        "WHERE " \
            "id_database = ? "
    );
    action->AddParameter_("id_database", get_database_id(), false);
}

Main::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/read/id
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/read/id", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("a1");
    A1(action);

    get_functions()->push_back(function);

    // Function GET /api/tables/read/identifier
    StructBX::Functions::Function::Ptr function2 = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/read/identifier", HTTP::EnumMethods::kHTTP_GET);

    auto action2 = function2->AddAction_("a2");
    A2(action2);

    get_functions()->push_back(function2);
}

void Main::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT * FROM tables WHERE id = ? AND id_database = ?");

    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id del formulario no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);
}

void Main::ReadSpecific::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT * FROM tables WHERE identifier = ? AND id_database = ?");

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador del formulario no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);

}

Main::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/add", HTTP::EnumMethods::kHTTP_POST);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Verify that the table identifier don't exists in current database
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Add the new table
    auto action2 = function->AddAction_("a2");
    A2(action2);
    
    // Action 3: Add the ID Column to the table
    auto action3 = function->AddAction_("a3");
    A3(action3);

    // Action 3_1: Add table permissions to current user
    auto action3_1 = function->AddAction_("a3_1");
    A3_1(action3_1);

    // Action 4: Create the table
    auto action4 = function->AddAction_("a4");
    
    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2, action3, action3_1, action4](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2->get_identifier() + ": " + action2->get_custom_error());
            return;
        }
        if(!action3->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action3->get_identifier() + ": " + action3->get_custom_error());
            return;
        }
        if(!action3_1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action3_1->get_identifier() + ": " + action3_1->get_custom_error());
            return;
        }

        // Table ID
        int table_id = action2->get_last_insert_id();
        if(table_id == 0)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error MVm2IlbSnm");
            return;
        }

        // Columns ID
        int column_id = action3->get_last_insert_id();
        if(column_id == 0)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error lyEC9cs1tj");
            return;
        }

        // Action 4: Create the table
        action4->set_sql_code(
            "CREATE TABLE _structbx_database_" + database_id + "._structbx_table_" + std::to_string(table_id) + " " \
            "(" \
                "_structbx_column_" + std::to_string(column_id) + " INT NOT NULL AUTO_INCREMENT PRIMARY KEY " \
            ")"
        );
        if(!action4->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error " + action4->get_identifier() + ": No se pudo crear la tabla");

            // Delete table from table
            StructBX::Functions::Action action5("a5");
            action5.set_sql_code("DELETE FROM tables WHERE id = ?");
            action5.AddParameter_("id", std::to_string(table_id), false);

            return;
        }

        // Create the directory to store files
        try
        {
            auto directory = StructBX::Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded");
            directory += "/" + database_id + "/" + std::to_string(table_id);
            Poco::File file(directory);
            if(file.exists())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
                return;
            }
            if(!file.createDirectory())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo crear el directorio de archivos del formulario");
                return;
            }

            // Send results
            self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
        }
        catch(Poco::FileException& e)
        {
            StructBX::Tools::OutputLogger::Debug_("Error on controllers/tables/main.cpp on Add::Add(): " + e.displayText());
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error: No se pudo crear el directorio de archivos del formulario");
            return;
        }
        catch(std::exception& e)
        {
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
    action->set_sql_code("SELECT id FROM tables WHERE identifier = ? AND id_database = ?");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("Un formulario con este identificador para esta base de datos ya existe");
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

    action->AddParameter_("id_database", get_database_id(), false);
}

void Main::Add::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("INSERT INTO tables (identifier, name, state, public_form, description, id_database) VALUES (?, ?, ?, ?, ?, ?)");

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        auto string_param = param->get_value()->ToString_();
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("El identificador debe ser una cadena de texto");
            return false;
        }
        if(string_param == "")
        {
            param->set_error("El identificador no puede estar vacío");
            return false;
        }
        if(string_param.size() < 3)
        {
            param->set_error("El identificador no puede ser menor a 3 dígitos");
            return false;
        }
        bool result = Tools::IDChecker().Check_(param->get_value()->ToString_());
        if(!result)
        {
            param->set_error("El identificador solo puede tener a-z, A-Z, 0-9 y \"_\", sin espacios en blanco");
            return false;
        }
        return true;
    });
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
        "INSERT INTO tables_columns (identifier, name, length, required, id_column_type, id_table) " \
        "SELECT " \
            "? " \
            ",? " \
            ",? " \
            ",? " \
            ",(SELECT id FROM tables_columns_types WHERE identifier = 'int-number') " \
            ",(SELECT id FROM tables WHERE identifier = ? and id_database = ?) "
    );

    action->AddParameter_("identifier", "id", false);
    action->AddParameter_("name", "ID", false);
    action->AddParameter_("length", "11", false);
    action->AddParameter_("required", 1, false);
    action->AddParameter_("identifier", "", true);
    action->AddParameter_("database_id", get_database_id(), false);
}

void Main::Add::A3_1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_permissions (`read`, `add`, `modify`, `delete`, id_table, id_naf_user) " \
        "SELECT 1, 1, 1, 1 " \
            ",(SELECT id FROM tables WHERE identifier = ? and id_database = ?) " \
            ",? "
    );

    action->AddParameter_("identifier", "", true);
    action->AddParameter_("database_id", get_database_id(), false);
    action->AddParameter_("user_id", get_id_user(), false);
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
    action->set_sql_code("SELECT identifier, id_database FROM tables WHERE id = ?");
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("El formulario solicitado no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de formulario no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Main::Modify::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT id FROM tables WHERE identifier = ? AND id != ? AND id_database = ?");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("Un formulario con este identificador en esta base de datos ya existe");
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

    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id no puede estar vacío");
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
        "SET identifier = ?, name = ?, state = ?, public_form = ?, description = ? " \
        "WHERE id = ? AND id_database = ?"
    );

    // Parameters and conditions
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("El identificador debe ser una cadena de texto");
            return false;
        }
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador no puede estar vacío");
            return false;
        }
        if(param->get_value()->ToString_().size() < 3)
        {
            param->set_error("El identificador no puede ser menor a 3 dígitos");
            return false;
        }
        bool result = Tools::IDChecker().Check_(param->get_value()->ToString_());
        if(!result)
        {
            param->set_error("El identificador solo puede tener a-z, A-Z, 0-9 y \"_\", sin espacios en blanco");
            return false;
        }
        return true;
    });
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

    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);

}

Main::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function DEL /api/tables/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/delete", HTTP::EnumMethods::kHTTP_DEL);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Verify tables existence
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Delete table from table
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }
            
        // Variables
        auto id = action1->GetParameter("id");
        if(id == action1->get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error J5pktjAN5K");
            return;
        }

        // Action 3: Drop table
        auto action3 = self.AddAction_("a3");
        action3->set_sql_code("DROP TABLE IF EXISTS _structbx_database_" + database_id + "._structbx_table_" + id->get()->ToString_());
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
            directory += "/" + database_id + "/" + id->get()->ToString_();
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
    action->set_sql_code("SELECT identifier FROM tables WHERE id = ?");
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("El formulario solicitado no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id del formulario no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Main::Delete::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("DELETE FROM tables WHERE id = ? AND id_database = ?");
    action->AddParameter_("id", "", true);
    action->AddParameter_("id_database", get_database_id(), false);
}
