
#ifndef STRUCTBX_CONTROLLERS_GENERAL_PERMISSIONS_H
#define STRUCTBX_CONTROLLERS_GENERAL_PERMISSIONS_H


#include "tools/base_action.h"
#include "tools/function_data.h"
#include "security/permissions_manager.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace General
        {
            class Permissions;
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::General::Permissions : public Tools::FunctionData
{
    public:
        Permissions(Tools::FunctionData& function_data);
        
    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct ReadCurrent : public Tools::FunctionData
        {
            ReadCurrent(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct ReadOutGroup : public Tools::FunctionData
        {
            ReadOutGroup(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
        };

    private:
        Read struct_read_;
        ReadCurrent struct_read_current_;
        ReadOutGroup struct_read_out_group_;
        Add struct_add_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_GENERAL_PERMISSIONS_H