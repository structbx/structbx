
#include "controllers/tables/columns.h"
#include "tools/dvalue.h"

using namespace StructBX::Controllers::Tables;

Columns::Columns(Tools::FunctionData& function_data) :
    FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_specific_(function_data)
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

    // Action 1: Get table id
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Columns::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "tc.identifier, tc.name, tc.required, tc.default_value, tc.description, tc.link_to, tc.column_type, " \
            "t.identifier AS table_identifier " \
            ",(SELECT name FROM tables WHERE identifier = tc.link_to) AS link_to_table_name " \
            ",COALESCE(vc.position, tc.position) AS final_position " \
            ",COALESCE(vc.visible, 1) AS visible " \
        "FROM tables_columns tc " \
        "JOIN tables t ON t.identifier = tc.id_table " \
        "LEFT JOIN views_columns vc ON vc.id_column = tc.identifier AND vc.id_view = ? " \
        "WHERE " \
            "t.identifier = ? "
        "ORDER BY COALESCE(vc.position, tc.position) ASC"
    );
    action->AddParameter_("view-identifier", "", true);
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
}

Columns::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/columns/read/identifier
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/read/identifier", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("a1");
    A1(action);

    get_functions()->push_back(function);
}

void Columns::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "tc.identifier, tc.name, tc.required, tc.default_value, tc.description, tc.link_to, tc.column_type, " \
            "t.identifier AS table_identifier " \
            ",(SELECT name FROM tables WHERE identifier = tc.link_to) AS link_to_table_name " \
        "FROM tables_columns tc " \
        "JOIN tables t ON t.identifier = tc.id_table " \
        "WHERE " \
            "tc.identifier = ? AND t.identifier = ?"
    );
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
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

    // Action 3: Save the column
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Action 4: Add the column in the table
    auto action4 = function->AddAction_("a4");

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2, action4](StructBX::Functions::Function& self)
    {
        // If error, delete the column from the table
        auto delete_column_table = [](std::string column_id)
        {
            // Delete database from table
            StructBX::Functions::Action action("action_delete_column");
            action.set_sql_code("DELETE FROM tables_columns WHERE identifier = ?");
            action.AddParameter_("identifier", column_id, false);
            action.Work_();
        };

        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }

        // Set column identifier
        Tools::RandomGenerator rg;
        auto column_identifier = rg.GenerateAlphanumericID_(20);
        action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(column_identifier)), "identifier");
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2->get_identifier() + ": " + action2->get_custom_error());
            return;
        }

        // Get table IDENTIFIER
        auto table_identifier = self.GetParameter_("table-identifier");
        if(table_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error nh39HIiJkd");
            return;
        }

        // Setup column variables
        auto column_setup = ColumnSetup();
        auto variables = ColumnVariables();
        if(!column_setup.Setup(self, variables))
        {
            delete_column_table(column_identifier);
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error e4GBhN1lxk");
            return;
        }

        // Action 4: Add the column in the table
        action4->set_sql_code(
            "ALTER TABLE " + database_id + "." + table_identifier->get()->ToString_() + " " +
            "ADD " + column_identifier + " " + variables.column_type + " " +
            + " NULL " + variables.default_value
        );
        if(!action4->Work_())
        {
            delete_column_table(column_identifier);
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action4->get_identifier() + ": " + action4->get_custom_error());
            return;
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Columns::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT identifier FROM tables WHERE identifier = ?");
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
}

void Columns::Add::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_columns (identifier, name, position "
            ",required, default_value, description, column_type, link_to, id_table) "
        "SELECT ?,? "
            ",MAX(position) + 10 "
            ",?,?,?,?,?,id_table "
        "FROM tables_columns WHERE id_table = ?"
    );

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
    action->AddParameter_("column_type", "", true)
    ->SetupCondition_("condition-column_type", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
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
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
}

