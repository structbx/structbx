
#ifndef STRUCTBX_CONTROLLERS_TABLES_ROW_POLICY_H
#define STRUCTBX_CONTROLLERS_TABLES_ROW_POLICY_H

#include "tools/base_action.h"
#include "tools/function_data.h"
#include "controllers/tables/filters.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Tables
        {
            class RowPolicy;
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::Tables::RowPolicy : public Tools::FunctionData
{
    public:
        RowPolicy(Tools::FunctionData& function_data);

    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);

            void ReadPoliciesByTable(StructBX::Functions::Action::Ptr action);
        };
        struct ReadSpecific : public Tools::FunctionData
        {
            ReadSpecific(Tools::FunctionData& function_data);

            void ReadPolicyByIdentifier(StructBX::Functions::Action::Ptr action);
        };
        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);

            void InsertPolicy(StructBX::Functions::Action::Ptr action);
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void UpdatePolicy(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void DeletePolicy(StructBX::Functions::Action::Ptr action);
        };

    private:
        Read struct_read_;
        ReadSpecific struct_read_specific_;
        Add struct_add_;
        Modify struct_modify_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_ROW_POLICY_H
