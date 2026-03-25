
#ifndef STRUCTBX_CONTROLLERS_TABLES_MAIN_H
#define STRUCTBX_CONTROLLERS_TABLES_MAIN_H

#include "tools/base_action.h"
#include "tools/function_data.h"

#include "controllers/tables/data.h"
#include "controllers/tables/columns.h"
#include "controllers/tables/permissions.h"
#include "controllers/tables/views.h"
#include "tools/random_generator.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Tables
        {
            class Main;
        }
    }
}

using namespace StructBX;


class StructBX::Controllers::Tables::Main : public Tools::FunctionData
{
    public:
        Main(Tools::FunctionData& function_data);

    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct ReadSpecific : public Tools::FunctionData
        {
            ReadSpecific(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
            void A3(StructBX::Functions::Action::Ptr action);
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
            void A3(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
        };

    private:
        Data function_data_;
        Columns function_columns_;
        Permissions function_permissions_;
        Views function_views_;
        Read struct_read_;
        ReadSpecific struct_read_specific_;
        Add struct_add_;
        Modify struct_modify_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_MAIN_H