Columns::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/columns/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/modify", HTTP::EnumMethods::kHTTP_PUT);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Get column info
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Update the column
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_() || action1->get_results()->begin() == action1->get_results()->end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }

        // Get parameters
        auto table_identifier = self.GetParameter_("table-identifier");
        auto column_identifier = self.GetParameter_("identifier");
        if(table_identifier == self.get_parameters().end() || column_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error KOBE4bH6qL");
            return;
        }

        // Get current column type and default value
        auto column_type = action1->get_results()->begin()->get()->ExtractField_("column_type");
        auto default_value = action1->get_results()->begin()->get()->ExtractField_("default_value");

        // Get new column type and default value
        auto new_default_value = self.GetParameter_("default_value");
        auto new_column_type = self.GetParameter_("column_type");
        if(new_default_value == self.get_parameters().end() || new_column_type == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "8FP97U8fjCyb");
            return;
        }

        // if column type or default value changes, alter table
        if(column_type->ToString_() != new_column_type->get()->ToString_() || default_value->ToString_() != new_default_value->get()->ToString_())
        {
            // Alter table column
            // Setup column variables
            auto column_setup = ColumnSetup();
            auto variables = ColumnVariables();
            if(!column_setup.Setup(self, variables))
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error WW17KL82QJ");
                return;
            }
            std::string column = column_identifier->get()->ToString_();

            auto action_alter_table = self.AddAction_("action_alter_table");
            action_alter_table->set_sql_code(
                "ALTER TABLE " + database_id + "." + table_identifier->get()->ToString_() + " " +
                "CHANGE COLUMN `" + column + "` " + column + 
                " " + variables.column_type + " " + variables.required +
                " " + variables.default_value
            );
            if(!action_alter_table->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action_alter_table->get_identifier() + ": " + action_alter_table->get_custom_error());
                return;
            }
        }
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2->get_identifier() + ": " + action2->get_custom_error());
            return;
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Columns::Modify::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT * FROM tables_columns WHERE identifier = ?");
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("La columna solicitada no existe");
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Columns::Modify::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE tables_columns SET " \
            "name = ?, required = ? " \
            ",default_value = ?, description = ?, column_type = ?, link_to = ? " \
        "WHERE identifier = ? AND id_table = ?"
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
    action->AddParameter_("column_type", "", true)
    ->SetupCondition_("condition-column_type", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El tipo de columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("link_to", StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()), true)
    ->SetupCondition_("condition-link_to", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue()));
        }
        return true;
    });
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de la columna no puede estar vacío");
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

    // Action: Insert column override
    auto insert_column_override = function->AddAction_("insert_column_override");
    InsertColumnOverride(insert_column_override);

    // Setup Custom Process
    function->SetupCustomProcess_([action1, action2, insert_column_override](StructBX::Functions::Function& self)
    {
        // Get columnPrev and columnNext parameters
        auto column_prev_param = self.GetParameter_("columnPrev");
        auto column_next_param = self.GetParameter_("columnNext");
        
        // Validate that both parameters are not null at the same time
        if(column_prev_param == self.get_parameters().end() && 
           column_next_param == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, 
                              "Error: Both columnPrev and columnNext cannot be null");
            return;
        }

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

        // Calculate new_position_float based on the parameters
        float new_position_float = 0.0;
        
        if(column_prev_param == self.get_parameters().end())
        {
            // columnNext is null, use /2 logic
            new_position_float = new_position->Float_() / 2.0;
            action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position_float)), "position");
            insert_column_override->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position_float)), "position");
        }
        else if(column_next_param == self.get_parameters().end())
        {
            // columnPrev is null, use +5 logic
            new_position_float = new_position->Float_() + 5.0;
            action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position_float)), "position");
            insert_column_override->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position_float)), "position");
        }
        else
        {
            action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position->ToString_())), "position");
            insert_column_override->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position->ToString_())), "position");
        }

        auto column_identifier = self.GetParameter_("identifier");
        auto view_identifier = self.GetParameter_("view-identifier");
        if(column_identifier == self.get_parameters().end() || view_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "There is empty parameters.");
            return;
        }
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2->get_identifier() + ": " + action2->get_custom_error());
            return;
        }

        insert_column_override->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(column_identifier->get()->ToString_())), "identifier2");
        insert_column_override->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(view_identifier->get()->ToString_())), "view-identifier2");
        if(!insert_column_override->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + insert_column_override->get_identifier() + ": " + insert_column_override->get_custom_error());
            return;
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");

    });
    get_functions()->push_back(function);
}

void Columns::ModifyPosition::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT AVG(COALESCE(vc2.position, vc.position)) "
        "FROM tables_columns vc "
        "LEFT JOIN views_columns vc2 ON vc2.id_column = vc.identifier AND vc2.id_view = ? "
        "WHERE vc.identifier IN (?, ?) "
    );

    action->AddParameter_("view-identifier", "", true);
    action->AddParameter_("columnPrev", "", true);
    action->AddParameter_("columnNext", "", true);
}

void Columns::ModifyPosition::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE views_columns "
        "SET position = ? "
        "WHERE id_column = ? AND id_view = ? "
    );

    action->AddParameter_("position", "", false);
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("view-identifier", "", true);
}

void Columns::ModifyPosition::InsertColumnOverride(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO views_columns (id_view, id_column, position, visible) "
        "SELECT ?, ?, ?, NULL "
        "WHERE NOT EXISTS ("
        "   SELECT 1 FROM views_columns "
        "   WHERE id_view = ? AND id_column = ?)"
    );

    action->AddParameter_("view-identifier", "", true);
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("position", "", false);
    action->AddParameter_("view-identifier2", "", true);
    action->AddParameter_("identifier2", "", true);
}

