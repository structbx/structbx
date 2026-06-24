
#ifndef STRUCTBX_CONTROLLERS_TABLES_TABLES_H
#define STRUCTBX_CONTROLLERS_TABLES_TABLES_H

#include "tools/base_action.h"
#include "tools/function_data.h"

#include "controllers/tables/data.h"
#include "controllers/tables/columns.h"
#include "controllers/tables/permissions.h"
#include "controllers/tables/views.h"
#include "controllers/tables/filters.h"
#include "controllers/tables/sorts.h"
#include "tools/random_generator.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Tables
        {
            class Tables;
        }
    }
}

using namespace StructBX;


class StructBX::Controllers::Tables::Tables : public Tools::FunctionData
{
    public:
        Tables(Tools::FunctionData& function_data);

    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);

            void ReadTablesByDatabase(StructBX::Functions::Action::Ptr action);
        };
        struct ReadSpecific : public Tools::FunctionData
        {
            ReadSpecific(Tools::FunctionData& function_data);

            void ReadTableByIdentifier(StructBX::Functions::Action::Ptr action);
        };
        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);

            void VerifyTableNameNotTaken(StructBX::Functions::Action::Ptr action);
            void InsertTableMetadata(StructBX::Functions::Action::Ptr action);
            void GrantCreatorFullPermissions(StructBX::Functions::Action::Ptr action);
            void AddView(StructBX::Functions::Action::Ptr action);
            void AddDefaultColumn(StructBX::Functions::Action::Ptr action);
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void VerifyTableExists(StructBX::Functions::Action::Ptr action);
            void VerifyTableNewName(StructBX::Functions::Action::Ptr action);
            void UpdateTableMetadata(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void VerifyTableExistsForDelete(StructBX::Functions::Action::Ptr action);
            void DeleteTableMetadata(StructBX::Functions::Action::Ptr action);
        };

    private:
        Data function_data_;
        Columns function_columns_;
        Permissions function_permissions_;
        Views function_views_;
        Filters function_filters_;
        Sorts function_sorts_;
        Read struct_read_;
        ReadSpecific struct_read_specific_;
        Add struct_add_;
        Modify struct_modify_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_TABLES_H