
#include "security/users_manager.h"
#include "security/user.h"

using namespace StructBX::Security;

UsersManager::UsersManager()
{
    // Setting up the action
    action_ = std::make_shared<Functions::Action>("UsersManager::AuthenticateUser_");
    action_->set_sql_code("SELECT id, username, id_group, status, type FROM users WHERE username = ? AND password = ?");
    action_->AddParameter_("username", "", true);
    action_->AddParameter_("password", "", true);
}

bool UsersManager::AuthenticateUser_()
{
    try
    {
        // Query process
            action_->Work_();

        // Verify results
            if(action_->get_results()->size() > 0)
            {
                // Set current user
                auto row = action_->get_results()->front();
                auto id = row->ExtractField_("id");
                auto username = row->ExtractField_("username");
                auto id_group = row->ExtractField_("id_group");
                auto status = row->ExtractField_("status");
                auto type = row->ExtractField_("type");

                if(id->IsNull_() || username->IsNull_())
                {
                    throw std::runtime_error("Error to get results, Null object.");
                    return false;
                }

                current_user_.set_id(id->Int_());
                current_user_.set_username(username->String_());
                if(!id_group->IsNull_())
                    current_user_.set_id_group(id_group->Int_());
                if(!status->IsNull_())
                    current_user_.set_status(status->String_());
                if(!type->IsNull_())
                    current_user_.set_type(type->String_());

                return true;
            }
            else
                return false;
    }
    catch(const std::exception& error)
    {
        Tools::OutputLogger::Error_("Error on users_manager.cpp on AuthenticateUser_(): " + std::string(error.what()));
        return false;
    }
}


void UsersManager::ReloadCurrentUser_(int user_id)
{
    // Query process
        Functions::Action action("update_user");
        action.set_sql_code("SELECT id, username, id_group, status, type FROM users WHERE id = ?");
        action.AddParameter_("id", user_id, false);
        action.Work_();

    // Verify results
        if(action.get_results()->size() > 0)
        {
            // Set current user
            auto row = action.get_results()->front();
            auto id = row->ExtractField_("id");
            auto username = row->ExtractField_("username");
            auto id_group = row->ExtractField_("id_group");
            auto status = row->ExtractField_("status");
            auto type = row->ExtractField_("type");

            if(id->IsNull_() || username->IsNull_())
                return;

            current_user_.set_id(id->Int_());
            current_user_.set_username(username->String_());
            if(!id_group->IsNull_())
                current_user_.set_id_group(id_group->Int_());
            if(!status->IsNull_())
                current_user_.set_status(status->String_());
            if(!type->IsNull_())
                current_user_.set_type(type->String_());
        }
}