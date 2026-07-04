
#ifndef STRUCTBX_CONTROLLERS_GENERAL_USERS_H
#define STRUCTBX_CONTROLLERS_GENERAL_USERS_H


#include "tools/base_action.h"
#include "tools/function_data.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace General
        {
            class Users;
        }
    }
}

using namespace StructBX;


class StructBX::Controllers::General::Users : public Tools::FunctionData
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
        struct ReadSpecific : public Tools::FunctionData
        {
            ReadSpecific(Tools::FunctionData& function_data);
        };
        struct ModifyCurrentUsername : public Tools::FunctionData
        {
            ModifyCurrentUsername(Tools::FunctionData& function_data);

            void VerifyUsernameNotTaken(StructBX::Functions::Action::Ptr action);
            void UpdateCurrentUsername(StructBX::Functions::Action::Ptr action);
        };
        struct ModifyCurrentPassword : public Tools::FunctionData
        {
            ModifyCurrentPassword(Tools::FunctionData& function_data);

            void VerifyCurrentPassword(StructBX::Functions::Action::Ptr action);
            void SaveNewPassword(StructBX::Functions::Action::Ptr action);
        };
        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);

            void VerifyUsernameUniqueness(StructBX::Functions::Action::Ptr action);
            void InsertUser(StructBX::Functions::Action::Ptr action);
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void VerifyUserUsernameNotTaken(StructBX::Functions::Action::Ptr action);
            void UpdateUserWithPassword(StructBX::Functions::Action::Ptr action);
            void UpdateUserWithoutPassword(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void CountUsers(StructBX::Functions::Action::Ptr action);
            void DeleteUser(StructBX::Functions::Action::Ptr action);
        };

    private:
        Read struct_read_;
        ReadCurrent struct_read_current_;
        ReadSpecific struct_read_specific_;
        ModifyCurrentUsername struct_modify_current_username_;
        ModifyCurrentPassword struct_modify_current_password_;
        Add struct_add_;
        Modify struct_modify_;
        Delete struct_delete_;

};

#endif //STRUCTBX_CONTROLLERS_GENERAL_USERS_H