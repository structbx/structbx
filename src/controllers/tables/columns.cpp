
#include "controllers/tables/columns.h"
#include "tools/dvalue.h"

using namespace StructBX::Controllers::Tables;

Columns::Columns(Tools::FunctionData& function_data) :
    FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_read_types_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_modify_position_(function_data)
    ,struct_modify_visible_(function_data)
    ,struct_delete_(function_data)
{
    
}

Columns::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/columns/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/read", HTTP::EnumMethods::kHTTP_GET);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Get table id
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Setup Custom Process
    function->SetupCustomProcess_([action1](StructBX::Functions::Function& self)
    {
        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "aNTa9tFRblfl");
            return;
        }

        // Get View Identifier
        auto view_identifier = self.GetParameter_("view-identifier");
        if(view_identifier != self.get_parameters().end())
        {
            action1->SetValueToParamater_(
                Tools::DValue::Ptr(
                    new Tools::DValue(view_identifier->get()->ToString_())), "view-identifier");
        }
        else
        {
            // Get first default view identifier of table
            auto action = self.AddAction_("a1_1");
            action->set_sql_code("SELECT identifier FROM views WHERE id_table = ?");
            action->AddParameter_("table_identifier", table_identifier->get()->ToString_(), false);
            if(!action->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "ihhpykmiuIJk");
                return;
            }
            if(action->get_results()->size() < 1)
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "H8TyAt6zjSix");
                return;
            }
            auto default_view_identifier = action->get_results()->begin()->get()->ExtractField_("identifier");
            if(default_view_identifier->IsNull_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Dgv1JlwUFfxX");
                return;
            }
            action1->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(default_view_identifier->ToString_())), "view-identifier");
        }

        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }

        self.CompoundResponse_(HTTP::Status::kHTTP_OK, action1->get_json_result());

    });
    get_functions()->push_back(function);
}

void Columns::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "fc.*, fct.identifier AS column_type, fct.name AS column_type_name, f.id AS table_id " \
            ",(SELECT identifier FROM tables WHERE id = fc.link_to) AS link_to_table " \
            ",(SELECT name FROM tables WHERE id = fc.link_to) AS link_to_table_name " \
            ",vc.visible AS visible " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.id = fc.id_table " \
        "JOIN tables_columns_types fct ON fct.id = fc.id_column_type " \
        "JOIN views_columns vc ON vc.id_column = fc.id " \
        "WHERE " \
            "f.identifier = ? AND vc.id_view = ? " \
        "ORDER BY vc.position ASC"
    );

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("view-identifier", "", false);
}

Columns::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/columns/read/id
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/read/id", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("a1");
    A1(action);

    get_functions()->push_back(function);
}

void Columns::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "fc.*, fct.identifier AS column_type, fct.name AS column_type_name, f.id AS table_id " \
            ",(SELECT identifier FROM tables WHERE id = fc.link_to) AS link_to_table " \
            ",(SELECT name FROM tables WHERE id = fc.link_to) AS link_to_table_name " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.id = fc.id_table " \
        "JOIN tables_columns_types fct ON fct.id = fc.id_column_type " \
        "WHERE " \
            "fc.id = ? AND f.identifier = ? " \
            "AND id_database = (SELECT id FROM `databases` WHERE identifier = ?) " \
        "ORDER BY fc.position ASC"
    );
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);
}

Columns::ReadTypes::ReadTypes(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/columns/types/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/types/read", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("a1");
    A1(action);

    get_functions()->push_back(function);
}

void Columns::ReadTypes::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT * FROM tables_columns_types ");
}

