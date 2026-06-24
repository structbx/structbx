
#ifndef STRUCTBX_CONTROLLERS_TABLES_SORTS_H
#define STRUCTBX_CONTROLLERS_TABLES_SORTS_H

#include <unordered_set>

#include "tools/base_action.h"
#include "tools/function_data.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Tables
        {
            class Sorts;

            static const std::unordered_set<std::string> valid_sorts = {
                "ASC", "DESC"
            };
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::Tables::Sorts : public Tools::FunctionData
{
    public:
        Sorts(Tools::FunctionData& function_data);

    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);

            void ReadSortsByView(StructBX::Functions::Action::Ptr action);
        };

        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);

            void InsertSort(StructBX::Functions::Action::Ptr action);
            void GetNextSortPosition(StructBX::Functions::Action::Ptr action);
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void UpdateSort(StructBX::Functions::Action::Ptr action);
        };
        struct ModifyPosition : public Tools::FunctionData
        {
            ModifyPosition(Tools::FunctionData& function_data);

            void CalculateNewSortPosition(StructBX::Functions::Action::Ptr action);
            void UpdateSortPosition(StructBX::Functions::Action::Ptr action);
        };
        struct ModifyVisible : public Tools::FunctionData
        {
            ModifyVisible(Tools::FunctionData& function_data);

            void ToggleSortActive(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void DeleteSort(StructBX::Functions::Action::Ptr action);
        };
        

    private:
        Read struct_read_;
        Add struct_add_;
        Modify struct_modify_;
        ModifyPosition struct_modify_position_;
        ModifyVisible struct_modify_visible_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_SORTS_H