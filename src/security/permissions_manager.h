
#ifndef STRUCTBX_SECURITY_PERMISSIONSMANAGER
#define STRUCTBX_SECURITY_PERMISSIONSMANAGER


#include <string>
#include <list>
#include <algorithm>
#include <mutex>

#include "query/database_manager.h"
#include "functions/action.h"
#include "security/permission.h"
#include "tools/route.h"
#include "tools/output_logger.h"

namespace StructBX
{
    namespace Security
    {
        class PermissionsManager;
    }
}

using namespace Poco;


class StructBX::Security::PermissionsManager
{
    public:
        using PermissionToLoad = Poco::Tuple<std::string, std::string, std::string, int, std::string, bool, bool>;

        PermissionsManager();

        static std::list<Permission>& get_permissions()
        {
            auto& var = permissions_;
            return var;
        }
        static std::map<std::string, ActionType>& get_action_type_map()
        {
            auto& var = action_type_map_;
            return var;
        }

        static void LoadPermissions_();
        static std::_List_iterator<Permission> FindPermission_(Tools::Route& route, std::string id_user, std::string action_type);
        static bool VerifyPermission_(Tools::Route& requested_route, User& user, std::_List_iterator<Permission> found_permission);

    protected:
        static void FillActionTypeMap_();

    private:
        static std::mutex mutex_;
        static std::list<Permission> permissions_;
        static std::map<std::string, ActionType> action_type_map_;
};


#endif // STRUCTBX_SECURITY_PERMISSIONSMANAGER
