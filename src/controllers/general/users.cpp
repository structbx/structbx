
#include "controllers/general/users.h"
#include "tools/random_generator.h"
#include "core/error_codes.h"

using namespace StructBX::Controllers::General;

Users::Users(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,struct_read_(function_data)
    ,struct_read_current_(function_data)
    ,struct_read_specific_(function_data)
    ,struct_modify_current_username_(function_data)
    ,struct_modify_current_password_(function_data)
    ,struct_add_(function_data)
    ,struct_modify_(function_data)
    ,struct_delete_(function_data)
{
    
}

Users::Read::Read(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/users/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/users/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("read_all_users");
    action1->set_sql_code(
        "SELECT nu.identifier, nu.username, nu.status, nu.id_group, nu.created_at, ng.group AS 'group' "
        "FROM users nu "
        "LEFT JOIN groups ng ON ng.identifier = nu.id_group " \
        "WHERE nu.type = 'default'"
    );

    get_functions()->push_back(function);
}

Users::ReadCurrent::ReadCurrent(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/users/current/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/users/current/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("read_current_user");
    action1->set_sql_code(
        "SELECT nu.identifier, nu.username, nu.status, nu.id_group, nu.created_at, ng.group AS 'group' "
        "FROM users nu "
        "LEFT JOIN groups ng ON ng.identifier = nu.id_group "
        "WHERE nu.identifier = ?"
    );
    action1->AddParameter_("id_user", get_id_user(), false);

    get_functions()->push_back(function);
}

Users::ReadSpecific::ReadSpecific(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/users/read/identifier
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/users/read/identifier", HTTP::EnumMethods::kHTTP_GET);
    auto action1 = function->AddAction_("read_user_by_identifier");
    action1->set_sql_code(
        "SELECT nu.identifier, nu.username, nu.status, nu.id_group, nu.created_at, ng.group AS 'group' "
        "FROM users nu "
        "JOIN groups ng ON ng.identifier = nu.id_group "
        "WHERE nu.identifier = ?"
    );
    action1->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The user ID cannot be empty.");
            return false;
        }
        return true;
    });

    get_functions()->push_back(function);
}

Users::ModifyCurrentUsername::ModifyCurrentUsername(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/users/current/username/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/users/current/username/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    // Action1: Verify if username don't exists
    auto action1 = function->AddAction_("verify_username_not_taken");
    VerifyUsernameNotTaken(action1);

    // Action2: Modify username
    auto action2 = function->AddAction_("update_current_username");
    UpdateCurrentUsername(action2);

    get_functions()->push_back(function);
}

void Users::ModifyCurrentUsername::VerifyUsernameNotTaken(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT identifier FROM users WHERE username = ? AND identifier != ?");
    action->SetupCondition_("verify-username-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("This username is already registered.");
            self.set_custom_error_code(ERR_USR_DUP_USERNAME);
            return false;
        }

        return true;
    });

    action->AddParameter_("username", "", true)
    ->SetupCondition_("condition-username", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The username cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("identifier", get_id_user(), false);
}

void Users::ModifyCurrentUsername::UpdateCurrentUsername(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE users "
        "SET username = ? "
        "WHERE identifier = ?"
    );

    action->AddParameter_("username", "", true)
    ->SetupCondition_("condition-username", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("The username must be a string.");
            return false;
        }
        if(param->ToString_() == "")
        {
            param->set_error("The username cannot be empty.");
            return false;
        }
        if(param->ToString_().size() < 3)
        {
            param->set_error("The username must be at least 3 characters.");
            return false;
        }
        bool result = Tools::IDChecker().CheckEmail_(param->get_value()->ToString_());
        if(!result)
        {
            param->set_error("The username can only contain a-z, A-Z, 0-9, '_', '.', '@', no spaces.");
            return false;
        }
        return true;
    });
    action->AddParameter_("id_user", get_id_user(), false);
}

Users::ModifyCurrentPassword::ModifyCurrentPassword(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/users/current/password/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/users/current/password/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action1: Verify current password
    auto action1 = function->AddAction_("verify_current_password");
    VerifyCurrentPassword(action1);

    // Action2: Save new password
    auto action2 = function->AddAction_("save_new_password");
    SaveNewPassword(action2);

    // Setup Custom Process
    auto id_database = get_database_id();
    function->SetupCustomProcess_([id_database, action1, action2](StructBX::Functions::Function& self)
    {
        auto new_password = self.GetParameter_("new_password");
        auto new_password2 = self.GetParameter_("new_password2");
        if(new_password == self.get_parameters().end() || new_password2 == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "An error occurred while modifying the password.", ERR_USR_PASSWORD_UPDATE_FAIL);
            return;
        }
        // Verify passwords is same
        if(new_password->get()->ToString_() != new_password2->get()->ToString_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The passwords do not match.", ERR_USR_PASSWORD_MISMATCH);
            return;
        }

        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action1->get_custom_error(), action1->get_custom_error_code());
            return;
        }
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action2->get_custom_error(), action2->get_custom_error_code());
            return;
        }

        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok");
    });

    get_functions()->push_back(function);
}

