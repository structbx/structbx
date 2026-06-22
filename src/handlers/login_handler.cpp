
#include "handlers/login_handler.h"
#include "core/error_codes.h"

using namespace StructBX;
using namespace StructBX::Handlers;

Tools::Route StructBX::Handlers::AuthRoutes::login_route("/api/auth/login");
Tools::Route StructBX::Handlers::AuthRoutes::logout_route("/api/auth/logout");

LoginHandler::~LoginHandler()
{

}

void LoginHandler::Process_()
{
    auto method = GetMethod_(get_properties().method);
    switch(method)
    {
        case HTTP::EnumMethods::kHTTP_POST:
            Login_();
            break;
        case HTTP::EnumMethods::kHTTP_GET:
        case HTTP::EnumMethods::kHTTP_PUT:
        case HTTP::EnumMethods::kHTTP_DEL:
        case HTTP::EnumMethods::kHTTP_HEAD:
        case HTTP::EnumMethods::kHTTP_OPTIONS:
        case HTTP::EnumMethods::kHTTP_PATCH:
        case HTTP::EnumMethods::kNULL:
            JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, ERR_AUTH_BAD_METHOD);
            break;
    }
}

void LoginHandler::Login_()
{
    if(get_requested_route()->get_segments() == AuthRoutes::login_route.get_segments())
    {
        StartSession_();
    }
    else if(get_requested_route()->get_segments() == AuthRoutes::logout_route.get_segments())
    {
        EndSession_();
    }
    else
        JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, ERR_AUTH_UNAUTHORIZED);
}

void LoginHandler::StartSession_()
{
    // Verify if the session exists
        auto session_id = SessionExists_();
        if(session_id != "")
        {
            JSONResponse_(HTTP::Status::kHTTP_OK, "The client has already logged in.");
            return;
        }

        // Process the request body
        ManageRequestBody_();

        // Identify parameters
        IdentifyParameters_();
        get_current_function()->IdentifyParameters_(get_users_manager().get_action());

        // Encode password
        auto password = get_users_manager().get_action()->GetParameter_("password");
        if(password != get_users_manager().get_action()->get_parameters().end())
        {
            password->get()->SetupCondition_("condition-password", Query::ConditionType::kWarning, [](Query::Parameter::Ptr param)
            {
                std::string password = param->ToString_();
                std::string password_encoded = StructBX::Tools::HMACTool().Encode_(password);
                param->set_value(StructBX::Tools::DValue::Ptr(new StructBX::Tools::DValue(password_encoded)));
                return true;
            });
        }
        
        if(!get_users_manager().AuthenticateUser_())
        {
            JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, ERR_AUTH_LOGIN_FAIL);
            return;
        }

    // Create the session
        auto session = Sessions::SessionsManager::CreateSession_
        (
            get_users_manager().get_current_user().get_id()
            ,"/"
            ,Tools::SettingsManager::GetSetting_("session_max_age", 3600)
        );

    // Response
        Poco::Net::HTTPCookie cookie("structbx-sid", session.get_id());
        cookie.setPath(session.get_path());
        cookie.setMaxAge(session.get_max_age());
        cookie.setSecure(true);

        auto& response = get_http_server_response().value();
        response->addCookie(cookie);

        JSONResponse_(HTTP::Status::kHTTP_OK, "Client logged in.");
}

void LoginHandler::EndSession_()
{
    // Delete session
        auto session_id = SessionExists_();
        if (session_id != "")
        {
            Sessions::SessionsManager::DeleteSession_(session_id);
        }

    // Response
        Poco::Net::HTTPCookie cookie("structbx-sid", "");
        cookie.setPath("/");
        cookie.setMaxAge(-1);

        Poco::Net::HTTPCookie cookie2(Tools::SettingsManager::GetSetting_("database_id_cookie_name", "1f3efd18688d2"), "");
        cookie2.setPath("/");
        cookie2.setMaxAge(-1);

        auto& response = get_http_server_response().value();
        response->addCookie(cookie);
        response->addCookie(cookie2);

        JSONResponse_(HTTP::Status::kHTTP_OK, "Client logout.");
}

std::string LoginHandler::SessionExists_()
{
    // Extract session ID
        std::string session_id;
        Poco::Net::NameValueCollection cookies;
        get_http_server_request().value()->getCookies(cookies);
        auto cookie_session = cookies.find("structbx-sid");
        auto sessions = Sessions::SessionsManager::get_sessions();

    // Session exists
        if(cookie_session == cookies.end())
            return "";

        if(sessions.find(cookie_session->second) == sessions.end())
            return "";

        return sessions.find(cookie_session->second)->first;
}
