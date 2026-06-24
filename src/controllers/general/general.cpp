
#include "controllers/general/general.h"
#include "tools/random_generator.h"
#include "core/error_codes.h"

using namespace StructBX::Controllers::General;

General::General(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,function_users_(function_data)
    ,function_groups_(function_data)
    ,function_permissions_(function_data)
    ,struct_read_instance_name_(function_data)
    ,struct_modify_instance_name_(function_data)
    ,struct_read_instance_logo_(function_data)
    ,struct_modify_instance_logo_(function_data)
    ,struct_apikey_read_(function_data)
    ,struct_apikey_generate_(function_data)
    ,struct_apikey_revoke_(function_data)
{
    
}

General::ReadInstanceName::ReadInstanceName(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/instanceName/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("read_instance_name");
    action1->set_sql_code(
        "SELECT * \
        FROM settings \
        WHERE name = 'instance_name'"
    );
    
    get_functions()->push_back(function);
}

General::ModifyInstanceName::ModifyInstanceName(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/instanceName/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    auto action1 = function->AddAction_("modify_instance_name");
    action1->set_sql_code(
        "UPDATE settings \
        SET value = ? \
        WHERE name = 'instance_name'"
    );
    action1->AddParameter_("name", "", true)
    ->SetupCondition_("condition-name", Query::ConditionType::kError, [](Query::Parameter::Ptr param)
    {
        if(param->ToString_() == "")
        {
            param->set_error("The instance name cannot be empty.");
            return false;
        }
        if(param->ToString_().size() <= 3)
        {
            param->set_error("The instance name cannot be less than 3 characters.");
            return false;
        }
        return true;
    });

    get_functions()->push_back(function);
}

General::ApiKeyRead::ApiKeyRead(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/users/apikey/read
    StructBX::Functions::Function::Ptr function =
        std::make_shared<StructBX::Functions::Function>("/api/general/users/apikey/read", HTTP::EnumMethods::kHTTP_GET);

    auto action1 = function->AddAction_("read_api_key");
    action1->set_sql_code(
        "SELECT api_key "
        "FROM users "
        "WHERE identifier = ?"
    );
    action1->AddParameter_("id_user", get_id_user(), false);

    get_functions()->push_back(function);
}

General::ApiKeyGenerate::ApiKeyGenerate(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function PUT /api/general/users/apikey/generate
    StructBX::Functions::Function::Ptr function =
        std::make_shared<StructBX::Functions::Function>("/api/general/users/apikey/generate", HTTP::EnumMethods::kHTTP_PUT);

    function->set_response_type(StructBX::Functions::Function::ResponseType::kCustom);

    auto id_user = get_id_user();
    function->SetupCustomProcess_([id_user](StructBX::Functions::Function& self)
    {
        // Generate API key: "sbx_" + 44 random alphanumeric chars
        std::string api_key = "sbx_" + StructBX::Tools::RandomGenerator().GenerateAlphanumericID_(44);

        // Save to DB
        StructBX::Functions::Action action("ApiKeyGenerate");
        action.set_sql_code(
            "UPDATE users "
            "SET api_key = ? "
            "WHERE identifier = ?"
        );
        action.AddParameter_("api_key", api_key, false);
        action.AddParameter_("id_user", id_user, false);

        if(!action.Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Failed to generate API key.", ERR_GEN_API_KEY_FAIL);
            return;
        }

        // Return the new API key
        Poco::JSON::Object::Ptr json = new Poco::JSON::Object();
        json->set("api_key", api_key);
        self.CompoundFillResponse_(HTTP::Status::kHTTP_OK, json, "API key generated successfully.");
    });

    get_functions()->push_back(function);
}

General::ApiKeyRevoke::ApiKeyRevoke(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function PUT /api/general/users/apikey/revoke
    StructBX::Functions::Function::Ptr function =
        std::make_shared<StructBX::Functions::Function>("/api/general/users/apikey/revoke", HTTP::EnumMethods::kHTTP_PUT);

    auto action1 = function->AddAction_("revoke_api_key");
    action1->set_sql_code(
        "UPDATE users "
        "SET api_key = NULL "
        "WHERE identifier = ?"
    );
    action1->AddParameter_("id_user", get_id_user(), false);

    get_functions()->push_back(function);
}

General::ReadInstanceLogo::ReadInstanceLogo(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
        // Function GET /api/general/instanceLogo/read
    Functions::Function::Ptr function = 
        std::make_shared<Functions::Function>("/api/general/instanceLogo/read", HTTP::EnumMethods::kHTTP_GET);
    function->set_response_type(Functions::Function::ResponseType::kCustom);

    function->SetupCustomProcess_([](Functions::Function& self)
    {
        self.get_file_manager()->set_directory_base(Tools::SettingsManager::GetSetting_("directory_base", "/var/www/structbx-web-uploaded"));
        self.get_file_manager()->AddBasicSupportedFiles_();

        auto action = self.AddAction_("read_instance_logo");
        action->set_sql_code(
            "SELECT value \
            FROM settings \
            WHERE name = 'instance_logo'"
        );
        if(!action->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Failed to read logo.", ERR_GEN_LOGO_READ_FAIL);
            return;
        }
        
        // Download current logo
        auto field = action->get_results()->First_();
        if(!field->IsNull_() && field->ToString_() != "")
        {
            std::string logo_path = field->ToString_();

            // Verify logo exists and download it
            Files::FileManager file_manager;
            file_manager.set_directory_base(Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded"));
            file_manager.set_operation_type(Files::OperationType::kDownload);
            file_manager.get_files().push_back(file_manager.CreateTempFile_("/" + logo_path));

            if(file_manager.CheckFiles_())
            {
                auto response = self.get_http_server_response().value();
                file_manager.DownloadFile_(response->send());
                return;
            }
        }

        // Download StrutBX logo if current logo don't exists
        Files::FileManager file_manager;
        file_manager.set_directory_base(Tools::SettingsManager::GetSetting_("directory_base", "/var/www/structbx-web"));
        file_manager.set_operation_type(Files::OperationType::kDownload);
        // Get logo color parameter
        auto logo_color_param = self.GetParameter_("logo-color");
        if(logo_color_param != self.get_parameters().end() && logo_color_param->get()->ToString_() == "white")
            file_manager.get_files().push_back(file_manager.CreateTempFile_("/assets/images/logo-w.png"));
        else
            file_manager.get_files().push_back(file_manager.CreateTempFile_("/assets/images/logo.png"));
        
        if(file_manager.CheckFiles_())
        {
            auto response = self.get_http_server_response().value();
            file_manager.DownloadFile_(response->send());
            return;
        }
        else
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Failed to read logo.", ERR_GEN_LOGO_READ_FAIL);
            return;
        }
    });

    get_functions()->push_back(function);
}

General::ModifyInstanceLogo::ModifyInstanceLogo(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function PUT /api/general/instanceLogo/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/instanceLogo/modify", HTTP::EnumMethods::kHTTP_PUT);
    function->set_response_type(Functions::Function::ResponseType::kCustom);

    function->SetupCustomProcess_([](Functions::Function& self)
    {
        // Request logo path in DB
        Functions::Action a1("read_old_instance_logo");
        a1.set_sql_code(
            "SELECT value \
            FROM settings \
            WHERE name = 'instance_logo'"
        );

        if(!a1.Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Failed to read logo.", ERR_GEN_LOGO_READ_FAIL);
            return;
        }
        
        // Upload a new logo
        self.get_file_manager()->set_operation_type(Files::OperationType::kUpload);
        auto& front_file = self.get_file_manager()->get_files().front();
        self.get_file_manager()->set_directory_base(Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded"));
        
        if(!self.get_file_manager()->ChangePathAndFilename_(front_file, self.get_file_manager()->get_directory_base()))
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error uploading the file.");
            return;
        }
        self.get_file_manager()->AddSupportedFile_("png", Files::FileProperties{"image/png", true, {""}});
        self.get_file_manager()->AddSupportedFile_("jpg", Files::FileProperties{"image/jpg", true, {"jpeg"}});

        // Is supported
        if(!self.get_file_manager()->IsSupported_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "File not supported, must be png, jpg or jpeg format.", ERR_FILE_NOT_SUPPORTED);
            return;
        }

        // Verify max file size
        auto tmp_file_size = self.get_file_manager()->get_files().front().get_tmp_file()->getSize();
        if(tmp_file_size > 5000000) // 5MB
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The file must be less than 5 MB.", ERR_FILE_SIZE_EXCEEDED);
            return;
        }
        self.get_file_manager()->UploadFile_();

        // Save new logo in DB
        Functions::Action a2("save_new_instance_logo");
        a2.set_sql_code(
            "UPDATE settings " \
            "SET value = ? " \
            "WHERE name = 'instance_logo'"
        );
        
        a2.AddParameter_("logo", front_file.get_requested_path()->getFileName(), false);
        if(!a2.Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Failed to save logo.", ERR_GEN_LOGO_SAVE_FAIL);
            return;
        }
        
        // Remove old file
        auto field = a1.get_results()->First_();
        if(!field->IsNull_() && field->ToString_() != "")
        {
            if(!field->get_value()->TypeIsIqual_(Tools::DValue::Type::kEmpty))
            {
                std::string logo_path = field->ToString_();

                // Verify logo exists and remove it
                Files::FileManager file_manager;
                file_manager.set_directory_base(Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded"));
                file_manager.set_operation_type(Files::OperationType::kDelete);
                file_manager.get_files().push_back(file_manager.CreateTempFile_("/" + logo_path));

                if(file_manager.CheckFiles_())
                    file_manager.RemoveFile_();
            }
        }

        // Response
        self.CompoundFillResponse_(HTTP::Status::kHTTP_OK, self.get_file_manager()->get_result(), "Ok.");
    });

    get_functions()->push_back(function);
}
