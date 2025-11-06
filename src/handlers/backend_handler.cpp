
#include "handlers/backend_handler.h"

using namespace StructBX;
using namespace StructBX::Handlers;
using namespace StructBX::Controllers;

BackendHandler::BackendHandler() :
    RootHandler::RootHandler()
    ,database_id_cookie_(StructBX::Tools::SettingsManager::GetSetting_("database_id_cookie_name", "1f3efd18688d2"), "")
    ,add_database_id_cookie_(false)
{

}

void BackendHandler::AddFunctions_()
{
    // Functions
    auto general = General::Main(function_data_);
    auto databases = Databases::Main(function_data_);
    auto tables = Tables::Main(function_data_);
    auto forms = Forms::Main(function_data_);

    // Add all functions
    for(auto it : *function_data_.get_functions())
        get_functions_manager().get_functions().insert(std::make_pair(it->get_endpoint(), it));
}

void BackendHandler::Process_()
{
    get_files_parameters()->set_directory_base(StructBX::Tools::SettingsManager::GetSetting_("directory_base", "/var/www"));
    
    // Set security type
    set_security_type(Security::SecurityType::kDisableAll);
    
    // Process the request body
    ManageRequestBody_();

    // Verify sessions
    if(!VerifySession_())
    {
        JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Session not found.");
        return;
    }

    // Setup Function Data
    SetupFunctionData_();

    // Add functions
    AddFunctions_();

    // Route identification
    if(!IdentifyRoute_())
    {
        JSONResponse_(HTTP::Status::kHTTP_NOT_FOUND, "The requested endpoint (" + get_properties().method + ") is not available.");
        return;
    }

    // Setup database id cookie
    if(add_database_id_cookie_)
        get_current_function()->AddCookie_(database_id_cookie_);

    // Verify permissions
    if(!VerifyPermissions_())
    {
        JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "The user does not have the permissions to perform this operation.");
        return;
    }

    // Verify if user is active
    if(!VerifyActiveUser_())
    {
        JSONResponse_(HTTP::Status::kHTTP_FORBIDDEN, "The user is inactive.");
        return;
    }

    // Process actions
    ProcessActions_();
}

void BackendHandler::ProcessActions_()
{
    // Identify parameters
    IdentifyParameters_();

    // Set file parameters to current function
    get_current_function()->get_file_manager() = get_files_parameters();

    // Set json array and object to current function
    get_current_function()->set_json_array(get_json_array());
    get_current_function()->set_json_object(get_json_object());
    get_current_function()->set_data(get_data());

    // Set current user
    auto id = get_users_manager().get_current_user().get_id();
    auto username = get_users_manager().get_current_user().get_username();
    auto id_group = get_users_manager().get_current_user().get_id_group();

    get_current_function()->get_current_user().set_id(id);
    get_current_function()->get_current_user().set_username(username);
    get_current_function()->get_current_user().set_id_group(id_group);

    // Process current function
    get_current_function()->Process_(get_http_server_request(), get_http_server_response());
}

void BackendHandler::SetupFunctionData_()
{
    // Setup User ID
    function_data_.set_id_user(get_users_manager().get_current_user().get_id());
    
    // Get Cookie Database ID
    Poco::Net::NameValueCollection cookies;
    get_http_server_request().value()->getCookies(cookies);
    auto cookie_database_id = cookies.find(StructBX::Tools::SettingsManager::GetSetting_("database_id_cookie_name", "1f3efd18688d2"));

    // Set Database ID if exists in Cookies
    if(cookie_database_id != cookies.end())
    {
        auto database_id_decoded = StructBX::Tools::Base64Tool().Decode_(cookie_database_id->second);
        function_data_.set_database_id(database_id_decoded);
    }
    else
    {
        add_database_id_cookie_ = true;

        // Get Database ID Cookie if not exists in Cookies
        auto action = StructBX::Functions::Action("a1");
        action.set_sql_code(
            "SELECT s.id " \
            "FROM `databases` s " \
            "JOIN databases_users su ON su.id_database = s.id " \
            "WHERE su.id_naf_user = ? LIMIT 1"
        );
        action.AddParameter_("id_naf_user", function_data_.get_id_user(), false);
        if(action.Work_())
        {
            auto database_id = action.get_results()->First_();
            if(!database_id->IsNull_())
            {
                // Set Database ID
                function_data_.set_database_id(database_id->ToString_());

                // Save Database ID to Cookie
                auto database_id_encoded = StructBX::Tools::Base64Tool().Encode_(database_id->ToString_());

                Net::HTTPCookie cookie(StructBX::Tools::SettingsManager::GetSetting_("database_id_cookie_name", "1f3efd18688d2"), database_id_encoded);
                cookie.setPath("/");
                cookie.setSameSite(Net::HTTPCookie::SAME_SITE_STRICT);
                cookie.setSecure(true);
                cookie.setHttpOnly();
                database_id_cookie_ = HTTP::Cookie(cookie);
            }
        }
    }
}

bool BackendHandler::VerifyActiveUser_()
{
    // Action to check if user is active
    auto action = StructBX::Functions::Action("a1");
    action.set_sql_code(
        "SELECT nu.id " \
        "FROM users nu " \
        "WHERE nu.id = ? AND nu.status = 'active'"
    );
    action.AddParameter_("id_naf_user", function_data_.get_id_user(), false);
    if(action.Work_())
    {
        if(action.get_results()->size() != 1)
            return false;
    }

    return true;
}