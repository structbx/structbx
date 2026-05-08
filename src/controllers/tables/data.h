
#ifndef STRUCTBX_CONTROLLERS_TABLES_DATA_H
#define STRUCTBX_CONTROLLERS_TABLES_DATA_H

#include <fstream>

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

        struct VerifyPermissionsRead : public Tools::FunctionData
        {
            VerifyPermissionsRead(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct VerifyPermissionsReadFromLink : public Tools::FunctionData
        {
            VerifyPermissionsReadFromLink(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct VerifyPermissionsAdd : public Tools::FunctionData
        {
            VerifyPermissionsAdd(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct VerifyPermissionsModify : public Tools::FunctionData
        {
            VerifyPermissionsModify(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct VerifyPermissionsDelete : public Tools::FunctionData
        {
            VerifyPermissionsDelete(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct VerifyPermissionsJustOwner : public Tools::FunctionData
        {
            VerifyPermissionsJustOwner(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
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

            void A1(StructBX::Functions::Action::Ptr action);
        };
        struct ReadFile : public Tools::FunctionData
        {
            ReadFile(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
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

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
        };
        struct Modify : public Tools::FunctionData
        {
            Modify(Tools::FunctionData& function_data);

            void GetTableColumns(StructBX::Functions::Action::Ptr action);
        };
        struct Delete : public Tools::FunctionData
        {
            Delete(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
            void A2(StructBX::Functions::Action::Ptr action);
            void A3(StructBX::Functions::Action::Ptr action);
        };

    private:
        Read struct_read_;
        ReadChangeInt struct_read_change_int_;
        ReadFile struct_read_file_;
        Add struct_add_;
        Import struct_import_;
        Modify struct_modify_;
        Delete struct_delete_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_DATA_H