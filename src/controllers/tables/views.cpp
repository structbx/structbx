
#include "controllers/tables/views.h"

using namespace StructBX::Controllers::Tables;

Views::Views(Tools::FunctionData& function_data) :
    FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

Views::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/views/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/read", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("a1");
    A1(action);

    get_functions()->push_back(function);
}

void Views::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "v.identifier AS identifier, v.name AS name " \
        "FROM views v " \
        "JOIN tables f ON f.identifier = v.id_table " \
        "WHERE " \
            "f.identifier = ? "
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
}

Views::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/views/read/id
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/read/identifier", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("a1");
    A1(action);

    get_functions()->push_back(function);
}

void Views::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "v.identifier AS identifier, v.name AS name " \
        "FROM views v " \
        "JOIN tables f ON f.identifier = v.id_table " \
        "WHERE " \
            "f.identifier = ? AND v.identifier = ?"
    );

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
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de vista no puede estar vacío");
            return false;
        }
        return true;
    });
}

Views::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/views/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/add", HTTP::EnumMethods::kHTTP_POST);
    
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action 1: Save the view
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Action 2: Add all table columns to the view
    auto action2 = function->AddAction_("a2");
    A2(action2);
    
    // Setup Custom Process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([action1, action2](StructBX::Functions::Function& self)
    {
        Tools::RandomGenerator rg;
        auto table_identifier = rg.GenerateAlphanumericID_(20);
        
        // Action 1: Save the view
        action1->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(table_identifier)), "identifier");
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "xnA6uie2nfiu");
            return;
        }
        // Action 2: Add all table columns to the view
        action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(table_identifier)), "identifier");
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "retJiMthjcJC");
            return;
        }

        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
    });

    get_functions()->push_back(function);
}

void Views::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO views (identifier, name, id_table) "
        "SELECT "
            "?, ?, ?"
    );
    action->AddParameter_("identifier", "", false);
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El nombre no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Views::Add::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO views_columns (id_view, id_column, position, visible) "
        "SELECT "
            "?, tc.id "
            ",ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY tc.id) * 10.0 "
            ", 1 "
        "FROM tables_columns tc "
        "JOIN tables t ON t.id = tc.id_table "
        "WHERE t.identifier = ? "
    );
    action->AddParameter_("identifier", "", false);
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
}

Views::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function PUT /api/tables/views/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    auto action1 = function->AddAction_("a1");
    A1(action1);
    get_functions()->push_back(function);
}

void Views::Modify::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE views "
        "SET name = ? "
        "WHERE "
            "identifier = ?"
    );
    action->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El nombre no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de la vista no puede estar vacío");
            return false;
        }
        return true;
    });
}

Views::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function DEL /api/tables/views/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/delete", HTTP::EnumMethods::kHTTP_DEL);
    
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Views::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "DELETE FROM views " \
        "WHERE identifier = ?"
    );
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de la vista no puede estar vacío");
            return false;
        }
        return true;
    });
}