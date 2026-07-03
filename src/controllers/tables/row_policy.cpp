
#include "controllers/tables/row_policy.h"
#include "core/error_codes.h"

using namespace StructBX::Controllers::Tables;

RowPolicy::RowPolicy(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

RowPolicy::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/row-policy/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/row-policy/read", HTTP::EnumMethods::kHTTP_GET);

    auto action1 = function->AddAction_("read_table_row_policies");
    ReadPoliciesByTable(action1);

    get_functions()->push_back(function);
}

void RowPolicy::Read::ReadPoliciesByTable(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT rp.identifier, rp.policy_name, rp.target_type, rp.target_id, "
        "rp.action_type, rp.filter_column, rp.filter_operator, rp.filter_value, "
        "rp.is_active, rp.priority, rp.created_at "
        "FROM tables_row_policies rp "
        "WHERE rp.id_table = ? "
        "ORDER BY rp.priority ASC"
    );

    action->AddParameter_("table-identifier", "", true)
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

RowPolicy::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/row-policy/read/identifier
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/row-policy/read/identifier", HTTP::EnumMethods::kHTTP_GET);

    auto action1 = function->AddAction_("read_specific_row_policy");
    ReadPolicyByIdentifier(action1);

    get_functions()->push_back(function);
}

void RowPolicy::ReadSpecific::ReadPolicyByIdentifier(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT rp.*, t.name AS table_name "
        "FROM tables_row_policies rp "
        "JOIN tables t ON t.identifier = rp.id_table "
        "WHERE rp.identifier = ? AND t.id_database = ?"
    );

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The row policy identifier cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);
}

RowPolicy::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/tables/row-policy/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/row-policy/add", HTTP::EnumMethods::kHTTP_POST);

    auto action1 = function->AddAction_("insert_row_policy");
    InsertPolicy(action1);

    get_functions()->push_back(function);
}

void RowPolicy::Add::InsertPolicy(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_row_policies "
        "(identifier, id_table, policy_name, target_type, target_id, "
        "action_type, filter_column, filter_operator, filter_value, is_active, priority) "
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    auto identifier = Tools::RandomGenerator().GenerateAlphanumericID_(20);
    action->AddParameter_("identifier", identifier, false);

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("policy_name", "", true);

    action->AddParameter_("target_type", "", true)
    ->SetupCondition_("condition-target_type", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        auto val = param->get_value()->ToString_();
        if(val != "all" && val != "user" && val != "group" && val != "user_type")
        {
            param->set_error("Invalid target type. Must be: all, user, group, or user_type.");
            return false;
        }
        return true;
    });

    action->AddParameter_("target_id", "", true);

    action->AddParameter_("action_type", "", true)
    ->SetupCondition_("condition-action_type", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        auto val = param->get_value()->ToString_();
        if(val != "filter" && val != "bypass")
        {
            param->set_error("Invalid action type. Must be: filter or bypass.");
            return false;
        }
        return true;
    });

    action->AddParameter_("filter_column", "", true);
    action->AddParameter_("filter_operator", "", true)
    ->SetupCondition_("condition-filter_operator", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        auto val = param->get_value()->ToString_();
        if(valid_filters_ops.find(val) == valid_filters_ops.end())
        {
            param->set_error("Invalid filter operator.");
            return false;
        }
        return true;
    });

    action->AddParameter_("filter_value", "", true);
    action->AddParameter_("is_active", 1, true);
    action->AddParameter_("priority", 0, true);
}

RowPolicy::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function PUT /api/tables/row-policy/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/row-policy/modify", HTTP::EnumMethods::kHTTP_PUT);

    auto action1 = function->AddAction_("update_row_policy");
    action1->set_sql_code(
        "UPDATE tables_row_policies "
        "SET policy_name = ?, target_type = ?, target_id = ?, "
        "action_type = ?, filter_column = ?, filter_operator = ?, "
        "filter_value = ?, is_active = ?, priority = ? "
        "WHERE identifier = ? AND id_table = ?"
    );
    UpdatePolicy(action1);

    get_functions()->push_back(function);
}

void RowPolicy::Modify::UpdatePolicy(StructBX::Functions::Action::Ptr action)
{
    action->AddParameter_("policy_name", "", true);

    action->AddParameter_("target_type", "", true)
    ->SetupCondition_("condition-target_type", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        auto val = param->get_value()->ToString_();
        if(val != "all" && val != "user" && val != "group" && val != "user_type")
        {
            param->set_error("Invalid target type. Must be: all, user, group, or user_type.");
            return false;
        }
        return true;
    });

    action->AddParameter_("target_id", "", true);

    action->AddParameter_("action_type", "", true)
    ->SetupCondition_("condition-action_type", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        auto val = param->get_value()->ToString_();
        if(val != "filter" && val != "bypass")
        {
            param->set_error("Invalid action type. Must be: filter or bypass.");
            return false;
        }
        return true;
    });

    action->AddParameter_("filter_column", "", true);
    action->AddParameter_("filter_operator", "", true)
    ->SetupCondition_("condition-filter_operator", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        auto val = param->get_value()->ToString_();
        if(valid_filters_ops.find(val) == valid_filters_ops.end())
        {
            param->set_error("Invalid filter operator.");
            return false;
        }
        return true;
    });

    action->AddParameter_("filter_value", "", true);
    action->AddParameter_("is_active", 1, true);
    action->AddParameter_("priority", 0, true);

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The row policy identifier cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

RowPolicy::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function DEL /api/tables/row-policy/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/row-policy/delete", HTTP::EnumMethods::kHTTP_DEL);

    auto action1 = function->AddAction_("delete_row_policy");
    action1->set_sql_code(
        "DELETE FROM tables_row_policies "
        "WHERE identifier = ? AND id_table = ?"
    );
    DeletePolicy(action1);

    get_functions()->push_back(function);
}

void RowPolicy::Delete::DeletePolicy(StructBX::Functions::Action::Ptr action)
{
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The row policy identifier cannot be empty.");
            return false;
        }
        return true;
    });

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
}
