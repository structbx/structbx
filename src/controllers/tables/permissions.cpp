
#include "controllers/tables/permissions.h"

using namespace StructBX::Controllers::Tables;

Permissions::Permissions(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,struct_read_(function_data)
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

    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Permissions::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fp.*, nu.username AS username, f.name AS table_name " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.id " \
        "JOIN users nu ON nu.id = fp.id_naf_user "
        "WHERE f.identifier = ? AND f.id_database = (SELECT id FROM `databases` WHERE identifier = ?)"
    );

    action->AddParameter_("table-identifier", "", true)
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

Permissions::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/read/id
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/read/id", HTTP::EnumMethods::kHTTP_GET);

    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Permissions::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT fp.*, nu.username AS username, f.name AS table_name " \
        "FROM tables f " \
        "JOIN tables_permissions fp ON fp.id_table = f.id " \
        "JOIN users nu ON nu.id = fp.id_naf_user "
        "WHERE fp.id = ? AND f.identifier = ? AND f.id_database = (SELECT id FROM `databases` WHERE identifier = ?)"
    );

    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id del permiso de formulario no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
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

Permissions::ReadUsersOut::ReadUsersOut(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/users/out/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/users/out/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Permissions::ReadUsersOut::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT nu.id, nu.username "
        "FROM users nu "
        "JOIN databases_users du ON du.id_naf_user = nu.id "
        "LEFT JOIN tables_permissions su ON "
            "su.id_naf_user = nu.id AND "
            "su.id_table = (SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)) "
        "WHERE "
            "su.id_naf_user IS NULL AND nu.type = 'default'"
    );

    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de la tabla no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_id", get_database_id(), false);
}

Permissions::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/add", HTTP::EnumMethods::kHTTP_POST);
    
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Permissions::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_permissions (`read`, `add`, `modify`, `delete`, `just_owner`, id_naf_user, id_table) "
        "SELECT "
            "?, ?, ?, ?, ? "
            ",(SELECT id_naf_user FROM databases_users WHERE id_naf_user = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)) "
            ",(SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)) "
    );
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
            param->set_error("El id de usuario no puede estar vacío");
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
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);
}

Permissions::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "UPDATE tables_permissions "
        "SET `read` = ?, `add` = ?, `modify` = ?, `delete` = ?, `just_owner` = ? "
        "WHERE "
            "id = ? "
            "AND id_table = (SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)) "
    );
    A1(action1);
    get_functions()->push_back(function);
}

void Permissions::Modify::A1(StructBX::Functions::Action::Ptr action)
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
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El id del permiso de formulario no puede estar vacío");
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
    action->AddParameter_("id_database", get_database_id(), false);
}

Permissions::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/permissions/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/permissions/delete", HTTP::EnumMethods::kHTTP_DEL);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "DELETE FROM tables_permissions " \
        "WHERE id = ? AND id_table = (SELECT id FROM tables WHERE identifier = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?))"
    );
    A1(action1);

    get_functions()->push_back(function);
}

void Permissions::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id del permiso de la tabla no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de la tabla no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_database", get_database_id(), false);
}