Columns::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/columns/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/add", HTTP::EnumMethods::kHTTP_POST);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Verify that the table exists
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Verify that the columns don't exists in the table
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Action 3: Save the column
    auto action3 = function->AddAction_("a3");
    A3(action3);

    // Action 4: Add the column in the table
    auto action4 = function->AddAction_("a4");

    // Action 5: Get column id from link to
    auto action5 = function->AddAction_("a5");

    // Action 6: Create foreign key if there is a link to
    auto action6 = function->AddAction_("a6");

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2, action3, action4, action5, action6](StructBX::Functions::Function& self)
    {
        // If error, delete the column from the table
        auto delete_column_table = [](int column_id)
        {
            // Delete database from table
            StructBX::Functions::Action action("action_delete_column");
            action.set_sql_code("DELETE FROM tables_columns WHERE id = ?");
            action.AddParameter_("id", column_id, false);
            action.Work_();
        };

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

        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error nh39HIiJkd");
            return;
        }

        // Get Column ID
        int column_id = action3->get_last_insert_id();
        if(column_id == 0)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error 6eHh9R4Pv5");
            return;
        }

        // Setup column variables
        auto column_setup = ColumnSetup();
        auto variables = ColumnVariables();
        if(!column_setup.Setup(self, variables))
        {
            delete_column_table(column_id);
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error e4GBhN1lxk");
            return;
        }
        std::string column = "_structbx_column_" + std::to_string(column_id);

        // Action 4: Add the column in the table
        action4->set_sql_code(
            "ALTER TABLE " + database_id + "." + table_identifier->get()->ToString_() + " " +
            "ADD " + column + " " + variables.column_type + variables.length + " " +
            variables.required + " " + variables.default_value
        );
        if(!action4->Work_())
        {
            delete_column_table(column_id);
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action4->get_identifier() + ": " + action4->get_custom_error());
            return;
        }

        // Create foreign key if there is a link to
        if(variables.link_to != "")
        {
            // Get column id from link to
            action5->set_sql_code(
                "SELECT fc.id " \
                "FROM tables_columns fc " \
                "JOIN tables f ON f.id = fc.id_table " \
                "WHERE f.id = ? AND f.id_database = (SELECT id FROM `databases` WHERE identifier = ?) "
            );
            action5->AddParameter_("id_table", variables.link_to, false);
            action5->AddParameter_("id_database", database_id, false);
            if(!action5->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action5->get_identifier() + ": No se pudo crear la llave foránea");
                return;
            }

            auto column_id_link = action5->get_results()->First_();
            if(column_id_link->IsNull_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error: No se pudo crear la llave foránea");
                return;
            }

            // Get link_to table identifier
            Functions::Action action_link_to("action_link_to");
            action_link_to.set_sql_code("SELECT identifier FROM tables WHERE id = ?");
            action_link_to.AddParameter_("id", variables.link_to, false);
            if(!action_link_to.Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error to get link_to table identifier x3JdT9pQ8m");
                return;
            }
            auto link_to_table_identifier = action_link_to.get_results()->First_();

            // Create the foreign key
            action6->set_sql_code(
                "ALTER TABLE " + database_id + "." + table_identifier->get()->ToString_() + " " +
                "ADD CONSTRAINT _IDX" + column + " " + 
                "FOREIGN KEY (" + column + ") " +
                "REFERENCES " + database_id + "." + link_to_table_identifier->ToString_() + 
                    "(_structbx_column_" + column_id_link->ToString_() + ") " + 
                    variables.cascade_key_condition
            );
            if(!action6->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action6->get_identifier() + ": No se pudo crear la llave foránea");
                return;
            }
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Columns::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("La tabla solicitada no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_database", get_database_id(), false);
}

void Columns::Add::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fc.id " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.id = fc.id_table " \
        "WHERE fc.name = ? AND f.identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)" \
    );

    action->SetupCondition_("verify-column-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("La columna solicitada ya existe en el formulario actual");
            return false;
        }

        return true;
    });

    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El nombre de columna no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);
}

