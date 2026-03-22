
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
            "v.id AS id, v.name AS name, v.conditions AS conditions, v.`order` AS 'order', v.id_table AS id_table " \
        "FROM views v " \
        "JOIN tables f ON f.id = v.id_table " \
        "WHERE " \
            "f.id_database = (SELECT id FROM `databases` WHERE identifier = ?) AND f.identifier = ? "
    );

    action->AddParameter_("id_database", get_database_id(), false);

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
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/read/id", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("a1");
    A1(action);

    get_functions()->push_back(function);
}

void Views::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "v.id AS id, v.name AS name, v.conditions AS conditions, v.`order` AS 'order', v.id_table AS id_table " \
        "FROM views v " \
        "JOIN tables f ON f.id = v.id_table " \
        "WHERE " \
            "f.id_database = (SELECT id FROM `databases` WHERE identifier = ?) AND f.identifier = ? AND v.id = ?"
    );

    action->AddParameter_("id_database", get_database_id(), false);

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
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de vista no puede estar vacío");
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
    
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Views::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO views (name, conditions, `order`, id_table) "
        "SELECT "
            "?, ?, ? "
            ",(SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)) "
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
    action->AddParameter_("conditions", "", true);
    action->AddParameter_("order", "", true);
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
    action->AddParameter_("id_database", get_database_id(), false);
}

Views::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function PUT /api/tables/views/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "UPDATE views "
        "SET name = ?, conditions = ?, `order` = ? "
        "WHERE "
            "id = ? "
            "AND id_table = (SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)) "
    );
    A1(action1);
    get_functions()->push_back(function);
}

void Views::Modify::A1(StructBX::Functions::Action::Ptr action)
{
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
    action->AddParameter_("conditions", "", true);
    action->AddParameter_("order", "", true);
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El id de la vista no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de formulario no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);
}

Views::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function DEL /api/tables/views/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/views/delete", HTTP::EnumMethods::kHTTP_DEL);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "DELETE FROM views " \
        "WHERE id = ? AND id_table = (SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?))"
    );
    A1(action1);

    get_functions()->push_back(function);
}

void Views::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de la vista no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
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