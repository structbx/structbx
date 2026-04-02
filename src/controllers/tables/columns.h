
#ifndef STRUCTBX_CONTROLLERS_TABLES_COLUMNS_H
#define STRUCTBX_CONTROLLERS_TABLES_COLUMNS_H

#include "tools/base_action.h"
#include "tools/function_data.h"
#include "tools/random_generator.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Tables
        {
            class Columns;
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::Tables::Columns : public Tools::FunctionData
{
    public:
        struct ColumnVariables
        {
            std::string column_type = "VARCHAR";
            std::string length = "(100)";
            std::string link_to = "";
            std::string required = "";
            std::string default_value = "";
            std::string cascade_key_condition = "ON DELETE SET NULL ON UPDATE CASCADE";
        };

        struct ColumnSetup
        {
            ColumnSetup(){}
            
            bool Setup(StructBX::Functions::Function& self, ColumnVariables& variables);
        };

        struct ColumnTypeSetup
        {
            ColumnTypeSetup(){}
            
            bool Setup(std::string column_type_id, std::string& column_type, std::string& length_value);
        };

        Columns(Tools::FunctionData& function_data);

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
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
        };
        struct ModifyPosition : public Tools::FunctionData
        {
            ModifyPosition(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
        };
        struct ModifyVisible : public Tools::FunctionData
        {
            ModifyVisible(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
        };

    private:
        Read struct_read_;
        ReadSpecific struct_read_specific_;
        Add struct_add_;
        Modify struct_modify_;
        ModifyPosition struct_modify_position_;
        ModifyVisible struct_modify_visible_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_COLUMNS_H