void Columns::Add::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_columns (identifier, name, position, length, required, default_value, description, id_column_type, link_to, id_table) " \
        "SELECT " \
            "?, ? " \
            ",MAX(fc.position) + 1 " \
            ",?, ?, ?, ?, ?, ? " \
            ",f.id " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.id = fc.id_table " \
        "WHERE f.identifier = ? AND f.id_database = (SELECT id FROM `databases` WHERE identifier = ?)" \
    );

    Tools::RandomGenerator rg;
    action->AddParameter_("identifier", rg.GenerateAlphanumericID_(20), false);
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

    action->AddParameter_("length", "", true);
    action->AddParameter_("required", "", true)
    ->SetupCondition_("condition-required", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "1" || param->get_value()->ToString_() == "0")
        {
            return true;
        }
        else
        {
            param->set_error("El valor de obligatorio debe ser boleano");
            return false;
        }
        return true;
    });
    action->AddParameter_("default_value", "", true);
    action->AddParameter_("description", "", true);
    action->AddParameter_("id_column_type", "", true)
    ->SetupCondition_("condition-id_column_type", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El tipo de columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("link_to", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()), true)
    ->SetupCondition_("condition-link_to", Query::ConditionType::kWarning, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(Tools::DValue::Type::kEmpty) && param->get_value()->ToString_() == "")
        {
            param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()));
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
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

Columns::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/columns/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/modify", HTTP::EnumMethods::kHTTP_PUT);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Verify that the table exists
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Verify that the columns don't exists in the table
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Action 3: Update the column
    auto action3 = function->AddAction_("a3");
    A3(action3);

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2, action3](StructBX::Functions::Function& self)
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

        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error KOBE4bH6qL");
            return;
        }

        // Get Column ID
        auto column_id = self.GetParameter_("id");
        if(column_id == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error XVtkYKnme6");
            return;
        }

        // Setup column variables
        auto column_setup = ColumnSetup();
        auto variables = ColumnVariables();
        if(!column_setup.Setup(self, variables))
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error WW17KL82QJ");
            return;
        }
        std::string column = "_structbx_column_" + column_id->get()->ToString_();

        // Action 4: Add the column in the table
        auto action4 = self.AddAction_("a4");
        action4->set_sql_code(
            "ALTER TABLE " + database_id + "." + table_identifier->get()->ToString_() + " " +
            "CHANGE COLUMN `" + column + "` " + column + 
            " " + variables.column_type + variables.length + " " + variables.required +
            " " + variables.default_value
        );
        if(!action4->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action4->get_identifier() + ": " + action4->get_custom_error());
            return;
        }
        if(!action3->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action3->get_identifier() + ": " + action3->get_custom_error());
            return;
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Columns::Modify::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("La tabla solicitada no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_database", get_database_id(), false);
}

void Columns::Modify::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fc.identifier, fc.id " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.id = fc.id_table " \
        "WHERE fc.id != ? AND fc.name = ? AND f.identifier = ?"
    );

    action->SetupCondition_("verify-column-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("La columna solicitada ya existe en el formulario actual");
            return false;
        }

        return true;
    });

    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El nombre de columna no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Columns::Modify::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE tables_columns SET " \
            "name = ?, length = ?, required = ? " \
            ",default_value = ?, description = ?, id_column_type = ?, link_to = ?, position = ? " \
        "WHERE id = ? AND id_table = (SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ? ) LIMIT 1)"
    );

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
    action->AddParameter_("length", "", true);
    action->AddParameter_("required", "", true)
    ->SetupCondition_("condition-required", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "1" || param->get_value()->ToString_() == "0")
        {
            return true;
        }
        else
        {
            param->set_error("El valor de obligatorio debe ser boleano");
            return false;
        }
        return true;
    });
    action->AddParameter_("default_value", "", true);
    action->AddParameter_("description", "", true);
    action->AddParameter_("id_column_type", "", true)
    ->SetupCondition_("condition-id_column_type", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El tipo de columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("link_to", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()), true)
    ->SetupCondition_("condition-id_column_type", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()));
        }
        return true;
    });
    action->AddParameter_("position", "", true)
    ->SetupCondition_("condition-position", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("La posici&oacute;n no puede estar vacía");
            return false;
        }
        return true;
    });
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de la columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
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

