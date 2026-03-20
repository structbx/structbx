
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
    ,struct_read_table_data_(function_data)
    ,struct_read_columns_(function_data)
    ,struct_add_data_(function_data)
{
    
}

Main::VerifyPublicFormEnabled::VerifyPublicFormEnabled(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{

}

void Main::VerifyPublicFormEnabled::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "f.public_form AS public_form, d.identifier AS database_id " \
        "FROM tables f " \
        "JOIN `databases` d ON d.id = f.id_database " \
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

Main::VerifyLinkTableIsInMain::VerifyLinkTableIsInMain(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{

}

void Main::VerifyLinkTableIsInMain::A1(StructBX::Functions::Action::Ptr action)
{
    action->set_sql_code(
        "SELECT " \
            "f.identifier, fc.link_to " \
        "FROM tables_columns fc " \
        "JOIN tables f ON f.id = fc.id_table " \
        "WHERE f.identifier = ? AND fc.link_to = (SELECT id FROM tables WHERE identifier = ?) " \
        "AND f.public_form = 1"
    );
    action->set_final(false);
    action->AddParameter_("main-table-identifier", "", true)
    ->SetupCondition_("condition-main-table-identifier", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->get_value()->ToString_() == "")
        {
            param->set_error("El identificador de tabla principal no puede estar vacío");
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

Main::CreateSystemUser::CreateSystemUser() :
    user_id(-1)
    ,session_id("")
    ,error(false)
{
    // Generate random credentials
    Tools::Credentials credentials;
    credentials.GenerateRandomCredentials_(12, 16);
    credentials.set_user("_structbx_system_" + credentials.get_user());

    // Save in DB credentials
    Functions::Action save_credentials_action("save_credentials_action");
    save_credentials_action.set_sql_code(
        "INSERT INTO users (username, password, status, type)"
        "VALUES (?, ?, 'active', 'system')"
    );
    save_credentials_action.AddParameter_("username", credentials.get_user(), false);
    save_credentials_action.AddParameter_("password", credentials.get_password(), false);

    if(!save_credentials_action.Work_())
    {
        error = true;
        return;
    }
    user_id = save_credentials_action.get_last_insert_id();
    Security::PermissionsManager::LoadPermissions_();

    // Save in DB Session
    auto& session = Sessions::SessionsManager::CreateSession_(user_id, "/", 300);
    session_id = session.get_id();
}

void Main::CreateSystemUser::DeleteSystemUser()
{
    Functions::Action delete_user_action("delete_user_action");
    delete_user_action.set_sql_code(
        "DELETE FROM users WHERE id = ?"
    );
    delete_user_action.AddParameter_("id", user_id, false);

    if(!delete_user_action.Work_())
    {
        Tools::OutputLogger::Error_("Error deleting temporary user in Main::CreateSystemUser::DeleteSystemUser: xhSo4FleZp");
    }
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
        
        // Get Database ID
        auto database_id = pfv->get_results()->ExtractField_(0, 1);
        if(database_id->IsNull_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error SD4Fa4fLDS");
            return;
        }
        
        // Create system user
        CreateSystemUser system_user;
        if(system_user.error)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error adLfo2Mq4p1");
            return;
        }

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
        
        // Add Cookies
        client.AddCookie_("structbx-sid", system_user.session_id);
        auto database_id_encoded = StructBX::Tools::Base64Tool().Encode_(database_id->ToString_());
        client.AddCookie_(StructBX::Tools::SettingsManager::GetSetting_("database_id_cookie_name", "1f3efd18688d2"), database_id_encoded);

        // Response handler
        client.set_response_handler([&](std::stringstream& response, Net::HTTPRequest&, Net::HTTPResponse&)
        {
            self.CustomResponse_(HTTP::Status::kHTTP_OK, response.str(), "application/json");
        });

        // Send
        client.SendHTTPSRequest_();

        // Delete system user
        system_user.DeleteSystemUser();
    });

    get_functions()->push_back(function);
}

Main::ReadTableData::ReadTableData(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/forms/tables/data/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/forms/tables/data/read", HTTP::EnumMethods::kHTTP_GET);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    // Verify if link table is in main table
    auto vltim = function->AddAction_("vltim");
    VerifyLinkTableIsInMain struct_verify_link_table_is_in_main(function_data);
    struct_verify_link_table_is_in_main.A1(vltim);

    // Public form verification
    auto pfv = function->AddAction_("pfv");
    VerifyPublicFormEnabled struct_verify_public_form_enabled(function_data);
    struct_verify_public_form_enabled.A1(pfv);

    // Setup custom process
    auto database_id = get_database_id();
    function->SetupCustomProcess_([database_id, pfv, vltim](StructBX::Functions::Function& self)
    {
        // Public form verification
        if(!pfv->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error 5u2UPHVRHkF6");
            return;
        }
        // vltim verification
        if(!vltim->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error 8qFiCgyBRE6G");
            return;
        }
        if(vltim->get_results()->size() == 0)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error vMKUEWq6UnT2");
            return;
        }
        
        // Get Database ID
        auto database_id = pfv->get_results()->ExtractField_(0, 1);
        if(database_id->IsNull_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error yIIoOO4kx6oc");
            return;
        }
        
        // Create system user
        CreateSystemUser system_user;
        if(system_user.error)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error dSRRU2lecYSy");
            return;
        }

        // Get table id
        auto table_identifier_param = self.GetParameter_("table-identifier");
        if(table_identifier_param == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error NeoVkUb6flhl");
            return;
        }

        // HTTP Request to /api/tables/data/read
        HTTP::Client client
        (
            "https://127.0.0.1:" + Tools::SettingsManager::GetSetting_("port", "3001") + "/api/tables/data/read?table-identifier=" + table_identifier_param->get()->ToString_() + "&from=link"
            ,HTTP::HTTP_GET
        );
        
        // Add Cookies
        client.AddCookie_("structbx-sid", system_user.session_id);
        auto database_id_encoded = StructBX::Tools::Base64Tool().Encode_(database_id->ToString_());
        client.AddCookie_(StructBX::Tools::SettingsManager::GetSetting_("database_id_cookie_name", "1f3efd18688d2"), database_id_encoded);

        // Response handler
        client.set_response_handler([&](std::stringstream& response, Net::HTTPRequest&, Net::HTTPResponse&)
        {
            self.CustomResponse_(HTTP::Status::kHTTP_OK, response.str(), "application/json");
        });

        // Send
        client.SendHTTPSRequest_();

        // Delete system user
        system_user.DeleteSystemUser();
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
        
        // Get Database ID
        auto database_id = pfv->get_results()->ExtractField_(0, 1);
        if(database_id->IsNull_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error SD4Fa4fLDS");
            return;
        }
        
        // Create system user
        CreateSystemUser system_user;
        if(system_user.error)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error adPe2Wq14p1");
            return;
        }

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

        // Add Cookies
        client.AddCookie_("structbx-sid", system_user.session_id);
        auto database_id_encoded = StructBX::Tools::Base64Tool().Encode_(database_id->ToString_());
        client.AddCookie_(StructBX::Tools::SettingsManager::GetSetting_("database_id_cookie_name", "1f3efd18688d2"), database_id_encoded);

        // Response handler
        client.set_response_handler([&](std::stringstream& response, Net::HTTPRequest&, Net::HTTPResponse&)
        {
            // Before to send the JSON response, delete all sensitive data that 
            // the client should not know from the response of /api/forms/columns/read
            self.CustomResponse_(HTTP::Status::kHTTP_OK, response.str(), "application/json");
        });

        // Send
        client.SendHTTPSRequest_();

        // Delete system user
        system_user.DeleteSystemUser();
    });

    get_functions()->push_back(function);
}

