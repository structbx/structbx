
#include "controllers/general/groups.h"
#include "core/error_codes.h"

using namespace StructBX::Controllers::General;

Groups::Groups(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

Groups::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/general/groups/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/groups/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Groups::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT identifier, `group`, created_at "
        "FROM groups "
    );
}

Groups::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/general/groups/read/identifier
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/groups/read/identifier", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("a1");
    A1(action1);

    get_functions()->push_back(function);
}

void Groups::ReadSpecific::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT identifier, `group`, created_at "
        "FROM groups "
        "WHERE identifier = ?"
    );

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The group ID cannot be empty.");
            return false;
        }
        return true;
    });
}

Groups::Add::Add(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function POST /api/general/groups/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/groups/add", HTTP::EnumMethods::kHTTP_POST);
    
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Verify if group new name don't exists yet
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Add group
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Add all permissions to the group
    auto action3 = function->AddAction_("a3");

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([action1, action2, action3](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action1->get_custom_error(), action1->get_custom_error_code());
            return;
        }

        // Set identifier
        Tools::RandomGenerator rg;
        auto identifier = rg.GenerateAlphanumericID_(20);
        action2->SetValueToParamater_(Tools::DValue::Ptr(new Tools::DValue(identifier)), "identifier");
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action2->get_custom_error(), action2->get_custom_error_code());
            return;
        }

        // Add All endpoints by default
        action3->set_sql_code("INSERT INTO permissions (endpoint, action, id_group) SELECT endpoint, action, ? FROM endpoints");
        action3->AddParameter_("id_group", identifier, false);
        if(!action3->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action3->get_custom_error(), action3->get_custom_error_code());
            return;
        }

        self.JSONResponse_(HTTP::Status::kHTTP_OK, "OK.");
    });

    get_functions()->push_back(function);
}

void Groups::Add::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT identifier "
        "FROM groups "
        "WHERE `group` = ?"
    );
    action->SetupCondition_("condition-group-exists", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("This group is already registered.");
            self.set_custom_error_code(ERR_GRP_DUP_NAME);
            return false;
        }

        return true;
    });

    action->AddParameter_("group", "", true)
    ->SetupCondition_("condition-group", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The group name cannot be empty.");
            return false;
        }
        return true;
    });
}
void Groups::Add::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("INSERT INTO groups (`identifier`, `group`) VALUES (?, ?)");
    action->AddParameter_("identifier", "", false);
    action->AddParameter_("group", "", true);
}

Groups::Modify::Modify(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function PUT /api/general/groups/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/groups/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    // Verify if group don't exists
    auto action1 = function->AddAction_("a1");
    A1(action1);

    // Verify if group new name don't exists yet
    auto action2 = function->AddAction_("a2");
    A2(action2);

    // Modify group
    auto action3 = function->AddAction_("a3");
    A3(action3);

    get_functions()->push_back(function);
}

void Groups::Modify::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT identifier "
        "FROM groups "
        "WHERE identifier = ?"
    );
    action->SetupCondition_("condition-group-exists", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("The group you are trying to modify does not exist.");
            self.set_custom_error_code(ERR_ACTION_FAILED);
            return false;
        }

        return true;
    });

    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The group ID cannot be empty.");
            return false;
        }
        return true;
    });
}

void Groups::Modify::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT identifier "
        "FROM groups "
        "WHERE `group` = ?"
    );
    action->SetupCondition_("condition-group-exists", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("This group name is already registered.");
            self.set_custom_error_code(ERR_GRP_DUP_NAME);
            return false;
        }

        return true;
    });

    action->AddParameter_("group", "", true)
    ->SetupCondition_("condition-group", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The group name cannot be empty.");
            return false;
        }
        return true;
    });
}

void Groups::Modify::A3(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("UPDATE groups SET `group` = ? WHERE identifier = ?");
    action->AddParameter_("group", "", true);
    action->AddParameter_("identifier", "", true);

}

Groups::Delete::Delete(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function PUT /api/general/groups/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/groups/delete", HTTP::EnumMethods::kHTTP_DEL);
    
    // Delete group
    auto action2 = function->AddAction_("a2");
    A2(action2);

    get_functions()->push_back(function);
}

void Groups::Delete::A2(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("DELETE FROM groups WHERE identifier = ?");
    action->AddParameter_("identifier", "", true);

}