Columns::ModifyPosition::ModifyPosition(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/columns/position/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/position/modify", HTTP::EnumMethods::kHTTP_PUT);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Get new position
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Modify position
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Setup Custom Process
    function->SetupCustomProcess_([action1, action2](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }

        // Get new position
        auto new_position = action1->get_results()->First_();
        if(new_position->IsNull_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "No se pudo mover la posición de la columna");
            return;
        }

        action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position->ToString_())), "position");
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2->get_identifier() + ": " + action2->get_custom_error());
            return;
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");

    });
    get_functions()->push_back(function);
}

void Columns::ModifyPosition::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT AVG(vc.position) "
        "FROM views_columns vc "
        "WHERE vc.id_column IN (?, ?) AND vc.id_view = ? "
    );

    action->AddParameter_("columnPrev", "", true)
    ->SetupCondition_("condition-columnPrev", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("La columna previa no puede estar vacía");
            return false;
        }
        return true;
    });
    action->AddParameter_("columnNext", "", true)
    ->SetupCondition_("condition-columnNext", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("La columna siguiente no puede estar vacía");
            return false;
        }
        return true;
    });
    action->AddParameter_("view-identifier", "", true)
    ->SetupCondition_("condition-view-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de la vista no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Columns::ModifyPosition::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE views_columns "
        "SET position = ? "
        "WHERE id_column = ? AND id_view = ? "
    );

    action->AddParameter_("position", "", false);
    action->AddParameter_("id", "", true);
    action->AddParameter_("view-identifier", "", true);
}

Columns::ModifyVisible::ModifyVisible(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/columns/visible/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/visible/modify", HTTP::EnumMethods::kHTTP_PUT);

    // Action 1: Set visible
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Columns::ModifyVisible::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE views_columns "
        "SET visible = ? "
        "WHERE id_column = ? AND id_view = ? "
    );

    action->AddParameter_("visible", "", true)
    ->SetupCondition_("condition-visible", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El parámetro visible  no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("La columna no puede estar vacía");
            return false;
        }
        return true;
    });
    action->AddParameter_("view-identifier", "", true)
    ->SetupCondition_("condition-view-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de la vista no puede estar vacío");
            return false;
        }
        return true;
    });
}

Columns::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/columns/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/delete", HTTP::EnumMethods::kHTTP_DEL);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Verify column existence
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2_0: Delete foreign key if exists
    auto action2_0 = function->AddAction_("a2_0");

    // Action 2: Delete column from table
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Action 3: Delete column record
    auto action3 = function->AddAction_("a3");
    A3(action3);

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2_0, action2, action3](StructBX::Functions::Function& self)
    {
        // Execute action 1
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }

        // Get Table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error t3YFqJvX9W");
            return;
        }

        // Get Column ID
        auto column_id = action1->get_results()->front()->ExtractField_("column_id");
        if(column_id->IsNull_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error UFwgqfZp59");
            return;
        }

        // Action 2_0: Delete foreign key if exists
        action2_0->set_sql_code(
            "ALTER TABLE " + database_id + "." + table_identifier->get()->ToString_() + " " +
            "DROP FOREIGN KEY IF EXISTS _IDX_structbx_column_" + column_id->ToString_());
        if(!action2_0->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2_0->get_identifier() + ": " + action2_0->get_custom_error());
            return;
        }

        // Action 2: Delete columns
        action2->set_sql_code(
            "ALTER TABLE " + database_id + "." + table_identifier->get()->ToString_() + " " +
            "DROP COLUMN IF EXISTS _structbx_column_" + column_id->ToString_());
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

        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
    });

    get_functions()->push_back(function);
}

void Columns::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fc.id AS column_id, f.id AS table_id " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.id = fc.id_table " \
        "WHERE fc.id = ? AND f.identifier = ? AND f.id_database = (SELECT id FROM `databases` WHERE identifier = ?)"
    );
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("La columna solicitada no existe en el formulario actual");
            return false;
        }

        return true;
    });

    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de columna no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-identifier-table", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("id_database", get_database_id(), false);
}

