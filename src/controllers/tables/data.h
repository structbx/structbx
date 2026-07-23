
#ifndef STRUCTBX_CONTROLLERS_TABLES_DATA_H
#define STRUCTBX_CONTROLLERS_TABLES_DATA_H

#include <fstream>
#include <functional>
#include <unordered_map>
#include <unordered_set>

#include "tools/base_action.h"
#include "tools/function_data.h"
#include <functions/action.h>
#include <functions/function.h>
#include <query/field.h>
#include <query/results.h>
#include "controllers/tables/filters.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Tables
        {
            class Data;
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::Tables::Data : public Tools::FunctionData
{
    public:
        Data(FunctionData& function_data);

    protected:
        struct ParameterConfiguration
        {
            enum class Type {kAdd, kModify};

            ParameterConfiguration(Type type, std::string& columns, std::string& values, std::string id_database) :
                type(type)
                ,columns(columns)
                ,values(values)
                ,id_database(id_database)
            {}
            void Setup(StructBX::Functions::Function& self, StructBX::Query::Results::Ptr results, std::string table_id, StructBX::Functions::Action::Ptr action3);

            Type type;
            std::string& columns;
            std::string& values;
            std::string id_database;
        };
        struct FileProcessing
        {
            bool Save();
            bool Delete();

            StructBX::Files::FileManager::Ptr file_manager;
            std::string filepath = "";
            std::string name = "";
            std::string error = "";
        };
        struct ParameterVerification
        {
            ParameterVerification(
                Query::Field::Ptr required
                ,Query::Field::Ptr default_value
                ,Query::Field::Ptr column_type
            ) :
                required(required)
                ,default_value(default_value)
                ,column_type(column_type)
            {
                
            }
            bool Verify(Query::Parameter::Ptr param);

            Query::Field::Ptr required;
            Query::Field::Ptr default_value;
            Query::Field::Ptr column_type;
        };
        struct ChangeInt
        {
            void Change(std::string row_id, std::string operation, std::string table_identifier);
        };
        struct SelectionResolver
        {
            struct SelectionColMeta
            {
                std::string link_to;
                std::string display_col;
            };

            SelectionResolver(Query::Results::Ptr columns_results, std::string id_database);

            std::string ResolveValue(std::string column_identifier, std::string value);
            void ResolveActionParams(Functions::Action::Ptr action);
            bool IsSelectionColumn(const std::string& column_id) const;
            std::string CreateSelectionValue(
                const std::string& column_id,
                const std::string& display_value,
                Functions::Function& self,
                const std::string& id_database);

            std::unordered_map<std::string, std::unordered_map<std::string, std::string>> selection_maps;
            std::unordered_map<std::string, SelectionColMeta> selection_meta;
        };

        struct VerifyPermissionsRead : public Tools::FunctionData
        {
            VerifyPermissionsRead(Tools::FunctionData& function_data);

            void CheckReadPermission(StructBX::Functions::Action::Ptr action);
        };
        struct VerifyPermissionsReadFromLink : public Tools::FunctionData
        {
            VerifyPermissionsReadFromLink(Tools::FunctionData& function_data);

            void CheckReadViaLinkPermission(StructBX::Functions::Action::Ptr action);
        };
        struct VerifyPermissionsAdd : public Tools::FunctionData
        {
            VerifyPermissionsAdd(Tools::FunctionData& function_data);

            void CheckAddPermission(StructBX::Functions::Action::Ptr action);
        };
        struct VerifyPermissionsModify : public Tools::FunctionData
        {
            VerifyPermissionsModify(Tools::FunctionData& function_data);

            void CheckModifyPermission(StructBX::Functions::Action::Ptr action);
        };
        struct VerifyPermissionsDelete : public Tools::FunctionData
        {
            VerifyPermissionsDelete(Tools::FunctionData& function_data);

            void CheckDeletePermission(StructBX::Functions::Action::Ptr action);
        };
        struct PolicyInfo
        {
            std::string identifier;
            std::string target_type;
            std::string target_id;
            std::string action_type;
            std::string filter_column;
            std::string filter_operator;
            std::string filter_value;
            int priority;
        };
        struct ColumnInfo
        {
            std::string type;
            std::string link_to;
        };
        struct RowPolicyEvaluator
        {
            RowPolicyEvaluator();

            bool LoadPolicies(Functions::Function& self, std::string table_identifier);
            void SetValidColumns(Query::Results::Ptr columns_results);
            bool HasBypass(Functions::Function& self, std::string current_user_id);
            std::string BuildCondition(Functions::Function& self, std::string table_alias, std::string current_user_id, std::string id_database, std::string table_identifier);

        private:
            bool MatchPolicyTarget(const PolicyInfo& policy, Functions::Function& self, std::string current_user_id);

            std::vector<PolicyInfo> policies_;
            std::map<std::string, ColumnInfo> valid_columns_;
        };
        struct Read : public Tools::FunctionData
        {
            struct GetFilters
            {
                GetFilters(){}
                std::string Get(Functions::Function& self, std::string view_identifier);
            };
            struct GetSorts
            {
                GetSorts(){}
                std::string Get(Functions::Function& self, std::string view_identifier);
            };
            struct Export
            {
                Export(){}
                bool Start(Functions::Function& self, Functions::Action::Ptr table_data);
            };

            Read(Tools::FunctionData& function_data);

            void GetDefaultView(StructBX::Functions::Action::Ptr action);
            void GetTableColumns(StructBX::Functions::Action::Ptr action);
            void LinkToAction(StructBX::Functions::Action::Ptr action);
        };
        struct ReadChangeInt : public Tools::FunctionData
        {
            ReadChangeInt(Tools::FunctionData& function_data);
        };
        struct ReadFile : public Tools::FunctionData
        {
            ReadFile(Tools::FunctionData& function_data);

            void VerifyTableForFileRead(StructBX::Functions::Action::Ptr action);
        };
        struct Add : public Tools::FunctionData
        {
            Add(Tools::FunctionData& function_data);

            void GetTableInfo(StructBX::Functions::Action::Ptr action);
            void GetTableColumnsInfo(StructBX::Functions::Action::Ptr action);
        };
        struct Import : public Tools::FunctionData
        {
            Import(Tools::FunctionData& function_data);

            void VerifyTableExistsForImport(StructBX::Functions::Action::Ptr action);
            void GetColumnsForImport(StructBX::Functions::Action::Ptr action);
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void GetTableColumns(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void GetTableColumns(StructBX::Functions::Action::Ptr action);
            void SetIdentifierParam(StructBX::Functions::Action::Ptr action);
        };

    private:
        static void ResolveDisplayChain(
            const std::function<Functions::Action::Ptr(const std::string&)>& create_action,
            const std::string& id_database,
            const std::string& col_identifier,
            std::string& current_table,
            std::string& current_alias,
            std::string& current_display_col,
            std::string& accumulated_joins,
            int max_depth,
            std::string& out_column_expr
        );

        Read struct_read_;
        ReadChangeInt struct_read_change_int_;
        ReadFile struct_read_file_;
        Add struct_add_;
        Import struct_import_;
        Modify struct_modify_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_DATA_H