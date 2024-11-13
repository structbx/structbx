
#include "functions/organizations/users.h"

using namespace StructBI::Functions::Organizations;

Users::Users(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,actions_(function_data)
{
    Read_();
    ReadCurrent_();
}

void Users::Read_()
{
    // Function GET /api/organizations/users/read
    NAF::Functions::Function::Ptr function = 
        std::make_shared<NAF::Functions::Function>("/api/organizations/users/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "SELECT nu.*, ng.group AS 'group' " \
        "FROM _naf_users nu " \
        "JOIN _naf_groups ng ON ng.id = nu.id_group " \
        "JOIN organizations_users ou ON ou.id_naf_user = nu.id " \
        "WHERE ou.id_organization = (SELECT id_organization FROM organizations_users WHERE id_naf_user = ?)"
    );
    action1->AddParameter_("id_user", get_id_user(), false);

    get_functions()->push_back(function);
}

void Users::ReadCurrent_()
{
    // Function GET /api/organizations/users/current/read
    NAF::Functions::Function::Ptr function = 
        std::make_shared<NAF::Functions::Function>("/api/organizations/users/current/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "SELECT nu.*, ng.group AS 'group' " \
        "FROM _naf_users nu " \
        "JOIN _naf_groups ng ON ng.id = nu.id_group " \
        "JOIN organizations_users ou ON ou.id_naf_user = nu.id " \
        "WHERE ou.id_naf_user = ?"
    );
    action1->AddParameter_("id_user", get_id_user(), false);

    get_functions()->push_back(function);
}
