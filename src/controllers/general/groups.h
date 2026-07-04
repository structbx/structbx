
#ifndef STRUCTBX_CONTROLLERS_GENERAL_GROUPS_H
#define STRUCTBX_CONTROLLERS_GENERAL_GROUPS_H


#include "tools/base_action.h"
#include "tools/function_data.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace General
        {
            class Groups;
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::General::Groups : public Tools::FunctionData
{
    public:
        Groups(Tools::FunctionData& function_data);
        
    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);

            void ReadAllGroups(StructBX::Functions::Action::Ptr action);
        };
        struct ReadSpecific : public Tools::FunctionData
        {
            ReadSpecific(Tools::FunctionData& function_data);

            void ReadGroupByIdentifier(StructBX::Functions::Action::Ptr action);
        };
        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);

            void VerifyGroupNameNotTaken(StructBX::Functions::Action::Ptr action);
            void InsertGroup(StructBX::Functions::Action::Ptr action);
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void VerifyGroupExists(StructBX::Functions::Action::Ptr action);
            void VerifyGroupNewName(StructBX::Functions::Action::Ptr action);
            void UpdateGroupName(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void CountGroups(StructBX::Functions::Action::Ptr action);
            void DeleteGroup(StructBX::Functions::Action::Ptr action);
        };

    private:
        Read struct_read_;
        ReadSpecific struct_read_specific_;
        Add struct_add_;
        Modify struct_modify_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_GENERAL_GROUPS_H