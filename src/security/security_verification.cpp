
#include "security/security_verification.h"

using namespace StructBX::Security;

SecurityVerification::SecurityVerification() :
    security_type_(SecurityType::kDisableAll)
{

}

bool SecurityVerification::VerifyRoutesPermissions_(Tools::Route& route, std::string action_type)
{
    try
    {
        if(users_manager_.get_current_user().get_type() == "system" || users_manager_.get_current_user().get_type() == "admin")
            return true;

        auto p = permissions_manager_.FindPermission_(route, users_manager_.get_current_user().get_id(), action_type);

        // Permission not found
        switch(security_type_)
        {
            case SecurityType::kDisableAll:
            {
                if(p == permissions_manager_.get_permissions().end())
                    return false;

                break;
            }
            case SecurityType::kEnableAll:
            {
                if(p == permissions_manager_.get_permissions().end())
                    return true;
                
                break;
            }
        }
    }
    catch(const std::exception& error)
    {
        Tools::OutputLogger::Error_("Error on security_verification.cpp on VerifyRoutesPermissions_(): " + std::string(error.what()));
        return false;
    }
    return true;
}
