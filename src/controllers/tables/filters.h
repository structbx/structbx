
#ifndef STRUCTBX_CONTROLLERS_TABLES_FILTERS_H
#define STRUCTBX_CONTROLLERS_TABLES_FILTERS_H

#include <unordered_map>
#include <unordered_set>

#include "tools/base_action.h"
#include "tools/function_data.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Tables
        {
            class Filters;

            static const std::unordered_set<std::string> valid_filters_ops = {
                "=", "!=", "<", ">", "<=", ">=", "LIKE", "NOT LIKE", 
                "IN", "NOT IN", "IS NULL", "IS NOT NULL"
            };

            static const std::unordered_map<std::string, std::unordered_set<std::string>> filters_ops_by_column_type = {
                {"text",              {"LIKE", "=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"long-text",         {"LIKE", "=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"user",              {"LIKE", "=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"current-user",      {"LIKE", "=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"file",              {"LIKE", "=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"image",             {"LIKE", "=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"int-number",        {"=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"decimal-number",    {"=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"date",              {"=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"time",              {"=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"created-date",      {"=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"updated-date",      {"=", "!=", ">", "<", ">=", "<=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}},
                {"selection",         {"=", "!=", "IN", "NOT IN", "IS NULL", "IS NOT NULL"}}
            };
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::Tables::Filters : public Tools::FunctionData
{
    public:
        Filters(Tools::FunctionData& function_data);

    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);

            void ReadFiltersByView(StructBX::Functions::Action::Ptr action);
        };
        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);

            void InsertFilter(StructBX::Functions::Action::Ptr action);
            void GetNextFilterPosition(StructBX::Functions::Action::Ptr action);
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void UpdateFilter(StructBX::Functions::Action::Ptr action);
        };
        struct ModifyPosition : public Tools::FunctionData
        {
            ModifyPosition(Tools::FunctionData& function_data);

            void CalculateNewFilterPosition(StructBX::Functions::Action::Ptr action);
            void UpdateFilterPosition(StructBX::Functions::Action::Ptr action);
        };
        struct ModifyVisible : public Tools::FunctionData
        {
            ModifyVisible(Tools::FunctionData& function_data);

            void ToggleFilterActive(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void DeleteFilter(StructBX::Functions::Action::Ptr action);
        };
        

    private:
        Read struct_read_;
        Add struct_add_;
        Modify struct_modify_;
        ModifyPosition struct_modify_position_;
        ModifyVisible struct_modify_visible_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_FILTERS_H