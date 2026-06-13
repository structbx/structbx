
#include "controllers/tables/filters.h"
#include "tools/dvalue.h"

using namespace StructBX::Controllers::Tables;

Filters::Filters(Tools::FunctionData& function_data) :
    FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_modify_position_(function_data)
    ,struct_modify_visible_(function_data)
    ,struct_delete_(function_data)
{
    
}

Filters::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/filters/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/filters/read", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("a1");
    A1(action);

    get_functions()->push_back(function);
}

void Filters::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "vf.identifier, vf.id_column, vf.op, vf.value, vf.position, vf.is_active " \
        "FROM views_filters vf " \
        "JOIN views v ON v.identifier = vf.id_view " \
        "JOIN tables f ON f.identifier = v.id_table " \
        "WHERE v.identifier = ? AND f.identifier = ? ORDER BY vf.position ASC"
    );

    action->AddParameter_("view-identifier", "", true)
    ->SetupCondition_("condition-view-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de vista no puede estar vacío");
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

Filters::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/filters/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/filters/add", HTTP::EnumMethods::kHTTP_POST);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 2: Get filter position (last + 10)
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Action 1: Save the filter
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([action1, action2](StructBX::Functions::Function& self)
    {
        // Get filter position (last + 10)
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action2->get_identifier() + ": " + action2->get_custom_error());
            return;
        }

        // Get new position
        auto position = action2->get_results()->First_();
        int new_position = 10;
        if(action2->get_results()->size() > 0 && !position->IsNull_())
        {
            new_position = position->Float_() + 10;
        }
        action1->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position)), "position");

        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }

        // Send results
        auto identifier = action1->GetParameter_("identifier");
        if(identifier == action1->get_parameters().end())
            self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
        else
            self.JSONResponse_(HTTP::Status::kHTTP_OK, identifier->get()->ToString_());
    });

    get_functions()->push_back(function);
}

void Filters::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO views_filters (identifier, id_view, id_column, op, value, position, is_active) "
        "SELECT ?, v.identifier, tc.identifier, ?, ?, ?, ? "
        "FROM tables_columns tc "
        "JOIN tables t ON t.identifier = tc.id_table "
        "JOIN views v ON v.id_table = t.identifier "
        "WHERE v.identifier = ? AND v.id_table = ? AND tc.identifier = ? "
    );

    Tools::RandomGenerator rg;
    action->AddParameter_("identifier", rg.GenerateAlphanumericID_(20), false);

    action->AddParameter_("op", "", true)
    ->SetupCondition_("condition-op", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El tipo de operación no puede estar vacío");
            return false;
        }
        if(valid_filters_ops.find(param->get_value()->ToString_()) == valid_filters_ops.end())
        {
            param->set_value(Tools::DValue::Ptr(new Tools::DValue("=")));
        }
        return true;
    });
    action->AddParameter_("value", "", true)
    ->SetupCondition_("condition-value", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El valor no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("position", "", true)
    ->SetupCondition_("condition-position", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("La posición no puede estar vacía");
            return false;
        }
        return true;
    });
    action->AddParameter_("is-active", "", true)
    ->SetupCondition_("condition-is-active", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("is-active no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("view-identifier", "", true)
    ->SetupCondition_("condition-view-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de vista no puede estar vacío");
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
    action->AddParameter_("column-identifier", "", true)
    ->SetupCondition_("condition-column-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Filters::Add::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT MAX(vc.position) AS position " \
        "FROM views_filters vc " \
        "JOIN views v ON v.identifier = vc.id_view "
        "WHERE vc.id_view = ? AND v.id_table = ? "
    );

    action->AddParameter_("view-identifier", "", true)
    ->SetupCondition_("condition-view-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de vista no puede estar vacío");
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

Filters::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/filters/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/filters/modify", HTTP::EnumMethods::kHTTP_PUT);

    // Action 1: Update the filter
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Filters::Modify::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE views_filters " \
        "SET id_column = ?, op = ?, value = ?, is_active = ? " \
        "WHERE identifier = ? AND id_view = ?"
    );

    action->AddParameter_("column-identifier", "", true)
    ->SetupCondition_("condition-column-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de columna no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("op", "", true)
    ->SetupCondition_("condition-op", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El tipo de operación no puede estar vacío");
            return false;
        }
        if(valid_filters_ops.find(param->get_value()->ToString_()) == valid_filters_ops.end())
        {
            param->set_value(Tools::DValue::Ptr(new Tools::DValue("=")));
        }
        return true;
    });
    action->AddParameter_("value", "", true)
    ->SetupCondition_("condition-value", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El valor no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("is-active", "", true)
    ->SetupCondition_("condition_is-active", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("is-active no puede estar vacío");
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
    action->AddParameter_("view-identifier", "", true)
    ->SetupCondition_("condition-view-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de vista no puede estar vacío");
            return false;
        }
        return true;
    });
}

