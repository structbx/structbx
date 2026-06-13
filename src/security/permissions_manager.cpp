
#include "security/permissions_manager.h"

using namespace StructBX::Security;

std::mutex PermissionsManager::mutex_;
std::list<Permission> PermissionsManager::permissions_ = {};
std::map<std::string, ActionType> PermissionsManager::action_type_map_ = {};

PermissionsManager::PermissionsManager()
{
    
}

std::_List_iterator<Permission> PermissionsManager::FindPermission_(Tools::Route& route, std::string id_user, std::string action_type)
{
    auto permission_final = permissions_.end();

    ActionType action_mapped = ActionType::kRead;
    auto action_found = action_type_map_.find(action_type);
    if(action_found != action_type_map_.end())
        action_mapped = action_found->second;

    auto permission_found = std::find_if(permissions_.begin(), permissions_.end(), [&](Permission& permission)
    {
        return permission.get_route() == route
        && permission.get_user()->get_id() == id_user
        && permission.get_action_type() == action_mapped;
    });

    if (permission_found != permissions_.end())
    {
        permission_final = permission_found;
    }

    return permission_final;
}

void PermissionsManager::FillActionTypeMap_()
{
    action_type_map_.clear();
    action_type_map_.insert({"POST", ActionType::kCreate});
    action_type_map_.insert({"GET", ActionType::kRead});
    action_type_map_.insert({"PUT", ActionType::kUpdate});
    action_type_map_.insert({"DEL", ActionType::kDelete});
}

void PermissionsManager::LoadPermissions_()
{
    try
    {
        mutex_.lock();
        FillActionTypeMap_();
        permissions_.clear();

        // Setting up the action
            Functions::Action action{"PermissionsManager::LoadPermissions_"};
            action.set_custom_error("Permissions not found.");
            std::string sql_code =
                "SELECT ap.endpoint AS endpoint, au.username AS username, au.identifier AS id_user, ap.action AS action, au.id_group AS id_group "
                "FROM permissions ap "
                "JOIN users au ON au.id_group = ap.id_group"
            ;
            action.set_sql_code(sql_code);

        // Query process
            if(!action.Work_())
            {
                mutex_.unlock();
                Tools::OutputLogger::Error_("Error on permissions_manager.cpp on LoadPermissions_(): " + action.get_custom_error());
                return;
            }

        // Iterate over the results
            for(auto& row : *action.get_results())
            {
                // Get elements
                auto endpoint = row->ExtractField_("endpoint");
                auto username = row->ExtractField_("username");
                auto id_user = row->ExtractField_("id_user");
                auto id_group = row->ExtractField_("id_group");
                auto action = row->ExtractField_("action");

                if(endpoint->IsNull_() || username->IsNull_() || id_user->IsNull_() || action->IsNull_() || id_group->IsNull_())
                {
                    throw std::runtime_error("Error to get results, Null object.");
                    return;
                }

                // Create permission
                ActionType action_mapped = ActionType::kRead;
                auto found = action_type_map_.find(action->String_());
                if(found != action_type_map_.end())
                    action_mapped = found->second;

                Permission p
                {
                    Tools::Route{endpoint->String_()}
                    ,std::make_shared<User>(id_user->String_(), username->String_(), id_group->String_()), action_mapped
                };

                permissions_.push_back(std::move(p));
            }
        mutex_.unlock();
    }
    catch(const std::exception& error)
    {
        mutex_.unlock();
        std::cerr << "- Error on PermissionsManager::LoadPermissions_(): " << std::string(error.what()) << std::endl;
        return;
    }
}