void Users::ModifyCurrentPassword::VerifyCurrentPassword(StructBX::Functions::Action::Ptr action)
{
    action->set_final(false);
    action->set_sql_code("SELECT identifier FROM users WHERE password = ? AND identifier = ?");
    action->SetupCondition_("verify-username-password", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() < 1)
        {
            self.set_custom_error("The current password is incorrect.");
            self.set_custom_error_code(ERR_USR_CURRENT_PASSWORD_WRONG);
            return false;
        }

        return true;
    });

    action->AddParameter_("current_password", "", true)
    ->SetupCondition_("condition-current_password", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The current password cannot be empty.");
            return false;
        }

        std::string password = param->ToString_();
        std::string password_encoded = StructBX::Tools::HMACTool().Encode_(password);
        param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(password_encoded)));

        return true;
    });
    action->AddParameter_("identifier", get_id_user(), false);
}

void Users::ModifyCurrentPassword::SaveNewPassword(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE users "
        "SET password = ? "
        "WHERE identifier = ?"
    );

    action->AddParameter_("new_password", "", true)
    ->SetupCondition_("condition-password", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The password cannot be empty.");
            return false;
        }
        if(param->ToString_().size() < 8)
        {
            param->set_error("The password must be at least 8 characters.");
            return false;
        }

        std::string password = param->ToString_();
        std::string password_encoded = StructBX::Tools::HMACTool().Encode_(password);
        param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(password_encoded)));
        return true;
    });
    action->AddParameter_("identifier", get_id_user(), false);
}

Users::Add::Add(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/users/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/users/add", HTTP::EnumMethods::kHTTP_POST);
    
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action1: Verify if username don't exists
    auto action1 = function->AddAction_("verify_username_uniqueness");
    VerifyUsernameUniqueness(action1);

    // Action2: Add username
    auto action2 = function->AddAction_("insert_user");
    InsertUser(action2);

    // Setup custom process
    function->SetupCustomProcess_([action1, action2](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action1->get_custom_error(), action1->get_custom_error_code());
            return;
        }
        if(!action2->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action2->get_custom_error(), action2->get_custom_error_code());
            return;
        }

        // New User ID
        auto user_id = action2->get_last_insert_id();
        if(user_id < 1)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "An error occurred while saving the user.", ERR_USR_CREATE_FAIL);
            return;
        }
        
        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok");
    });
    get_functions()->push_back(function);
}

void Users::Add::VerifyUsernameUniqueness(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT identifier FROM users WHERE username = ?");
    action->SetupCondition_("verify-username-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("This username is already registered.");
            self.set_custom_error_code(ERR_USR_DUP_USERNAME);
            return false;
        }

        return true;
    });

    action->AddParameter_("username", "", true)
    ->SetupCondition_("condition-username", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The username cannot be empty.");
            return false;
        }
        return true;
    });
}

void Users::Add::InsertUser(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "INSERT INTO users (identifier, username, password, status, id_group) "
        "VALUES (?, ?, ?, ?, ?) "
    );

    auto identifier = Tools::RandomGenerator().GenerateAlphanumericID_(20);
    action->AddParameter_("identifier", identifier, false);

    action->AddParameter_("username", "", true)
    ->SetupCondition_("condition-username", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("The username must be a string.");
            return false;
        }
        if(param->ToString_() == "")
        {
            param->set_error("The username cannot be empty.");
            return false;
        }
        if(param->ToString_().size() < 3)
        {
            param->set_error("The username must be at least 3 characters.");
            return false;
        }
        bool result = Tools::IDChecker().CheckEmail_(param->get_value()->ToString_());
        if(!result)
        {
            param->set_error("The username can only contain a-z, A-Z, 0-9, '_', '.', '@', no spaces.");
            return false;
        }
        return true;
    });
    action->AddParameter_("password", "", true)
    ->SetupCondition_("condition-password", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The password cannot be empty.");
            return false;
        }
        if(param->ToString_().size() < 8)
        {
            param->set_error("The password must be at least 8 characters.");
            return false;
        }

        std::string password = param->ToString_();
        std::string password_encoded = StructBX::Tools::HMACTool().Encode_(password);
        param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(password_encoded)));
        return true;
    });
    action->AddParameter_("status", "active", false);
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