Main::AddData::AddData(Tools::FunctionData& function_data) : Tools::FunctionData(function_data)
{
    // Function GET /api/forms/tables/data/add
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/forms/tables/data/add", HTTP::EnumMethods::kHTTP_POST);

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
            self.JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error SD43DFSkdsi32");
            return;
        }

        // Get public_form result
        auto public_form = pfv->get_results()->First_();
        if(public_form->IsNull_() || public_form->Int_() != 1)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error SOWP342sdLDS");
            return;
        }

        // Get Database ID
        auto database_id = pfv->get_results()->ExtractField_(0, 1);
        if(database_id->IsNull_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_UNAUTHORIZED, "Error SD4Fa4fLDS");
            return;
        }
        
        // Create system user
        CreateSystemUser system_user;
        if(system_user.error)
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error aSo4F1Dq4p1");
            return;
        }

        // Get table id
        auto table_identifier_param = self.GetParameter_("table-identifier");
        if(table_identifier_param == self.get_parameters().end())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error dDK34SLDO34");
            return;
        }

        // HTTP Request to /api/tables/data/add
        HTTP::Client client
        (
            "https://127.0.0.1:" + Tools::SettingsManager::GetSetting_("port", "3001") + "/api/tables/data/add"
            ,HTTP::HTTP_POST
        );

        // Add Cookies
        client.AddCookie_("structbx-sid", system_user.session_id);
        auto database_id_encoded = StructBX::Tools::Base64Tool().Encode_(database_id->ToString_());
        client.AddCookie_(StructBX::Tools::SettingsManager::GetSetting_("database_id_cookie_name", "1f3efd18688d2"), database_id_encoded);

        // Response handler
        client.set_response_handler([&](std::stringstream& response, Net::HTTPRequest&, Net::HTTPResponse&)
        {
            self.CustomResponse_(HTTP::Status::kHTTP_OK, response.str(), "application/json");
        });

        // Add form parameters
        for(auto& param : self.get_parameters())
        {
            client.get_form().add(param->get_name(), param->ToString_());
        }

        // Send
        client.SendHTTPSRequest_();

        // Delete system user
        system_user.DeleteSystemUser();
    });

    get_functions()->push_back(function);
}