Columns::ModifyVisible::ModifyVisible(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/columns/visible/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/columns/visible/modify", HTTP::EnumMethods::kHTTP_PUT);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Set visible
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action: Insert column override
    auto insert_column_override = function->AddAction_("insert_column_override");
    InsertColumnOverride(insert_column_override);

    // Setup Custom Process
    function->SetupCustomProcess_([action1, insert_column_override](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }

        auto column_identifier = self.GetParameter_("identifier");
        auto view_identifier = self.GetParameter_("view-identifier");
        if(column_identifier == self.get_parameters().end() || view_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "There is empty parameters.");
            return;
        }
        insert_column_override->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(column_identifier->get()->ToString_())), "identifier2");
        insert_column_override->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(view_identifier->get()->ToString_())), "view-identifier2");
        if(!insert_column_override->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + insert_column_override->get_identifier() + ": " + insert_column_override->get_custom_error());
            return;
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });
    
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
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
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

void Columns::ModifyVisible::InsertColumnOverride(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO views_columns (id_view, id_column, visible, position) "
        "SELECT ?, ?, ?, NULL "
        "WHERE NOT EXISTS ("
        "   SELECT 1 FROM views_columns "
        "   WHERE id_view = ? AND id_column = ?)"
    );

    action->AddParameter_("view-identifier", "", true);
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("visible", "", true);
    action->AddParameter_("view-identifier2", "", true);
    action->AddParameter_("identifier2", "", true);
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

    // Action 2: Delete column metadata
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, action1, action2](StructBX::Functions::Function& self)
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

        // Get Column identifier
        auto column_identifier = self.GetParameter_("identifier");
        if(column_identifier == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error sk28skvX9W");
            return;
        }

        // Delete column from table
        auto delete_from_table = self.AddAction_("a2");

        delete_from_table->set_sql_code(
            "ALTER TABLE " + database_id + "." + table_identifier->get()->ToString_() + " " +
            "DROP COLUMN IF EXISTS " + column_identifier->get()->ToString_());
        if(!delete_from_table->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + delete_from_table->get_identifier() + ": " + delete_from_table->get_custom_error());
            return;
        }
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2->get_identifier() + ": " + action2->get_custom_error());
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
        "SELECT identifier AS column_identifier " \
        "FROM tables_columns " \
        "WHERE identifier = ? AND id_table = ?"
    );
    action->set_final(false);
    action->SetupCondition_("verify-table-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() != 1)
        {
            self.set_custom_error("La columna solicitada no existe en la tabla actual");
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
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
}

void Columns::Delete::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("DELETE FROM tables_columns WHERE identifier = ?");

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
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
    auto required = self.GetParameter_("required");
    auto default_value = self.GetParameter_("default_value");
    auto column_type = self.GetParameter_("column_type");
    auto table_identifier = self.GetParameter_("table-identifier");
    if(
        name == end || required == end ||
        default_value == end || column_type == end || table_identifier == end
    )
        return false;

    // Column Type setup
    std::string column_type_str = column_type->get()->ToString_();
    auto column_type_setup = ColumnTypeSetup();
    if(!column_type_setup.Setup(column_type_str, variables.column_type))
        return false;

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
        (column_type_str == "selection") &&
        (
            variables.link_to == "" 
            || link_to->get()->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kEmpty)
        )
    )
        return false;
    
    return true;
}

bool Columns::ColumnTypeSetup::Setup(std::string column_type_str, std::string& column_type)
{
    if(column_type_str == "text" || column_type_str == "user" || column_type_str == "current-user")
    {
        column_type = "VARCHAR (500)";
        return true;
    }
    else if(column_type_str == "long-text" || column_type_str == "file" || column_type_str == "image")
    {
        column_type = "TEXT";
        return true;
    }
    else if(column_type_str == "int-number")
    {
        column_type = "INT";
        return true;
    }
    else if(column_type_str == "decimal-number")
    {
        column_type = "DECIMAL (20, 5)";
        return true;
    }
    else if(column_type_str == "date")
    {
        column_type = "DATE";
        return true;
    }
    else if(column_type_str == "time")
    {
        column_type = "TIME";
        return true;
    }
    else if(column_type_str == "selection")
    {
        column_type = "VARCHAR (20)";
        return true;
    }
    else if(column_type_str == "created-date" || column_type_str == "updated-date")
    {
        column_type = "DATETIME";
        return true;
    }
    else
    {
        return false;
    } 
}