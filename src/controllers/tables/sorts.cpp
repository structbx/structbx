
#include "controllers/tables/sorts.h"

using namespace StructBX::Controllers::Tables;

Sorts::Sorts(Tools::FunctionData& function_data) :
    FunctionData(function_data)
    ,struct_read_(function_data)
{
    
}

Sorts::Read::Read(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/tables/sorts/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/tables/sorts/read", HTTP::EnumMethods::kHTTP_GET);

    auto action = function->AddAction_("a1");
    A1(action);

    get_functions()->push_back(function);
}

void Sorts::Read::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "vf.identifier, vf.id_column, vf.sort, vf.position, vf.is_active " \
        "FROM views_sorts vf " \
        "JOIN views v ON v.identifier = vf.id_view " \
        "JOIN tables f ON f.identifier = v.id_table " \
        "WHERE v.identifier = ? AND f.identifier = ? ORDER BY vf.position ASC"
    );

    action->AddParameter_("view-identifier", "", true)
    ->SetupCondition_("condition-view-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de vista no puede estar vacío");
            return false;
        }
        return true;
    });
    action->AddParameter_("table-identifier", "", true)
    ->SetupCondition_("condition-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla no puede estar vacío");
            return false;
        }
        return true;
    });
}