void Columns::Delete::A2(StructBX::Functions::Action::Ptr)
{
    
}

void Columns::Delete::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("DELETE FROM tables_columns WHERE id = ?");

    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de columna no puede estar vacío");
            return false;
        }
        return true;
    });
}

bool Columns::ColumnSetup::Setup(StructBX::Functions::Function& self, ColumnVariables& variables)
{
    // link_to parameter setup
    auto end = self.get_parameters().end();
    auto link_to = self.GetParameter_("link_to");
    if(link_to == end)
    {
        // Add null value link_to
        self.get_parameters().push_back(
            Query::Parameter::Ptr(
                new Query::Parameter("link_to", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()), false)
            )
        );
        auto end = self.get_parameters().end();
        link_to = self.GetParameter_("link_to");
        if(link_to == end)
            return false;
    }

    // Get parameters
    auto name = self.GetParameter_("name");
    auto length = self.GetParameter_("length");
    auto required = self.GetParameter_("required");
    auto default_value = self.GetParameter_("default_value");
    auto id_column_type = self.GetParameter_("id_column_type");
    auto table_identifier = self.GetParameter_("table-identifier");
    if(
        name == end || length == end || required == end ||
        default_value == end || id_column_type == end || table_identifier == end
    )
        return false;

    // Column Type setup
    std::string column_type_id = id_column_type->get()->ToString_();
    auto column_type_setup = ColumnTypeSetup();
    if(!column_type_setup.Setup(column_type_id, variables.column_type, variables.length))
        return false;

    // Length setup
    if(length->get()->ToString_() != "")
        variables.length = "(" + length->get()->ToString_() + ")";

    // Required setup
    if(required->get()->ToString_() == "1")
    {
        variables.required = "NOT NULL";
        variables.cascade_key_condition = "ON DELETE CASCADE ON UPDATE CASCADE";
    }
    else
    {
        variables.required = "NULL";
    }

    // Default setup
    if(default_value->get()->ToString_() != "")
        variables.default_value = "DEFAULT " + default_value->get()->ToString_();
    else
    {
        if(variables.required == "NULL")
            variables.default_value = "DEFAULT NULL";
        else
            variables.default_value = "";
    }

    // Link to
    if(!link_to->get()->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kEmpty) && link_to->get()->ToString_() != "")
        variables.link_to = link_to->get()->ToString_();

    // Verify if column type is selection and link_to is empty
    if(
        (column_type_id == "9") &&
        (
            variables.link_to == "" 
            || link_to->get()->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kEmpty)
        )
    )
        return false;
    
    return true;
}

bool Columns::ColumnTypeSetup::Setup(std::string column_type_id, std::string& column_type, std::string& length_value)
{
    if(column_type_id == "1" || column_type_id == "10" || column_type_id == "11")
    {
        column_type = "VARCHAR";
        length_value = "(100)";
        return true;
    }
    else if(column_type_id == "2" || column_type_id == "7" || column_type_id == "8")
    {
        column_type = "TEXT";
        length_value = "";
        return true;
    }
    else if(column_type_id == "3")
    {
        column_type = "INT";
        length_value = "(11)";
        return true;
    }
    else if(column_type_id == "4")
    {
        column_type = "DECIMAL";
        length_value = "(10, 2)";
        return true;
    }
    else if(column_type_id == "5")
    {
        column_type = "DATE";
        length_value = "";
        return true;
    }
    else if(column_type_id == "6")
    {
        column_type = "TIME";
        length_value = "";
        return true;
    }
    else if(column_type_id == "9")
    {
        column_type = "INT";
        length_value = "(11)";
        return true;
    }
    else if(column_type_id == "12" || column_type_id == "13")
    {
        column_type = "DATETIME";
        length_value = "";
        return true;
    }
    else
    {
        return false;
    } 
}