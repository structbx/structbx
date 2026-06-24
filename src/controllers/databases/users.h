
#ifndef STRUCTBX_CONTROLLERS_DATABASES_USERS_H
#define STRUCTBX_CONTROLLERS_DATABASES_USERS_H


#include "tools/base_action.h"
#include "tools/function_data.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Databases
        {
            class Users;
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::Databases::Users : public Tools::FunctionData
{
    public:
        Users(Tools::FunctionData& function_data);
        
    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);
        };
        struct ReadCurrent : public Tools::FunctionData
        {
            ReadCurrent(Tools::FunctionData& function_data);
        };
        struct ReadUserOutDatabase : public Tools::FunctionData
        {
            ReadUserOutDatabase(Tools::FunctionData& function_data);
        };
        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);
            void AddUserToDatabase(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);
            void RemoveUserFromDatabase(StructBX::Functions::Action::Ptr action);
            void CleanupUserTablePermissions(StructBX::Functions::Action::Ptr action);
        };

    private:
        Read struct_read_;
        ReadCurrent struct_read_current_;
        ReadUserOutDatabase struct_read_user_out_database_;
        Add struct_add_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_DATABASES_USERS_H