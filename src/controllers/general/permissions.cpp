
#include "controllers/general/permissions.h"
#include "core/error_codes.h"

using namespace StructBX::Controllers::General;

Permissions::Permissions(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_current_(function_data)
    ,struct_read_out_group_(function_data)
    ,struct_add_(function_data)
    ,struct_delete_(function_data)
{
    
}

Permissions::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/general/permissions/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/permissions/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("read_group_permissions");
    ReadGroupPermissions(action1);

    get_functions()->push_back(function);
}

void Permissions::Read::ReadGroupPermissions(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT ng.*, e.title AS title "
        "FROM permissions ng "
        "JOIN endpoints e ON e.endpoint = ng.endpoint "
        "WHERE id_group = ? "
        "ORDER BY e.title ASC"
    );
    action->AddParameter_("id_group", "", true)
    ->SetupCondition_("condition-id_group", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The group ID cannot be empty.");
            return false;
        }
        return true;
    });
}

Permissions::ReadCurrent::ReadCurrent(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/general/permissions/current/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/permissions/current/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("read_current_user_permissions");
    ReadCurrentUserPermissions(action1);

    get_functions()->push_back(function);
}

void Permissions::ReadCurrent::ReadCurrentUserPermissions(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT NULL AS id, e.endpoint, e.action, NULL AS created_at, NULL AS id_group "
        "FROM endpoints e "
        "CROSS JOIN users u "
        "WHERE u.identifier = ? AND u.type = 'admin' "

        "UNION ALL "

        "SELECT ng.id, ng.endpoint, ng.action, ng.created_at, ng.id_group "
        "FROM permissions ng "
        "JOIN users u ON u.id_group = ng.id_group "
        "WHERE u.identifier = ? "
        "  AND u.type != 'admin'"
    );
    action->AddParameter_("id_user", get_id_user(), false);
    action->AddParameter_("id_user", get_id_user(), false);
}

Permissions::ReadOutGroup::ReadOutGroup(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/general/permissions/out/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/permissions/out/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("read_unassigned_endpoints");
    ReadUnassignedEndpoints(action1);

    get_functions()->push_back(function);
}

void Permissions::ReadOutGroup::ReadUnassignedEndpoints(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT e.* "
        "FROM endpoints e "
        "LEFT JOIN permissions ng ON ng.endpoint = e.endpoint AND id_group = ? "
        "WHERE ng.endpoint IS NULL "
        "ORDER BY e.title ASC"
    );
    action->AddParameter_("id_group", "", true)
    ->SetupCondition_("condition-id_group", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The group ID cannot be empty.");
            return false;
        }
        return true;
    });
}

Permissions::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/general/permissions/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/permissions/add", HTTP::EnumMethods::kHTTP_POST);
    
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Verify if permission in group don't exists yet
    auto action1 = function->AddAction_("verify_permission_not_duplicate");
    VerifyPermissionNotDuplicate(action1);

    // Add permission
    auto action2 = function->AddAction_("insert_permission");
    InsertPermission(action2);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([action1, action2](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action1->get_custom_error(), action1->get_custom_error_code());
            return;
        }
        // Execute actions
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action2->get_custom_error(), action2->get_custom_error_code());
            return;
        }

        StructBX::Security::PermissionsManager::LoadPermissions_();

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Permissions::Add::VerifyPermissionNotDuplicate(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT id "
        "FROM permissions "
        "WHERE endpoint = ? AND id_group = ?"
    );
    action->SetupCondition_("condition-permission-exists", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("This permission is already registered in this group.");
            self.set_custom_error_code(ERR_PER_DUP_IN_GROUP);
            return false;
        }

        return true;
    });

    action->AddParameter_("endpoint", "", true)
    ->SetupCondition_("condition-endpoint", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The endpoint cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_group", "", true)
    ->SetupCondition_("condition-id_group", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The group ID cannot be empty.");
            return false;
        }
        return true;
    });
}
void Permissions::Add::InsertPermission(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO permissions (endpoint, action, id_group) "
        "SELECT ?, action, ? "
        "FROM endpoints "
        "WHERE endpoint = ?"
    );
    action->AddParameter_("endpoint", "", true);
    action->AddParameter_("id_group", "", true);
    action->AddParameter_("endpoint", "", true);
}

Permissions::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function PUT /api/general/permissions/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/permissions/delete", HTTP::EnumMethods::kHTTP_DEL);
    
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Verify if permission don't exists
    auto action1 = function->AddAction_("verify_permission_exists");
    VerifyPermissionExists(action1);

    // Delete permission
    auto action2 = function->AddAction_("remove_permission");
    RemovePermission(action2);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([action1, action2](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action1->get_custom_error(), action1->get_custom_error_code());
            return;
        }
        // Execute actions
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action2->get_custom_error(), action2->get_custom_error_code());
            return;
        }

        StructBX::Security::PermissionsManager::LoadPermissions_();

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Permissions::Delete::VerifyPermissionExists(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT id "
        "FROM permissions "
        "WHERE endpoint = ? and id_group = ?"
    );
    action->SetupCondition_("condition-permission-exists", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("The permission you are trying to delete does not exist.");
            self.set_custom_error_code(ERR_PER_NOT_OWNED);
            return false;
        }

        return true;
    });

    action->AddParameter_("endpoint", "", true)
    ->SetupCondition_("condition-endpoint", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The permission endpoint cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_group", "", true)
    ->SetupCondition_("condition-endpoint", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The permission group identifier cannot be empty.");
            return false;
        }
        return true;
    });
}

void Permissions::Delete::RemovePermission(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("DELETE FROM permissions WHERE endpoint = ? AND id_group = ?");
    action->AddParameter_("endpoint", "", true);
    action->AddParameter_("id_group", "", true);
}