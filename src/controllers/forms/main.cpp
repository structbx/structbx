
#include "controllers/forms/main.h"
#include "functions/action.h"
#include "security/permissions_manager.h"
#include "sessions/sessions_manager.h"
#include <Poco/Exception.h>
#include <Poco/JSON/Object.h>
#include <Poco/Net/SSLException.h>
#include <sstream>

using namespace StructBX::Controllers::Forms;

Main::Main(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,struct_read_table_specific_(function_data)
    ,struct_read_columns_(function_data)
{
    
}

Main::VerifyPublicFormEnabled::VerifyPublicFormEnabled(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{

}

void Main::VerifyPublicFormEnabled::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "f.public_form AS public_form " \
        "FROM tables f " \
        "WHERE f.identifier = ?"
    );
    action->set_final(false);
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

Main::ReadTableSpecific::ReadTableSpecific(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/forms/tables/read/identifier
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/forms/tables/read/identifier", HTTP::EnumMethods::kHTTP_GET);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Public form verification
    auto pfv = function->AddAction_("pfv");
    VerifyPublicFormEnabled struct_verify_public_form_enabled(function_data);
    struct_verify_public_form_enabled.A1(pfv);

    // Setup custom process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, pfv](StructBX::Functions::Function& self)
    {
        // Public form verification
        if(!pfv->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error sOAIsi80PllR");
            return;
        }

        // Get public_form result
        auto public_form = pfv->get_results()->First_();
        if(public_form->IsNull_() || public_form->Int_() != 1)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error sp289WDFFpw289m");
            return;
        }
        
        // Generate random credentials
        Tools::Credentials credentials;
        credentials.GenerateRandomCredentials_(12, 16);
        credentials.set_user("_structbx_local_" + credentials.get_user());

        // Save in DB credentials
        Functions::Action save_credentials_action("save_credentials_action");
        save_credentials_action.set_sql_code(
            "INSERT INTO users (username, password, status, id_group)"
            "VALUES (?, ?, 'active', (SELECT id FROM groups WHERE `group` = 'admin' LIMIT 1))"
        );
        save_credentials_action.AddParameter_("username", credentials.get_user(), false);
        save_credentials_action.AddParameter_("password", credentials.get_password(), false);

        if(!save_credentials_action.Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error sdDF23jMq4p1");
            return;
        }
        auto user_id = save_credentials_action.get_last_insert_id();
        Security::PermissionsManager::LoadPermissions_();

        // Save in DB Session
        auto& session = Sessions::SessionsManager::CreateSession_(user_id, "/", 300);

        // Get table id
        auto table_identifier_param = self.GetParameter_("table-identifier");
        if(table_identifier_param == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error pdfkiwe23sdZp");
            return;
        }

        // HTTP Request to /api/tables/read/identifier
        HTTP::Client client
        (
            "https://127.0.0.1:" + Tools::SettingsManager::GetSetting_("port", "3001") + "/api/tables/read/identifier?identifier=" + table_identifier_param->get()->ToString_()
            ,HTTP::HTTP_GET
        );
        client.AddCookie_("structbx-sid", session.get_id());
        client.set_response_handler([&](std::stringstream& response, Net::HTTPRequest&, Net::HTTPResponse&)
        {
            self.CustomResponse_(HTTP::Status::kHTTP_OK, response.str(), "application/json");
        });
        client.SendHTTPSRequest_();

        // Delete temporary user
        Functions::Action delete_user_action("delete_user_action");
        delete_user_action.set_sql_code(
            "DELETE FROM users WHERE id = ?"
        );
        delete_user_action.AddParameter_("id", user_id, false);

        if(!delete_user_action.Work_())
        {
            Tools::OutputLogger::Error_("Error deleting temporary user in ReadTableSpecific: xh1K3Jq9Zp");
        }
    });

    get_functions()->push_back(function);
}

Main::ReadColumns::ReadColumns(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/forms/columns/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/forms/columns/read", HTTP::EnumMethods::kHTTP_GET);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Public form verification
    auto pfv = function->AddAction_("pfv");
    VerifyPublicFormEnabled struct_verify_public_form_enabled(function_data);
    struct_verify_public_form_enabled.A1(pfv);

    // Setup custom process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, pfv](StructBX::Functions::Function& self)
    {
        // Public form verification
        if(!pfv->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error kdb5OAI0PllR");
            return;
        }

        // Get public_form result
        auto public_form = pfv->get_results()->First_();
        if(public_form->IsNull_() || public_form->Int_() != 1)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error 2VJ7Bf7M9Wuk");
            return;
        }
        
        // Generate random credentials
        Tools::Credentials credentials;
        credentials.GenerateRandomCredentials_(12, 16);
        credentials.set_user("_structbx_local_" + credentials.get_user());

        // Save in DB credentials
        Functions::Action save_credentials_action("save_credentials_action");
        save_credentials_action.set_sql_code(
            "INSERT INTO users (username, password, status, id_group)"
            "VALUES (?, ?, 'active', (SELECT id FROM groups WHERE `group` = 'admin' LIMIT 1))"
        );
        save_credentials_action.AddParameter_("username", credentials.get_user(), false);
        save_credentials_action.AddParameter_("password", credentials.get_password(), false);

        if(!save_credentials_action.Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error ajLg7RUMq4p1");
            return;
        }
        auto user_id = save_credentials_action.get_last_insert_id();
        Security::PermissionsManager::LoadPermissions_();

        // Save in DB Session
        auto& session = Sessions::SessionsManager::CreateSession_(user_id, "/", 300);

        // Get table id
        auto table_identifier_param = self.GetParameter_("table-identifier");
        if(table_identifier_param == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error h3K0Jq9Zp");
            return;
        }

        // HTTP Request to /api/tables/columns/read
        HTTP::Client client
        (
            "https://127.0.0.1:" + Tools::SettingsManager::GetSetting_("port", "3001") + "/api/tables/columns/read?table-identifier=" + table_identifier_param->get()->ToString_()
            ,HTTP::HTTP_GET
        );
        client.AddCookie_("structbx-sid", session.get_id());
        client.set_response_handler([&](std::stringstream& response, Net::HTTPRequest&, Net::HTTPResponse&)
        {
            self.CustomResponse_(HTTP::Status::kHTTP_OK, response.str(), "application/json");
        });
        client.SendHTTPSRequest_();

        // Delete temporary user
        Functions::Action delete_user_action("delete_user_action");
        delete_user_action.set_sql_code(
            "DELETE FROM users WHERE id = ?"
        );
        delete_user_action.AddParameter_("id", user_id, false);

        if(!delete_user_action.Work_())
        {
            Tools::OutputLogger::Error_("Error deleting temporary user in ReadColumns: xh1K3Jq9Zp");
        }
    });

    get_functions()->push_back(function);
}