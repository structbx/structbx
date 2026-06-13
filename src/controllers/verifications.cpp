
#include "controllers/verifications.h"

using namespace StructBX::Controllers;

Verifications::Verifications(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,user_in_database_(function_data)
{
    
}

Verifications::UserInDatabase::UserInDatabase(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    action = std::make_shared<Functions::Action>("user_in_database_verification_action");
    action->set_final(false);
    action->set_sql_code(
        "SELECT COUNT(*) AS user_count " \
        "FROM databases_users " \
        "WHERE id_user = ? AND id_database = (SELECT id FROM `databases` WHERE identifier = ?)"
    );
    action->AddParameter_("id_user", "", false);
    action->AddParameter_("id_database", "", false);
}