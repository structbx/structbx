
#include "controllers/databases/users.h"

using namespace StructBX::Controllers::Databases;

Users::Users(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_current_(function_data)
    ,struct_read_user_out_database_(function_data)
    ,struct_add_(function_data)
    ,struct_delete_(function_data)
{
    
}

Users::Read::Read(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/users/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/users/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "SELECT nu.identifier, nu.username, sp.created_at " \
        "FROM users nu " \
        "JOIN databases_users sp ON sp.id_user = nu.identifier " \
        "WHERE sp.id_database = ? AND nu.type = 'default'"
    );
    action1->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-id_database", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de base de datos no puede estar vacío");
            return false;
        }
        return true;
    });

    get_functions()->push_back(function);
}

Users::ReadCurrent::ReadCurrent(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/users/current/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/users/current/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "SELECT nu.identifier, nu.username, sp.created_at " \
        "FROM users nu " \
        "JOIN databases_users sp ON sp.id_user = nu.identifier " \
        "WHERE sp.id_database = ? AND nu.type = 'default'"
    );
    action1->AddParameter_("id_database", get_database_id(), false);

    get_functions()->push_back(function);
}

Users::ReadUserOutDatabase::ReadUserOutDatabase(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/users/out/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/users/out/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "SELECT nu.identifier, nu.username "
        "FROM users nu "
        "LEFT JOIN databases_users su ON u.id_user = nu.identifier AND su.id_database = ? "
        "WHERE su.id_user IS NULL AND nu.type = 'default'"
    );
    action1->AddParameter_("identifier_database", "", true)
    ->SetupCondition_("condition-identifier_database", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de base de datos no puede estar vacío");
            return false;
        }
        return true;
    });
    action1->AddParameter_("id_user", get_id_user(), false);

    get_functions()->push_back(function);
}

Users::Add::Add(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/users/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/users/add", HTTP::EnumMethods::kHTTP_POST);
    
    auto action1 = function->AddAction_("a1");
    auto action2 = function->AddAction_("a2");
    A1(action1);
    A2(action2);

    get_functions()->push_back(function);
}

void Users::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO databases_users (id_database, id_user) "
        "VALUES (?, ?)"
    );
    action->AddParameter_("identifier_database", "", true)
    ->SetupCondition_("condition-identifier_database", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de base de datos no puede estar vacío");
            return false;
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
}

void Users::Add::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO tables_permissions (identifier, `read`, `add`, `modify`, `delete`, `just_owner`, id_table, id_user) "
        "SELECT "
            "?, 0, 0, 0, 0, 0, t.identifier, ? "
        "FROM tables t " \
        "WHERE t.id_database = ? "
    );
    action->AddParameter_("identifier", "", false)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        Tools::RandomGenerator rg;
        auto identifier = rg.GenerateAlphanumericID_(20);
        param->set_value(Tools::DValue::Ptr(new Tools::DValue(identifier)));
        
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
    action->AddParameter_("identifier_database", "", true)
    ->SetupCondition_("condition-identifier_database", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("El identificador de base de datos no puede estar vacío");
            return false;
        }
        return true;
    });
}

Users::Delete::Delete(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/databases/users/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/databases/users/delete", HTTP::EnumMethods::kHTTP_DEL);
    
    auto action1 = function->AddAction_("a1");
    A1(action1);
    auto action2 = function->AddAction_("a2");
    A2(action2);

    get_functions()->push_back(function);
}

void Users::Delete::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "DELETE su FROM databases_users su "
        "WHERE "
            "su.id_user = ? "
            "AND su.id_database = ?"
    );
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id_user", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de usuario a eliminar no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_identifier", "", true)
    ->SetupCondition_("condition-database_identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de base de datos no puede estar vacío");
            return false;
        }
        return true;
    });
}

void Users::Delete::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "DELETE tp FROM tables_permissions tp "
        "JOIN tables t ON tp.id_table = t.identifier "
        "WHERE tp.id_user = ? AND t.id_database = ?"
    );
    action->AddParameter_("id", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El id de usuario a eliminar no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("database_identifier", "", true)
    ->SetupCondition_("condition-database_identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de base de datos no puede estar vacío");
            return false;
        }
        return true;
    });
}