Filters::ModifyPosition::ModifyPosition(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/filters/position/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/filters/position/modify", HTTP::EnumMethods::kHTTP_PUT);

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
        // Get filterPrev and filterNext parameters
        auto filter_prev_param = self.GetParameter_("filterPrev");
        auto filter_next_param = self.GetParameter_("filterNext");
        
        // Validate that both parameters are not null at the same time
        if(filter_prev_param == self.get_parameters().end() && 
           filter_next_param == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, 
                              "Error: Both filterPrev and filterNext cannot be null");
            return;
        }

        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action1->get_identifier() + ": " + action1->get_custom_error());
            return;
        }
        auto new_position = action1->get_results()->First_();
        if(new_position->IsNull_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "No se pudo mover la posición del filtro");
            return;
        }
        
        // Calculate new_position_float based on the parameters
        float new_position_float = 0.0;
        
        if(filter_prev_param == self.get_parameters().end())
        {
            // filterNext is null, use /2 logic
            new_position_float = new_position->Float_() / 2.0;
            action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position_float)), "position");
        }
        else if(filter_next_param == self.get_parameters().end())
        {
            // filterPrev is null, use +5 logic
            new_position_float = new_position->Float_() + 5.0;
            action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(new_position_float)), "position");
        }
        else
        {
            action2->SetValueToParamater_(
                Tools::DValue::Ptr(
                    new Tools::DValue(new_position->ToString_())), "position");
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

void Filters::ModifyPosition::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT AVG(vc.position) "
        "FROM views_filters vc "
        "WHERE vc.identifier IN (?, ?) AND vc.id_view = ? "
    );

    action->AddParameter_("filterPrev", "", true);
    action->AddParameter_("filterNext", "", true);
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

void Filters::ModifyPosition::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE views_filters "
        "SET position = ? "
        "WHERE identifier = ? AND id_view = ? "
    );

    action->AddParameter_("position", "", false);
    action->AddParameter_("identifier", "", true);
    action->AddParameter_("view-identifier", "", true);
}

Filters::ModifyVisible::ModifyVisible(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/columns/visible/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/filters/visible/modify", HTTP::EnumMethods::kHTTP_PUT);

    // Action 1: Set visible
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Filters::ModifyVisible::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE views_filters "
        "SET visible = ? "
        "WHERE identifier = ? AND id_view = ? "
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
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador no puede estar vacía");
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

Filters::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/filters/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/filters/delete", HTTP::EnumMethods::kHTTP_DEL);

    // Action 1: Delete filter
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Filters::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "DELETE FROM views_filters WHERE identifier = ? AND id_view = ? "
    );
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de filtro no puede estar vacío");
            return false;
        }
        return true;
    });

    action->AddParameter_("view-identifier", "", true)
    ->SetupCondition_("condition-view-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de vista no puede estar vacío");
            return false;
        }
        return true;
    });

}
