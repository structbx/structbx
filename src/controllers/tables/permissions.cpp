
#include "controllers/tables/permissions.h"
#include "core/error_codes.h"

using namespace StructBX::Controllers::Tables;

Permissions::Permissions(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_current_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_read_users_out_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

Permissions::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/read", HTTP::EnumMethods::kHTTP_GET);

    auto action1 = function->AddAction_("read_table_permissions");
    ReadTablePermissions(action1);

    get_functions()->push_back(function);
}

void Permissions::Read::ReadTablePermissions(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fp.identifier, fp.`read`, fp.`add`, fp.`modify`, fp.`delete`, fp.just_owner, nu.username " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.identifier " \
        "JOIN users nu ON nu.identifier = fp.id_user "
        "WHERE f.identifier = ?"
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

Permissions::Current::Current(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/tables/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/current/read", HTTP::EnumMethods::kHTTP_GET);

    auto action1 = function->AddAction_("read_user_accessible_tables");
    ReadUserAccessibleTables(action1);

    get_functions()->push_back(function);
}

void Permissions::Current::ReadUserAccessibleTables(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT f.identifier AS table_identifier " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.identifier " \
        "JOIN users nu ON nu.identifier = fp.id_user "
        "WHERE fp.read = 1 AND fp.id_user = ? AND f.id_database = ?"
    );

    action->AddParameter_("id_user", get_id_user(), false);
    action->AddParameter_("id_database", get_database_id(), false);
}

Permissions::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/read/identifier
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/read/identifier", HTTP::EnumMethods::kHTTP_GET);

    auto action1 = function->AddAction_("read_specific_permission");
    ReadSpecificPermission(action1);

    get_functions()->push_back(function);
}

void Permissions::ReadSpecific::ReadSpecificPermission(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fp.*, nu.username AS username, f.name AS table_name " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.identifier " \
        "JOIN users nu ON nu.identifier = fp.id_user "
        "WHERE fp.identifier = ? AND f.identifier = ? AND f.id_database = ?"
    );

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-iidentifierd", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table permission identifier cannot be empty.");
            return false;
        }
        return true;
    });
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
    action->AddParameter_("id_database", get_database_id(), false);
}

Permissions::ReadUsersOut::ReadUsersOut(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/users/out/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/users/out/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("read_unassigned_table_users");
    ReadUnassignedTableUsers(action1);

    get_functions()->push_back(function);
}

void Permissions::ReadUsersOut::ReadUnassignedTableUsers(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT nu.identifier, nu.username "
        "FROM users nu "
        "JOIN databases_users du ON du.id_user = nu.identifier "
        "LEFT JOIN tables_permissions su ON "
            "su.id_user = nu.identifier AND "
            "su.id_table = ? "
        "WHERE "
            "su.id_user IS NULL AND nu.type = 'default' AND du.id_database = ?"
    );

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
    action->AddParameter_("id_database", get_database_id(), false);
}

Permissions::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/add", HTTP::EnumMethods::kHTTP_POST);
    
    auto action1 = function->AddAction_("insert_table_permission");
    InsertTablePermission(action1);

    get_functions()->push_back(function);
}

void Permissions::Add::InsertTablePermission(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_permissions (identifier, `read`, `add`, `modify`, `delete`, `just_owner`, id_user, id_table) "
        "SELECT "
            "?, ?, ?, ?, ?, ? "
            ",(SELECT id_user FROM databases_users WHERE id_user = ? AND id_database = ?) "
            ",? "
    );

    auto identifier = Tools::RandomGenerator().GenerateAlphanumericID_(20);
    action->AddParameter_("identifier", identifier, false);
    action->AddParameter_("read", "", true)
    ->SetupCondition_("condition-read", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("add", "", true)
    ->SetupCondition_("condition-add", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("modify", "", true)
    ->SetupCondition_("condition-modify", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("delete", "", true)
    ->SetupCondition_("condition-delete", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("just_owner", "", true)
    ->SetupCondition_("condition-just_owner", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("id_user", "", true)
    ->SetupCondition_("condition-id_user", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The user identifier cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

Permissions::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    auto action1 = function->AddAction_("modify_table_permission");
    action1->set_sql_code(
        "UPDATE tables_permissions "
        "SET `read` = ?, `add` = ?, `modify` = ?, `delete` = ?, `just_owner` = ? "
        "WHERE "
            "identifier = ? "
            "AND id_table = ? "
    );
    ModifyTablePermission(action1);
    get_functions()->push_back(function);
}

void Permissions::Modify::ModifyTablePermission(StructBX::Functions::Action::Ptr action)
{
    action->AddParameter_("read", "", true)
    ->SetupCondition_("condition-read", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("add", "", true)
    ->SetupCondition_("condition-add", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("modify", "", true)
    ->SetupCondition_("condition-modify", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("delete", "", true)
    ->SetupCondition_("condition-delete", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("just_owner", "", true)
    ->SetupCondition_("condition-just_owner", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() != "0" && param->ToString_() != "1")
        {
            param->set_value(std::make_shared<StructBX::Tools::DValue>(1));
        }
        return true;
    });
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The table permission identifier cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The table identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

Permissions::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/delete", HTTP::EnumMethods::kHTTP_DEL);
    
    auto action1 = function->AddAction_("delete_table_permission");
    action1->set_sql_code(
        "DELETE FROM tables_permissions " \
        "WHERE identifier = ? AND id_table = ?"
    );
    DeleteTablePermission(action1);

    get_functions()->push_back(function);
}

void Permissions::Delete::DeleteTablePermission(StructBX::Functions::Action::Ptr action)
{
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The table permission identifier cannot be empty.");
            return false;
        }
        return true;
    });
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
