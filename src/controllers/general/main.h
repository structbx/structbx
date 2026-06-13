
#ifndef STRUCTBX_CONTROLLERS_GENERAL_MAIN_H
#define STRUCTBX_CONTROLLERS_GENERAL_MAIN_H


#include "tools/base_action.h"
#include "tools/function_data.h"

#include "controllers/general/users.h"
#include "controllers/general/groups.h"
#include "controllers/general/permissions.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace General
        {
            class Main;
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::General::Main : public Tools::FunctionData
{
    public:
        Main(Tools::FunctionData& function_data);
        
    protected:
        struct ReadInstanceName : public Tools::FunctionData
        {
            ReadInstanceName(Tools::FunctionData& function_data);
        };
        struct ModifyInstanceName : public Tools::FunctionData
        {
            ModifyInstanceName(Tools::FunctionData& function_data);
        };
        struct ReadInstanceLogo : public Tools::FunctionData
        {
            ReadInstanceLogo(Tools::FunctionData& function_data);
        };
        struct ModifyInstanceLogo : public Tools::FunctionData
        {
            ModifyInstanceLogo(Tools::FunctionData& function_data);
        };
        struct ApiKeyRead : public Tools::FunctionData
        {
            ApiKeyRead(Tools::FunctionData& function_data);
        };
        struct ApiKeyGenerate : public Tools::FunctionData
        {
            ApiKeyGenerate(Tools::FunctionData& function_data);
        };
        struct ApiKeyRevoke : public Tools::FunctionData
        {
            ApiKeyRevoke(Tools::FunctionData& function_data);
        };

    private:
        Users function_users_;
        Groups function_groups_;
        Permissions function_permissions_;
        ReadInstanceName struct_read_instance_name_;
        ModifyInstanceName struct_modify_instance_name_;
        ReadInstanceLogo struct_read_instance_logo_;
        ModifyInstanceLogo struct_modify_instance_logo_;
        ApiKeyRead struct_apikey_read_;
        ApiKeyGenerate struct_apikey_generate_;
        ApiKeyRevoke struct_apikey_revoke_;

};

#endif //STRUCTBX_CONTROLLERS_GENERAL_MAIN_H