Users::Modify::Modify(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/users/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/users/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Action1: Verify if username don't exists
    auto action1 = function->AddAction_("verify_user_username_not_taken");
    VerifyUserUsernameNotTaken(action1);

    // Action2: Modify user (with password)
    auto action2 = function->AddAction_("update_user_with_password");
    UpdateUserWithPassword(action2);

    // Action2: Modify user (without password)
    auto action3 = function->AddAction_("update_user_without_password");
    UpdateUserWithoutPassword(action3);

    // Setup custom process
    function->SetupCustomProcess_([action1, action2, action3](StructBX::Functions::Function& self)
    {
        // Execute actions
        if(!action1->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action1->get_custom_error(), action1->get_custom_error_code());
            return;
        }

        // Password parameter
        auto password = self.GetParameter_("password");
        if(password == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Failed to update user.", ERR_USR_UPDATE_FAIL);
            return;
        }

        // Verify if password is not empty
        if(password->get()->ToString_() != "")
        {
            if(!action2->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action2->get_custom_error(), action2->get_custom_error_code());
                return;
            }
        }
        else
        {
            if(!action3->Work_())
            {
                self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, action3->get_custom_error(), action3->get_custom_error_code());
                return;
            }
        }

        // Send results
        self.JSONResponse_(HTTP::Status::kHTTP_OK, "Ok");
    });

    get_functions()->push_back(function);
}

void Users::Modify::VerifyUserUsernameNotTaken(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code("SELECT identifier FROM users WHERE username = ? AND identifier != ?");
    action->SetupCondition_("verify-username-existence", Query::ConditionType::kError, [](StructBX::Functions::Action& self)
    {
        if(self.get_results()->size() > 0)
        {
            self.set_custom_error("This username is already registered.");
            self.set_custom_error_code(ERR_USR_DUP_USERNAME);
            return false;
        }

        return true;
    });

    action->AddParameter_("username", "", true)
    ->SetupCondition_("condition-username", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The username cannot be empty.");
            return false;
        }
        return true;
    });
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-id", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The user ID cannot be empty.");
            return false;
        }
        return true;
    });
}

void Users::Modify::UpdateUserWithPassword(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE users n "
        "SET username = ?, password = ?, status = ?, id_group = ? "
        "WHERE n.identifier = ? "
    );

    action->AddParameter_("username", "", true)
    ->SetupCondition_("condition-username", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("The username must be a string.");
            return false;
        }
        if(param->ToString_() == "")
        {
            param->set_error("The username cannot be empty.");
            return false;
        }
        if(param->ToString_().size() < 3)
        {
            param->set_error("The username must be at least 3 characters.");
            return false;
        }
        bool result = Tools::IDChecker().CheckEmail_(param->get_value()->ToString_());
        if(!result)
        {
            param->set_error("The username can only contain a-z, A-Z, 0-9, '_', '.', '@', no spaces.");
            return false;
        }
        return true;
    });
    action->AddParameter_("password", "", true)
    ->SetupCondition_("condition-password", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The password cannot be empty.");
            return false;
        }
        if(param->ToString_().size() < 8)
        {
            param->set_error("The password must be at least 8 characters.");
            return false;
        }

        std::string password = param->ToString_();
        std::string password_encoded = StructBX::Tools::HMACTool().Encode_(password);
        param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(password_encoded)));
        return true;
    });
    action->AddParameter_("status", "", true)
    ->SetupCondition_("condition-status", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The status cannot be empty.");
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
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The user ID cannot be empty.");
            return false;
        }
        return true;
    });
}

void Users::Modify::UpdateUserWithoutPassword(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "UPDATE users n "
        "SET username = ?, status = ?, id_group = ? "
        "WHERE n.identifier = ? "
    );

    action->AddParameter_("username", "", true)
    ->SetupCondition_("condition-username", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(!param->get_value()->TypeIsIqual_(StructBX::Tools::DValue::Type::kString))
        {
            param->set_error("The username must be a string.");
            return false;
        }
        if(param->ToString_() == "")
        {
            param->set_error("The username cannot be empty.");
            return false;
        }
        if(param->ToString_().size() < 3)
        {
            param->set_error("The username must be at least 3 characters.");
            return false;
        }
        bool result = Tools::IDChecker().CheckEmail_(param->get_value()->ToString_());
        if(!result)
        {
            param->set_error("The username can only contain a-z, A-Z, 0-9, '_', '.', '@', no spaces.");
            return false;
        }
        return true;
    });
    action->AddParameter_("status", "", true)
    ->SetupCondition_("condition-status", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The status cannot be empty.");
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
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The user ID cannot be empty.");
            return false;
        }
        return true;
    });
}

Users::Delete::Delete(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/users/delete
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/users/delete", HTTP::EnumMethods::kHTTP_DEL);
    
    auto action1 = function->AddAction_("delete_user");
    DeleteUser(action1);

    get_functions()->push_back(function);
}

void Users::Delete::DeleteUser(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "DELETE FROM users "
        "WHERE "
            "identifier = ? "
    );
    action->AddParameter_("identifier", "", true)
    ->SetupCondition_("condition-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("The user ID cannot be empty.");
            return false;
        }
        return true;
    });
}
