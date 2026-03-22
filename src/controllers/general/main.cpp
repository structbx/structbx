
#include "controllers/general/main.h"

using namespace StructBX::Controllers::General;

Main::Main(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
    ,function_users_(function_data)
    ,function_groups_(function_data)
    ,function_permissions_(function_data)
    ,struct_read_instance_name_(function_data)
    ,struct_modify_instance_name_(function_data)
    ,struct_read_instance_logo_(function_data)
    ,struct_modify_instance_logo_(function_data)
{
    
}

Main::ReadInstanceName::ReadInstanceName(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/read
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/instanceName/read", HTTP::EnumMethods::kHTTP_GET);
    
    auto action1 = function->AddAction_("a1");
    action1->set_sql_code(
        "SELECT * \
        FROM settings \
        WHERE name = 'instance_name'"
    );
    
    get_functions()->push_back(function);
}

Main::ModifyInstanceName::ModifyInstanceName(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function GET /api/general/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/instanceName/modify", HTTP::EnumMethods::kHTTP_PUT);
    
    auto action1 = function->AddAction_("a1");
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
            param->set_error("El nombre de la instancia no puede estar vacío");
            return false;
        }
        if(param->ToString_().size() <= 3)
        {
            param->set_error("El nombre de la instancia no puede tener menos de 3 caracteres");
            return false;
        }
        return true;
    });
    
    get_functions()->push_back(function);
}

Main::ReadInstanceLogo::ReadInstanceLogo(Tools::FunctionData& function_data) :
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

        auto action = self.AddAction_("a1");
        action->set_sql_code(
            "SELECT value \
            FROM settings \
            WHERE name = 'instance_logo'"
        );
        if(!action->Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + action->get_identifier() + ": MXGEvEU5KBXG");
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
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error al leer el logo.");
            return;
        }
    });

    get_functions()->push_back(function);
}

Main::ModifyInstanceLogo::ModifyInstanceLogo(Tools::FunctionData& function_data) :
    Tools::FunctionData(function_data)
{
    // Function PUT /api/general/instanceLogo/modify
    StructBX::Functions::Function::Ptr function = 
        std::make_shared<StructBX::Functions::Function>("/api/general/instanceLogo/modify", HTTP::EnumMethods::kHTTP_PUT);
    function->set_response_type(Functions::Function::ResponseType::kCustom);

    function->SetupCustomProcess_([](Functions::Function& self)
    {
        // Request logo path in DB
        Functions::Action a1("a1");
        a1.set_sql_code(
            "SELECT value \
            FROM settings \
            WHERE name = 'instance_logo'"
        );

        if(!a1.Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + a1.get_identifier() + ": JKxcMl1ilXrK");
            return;
        }
        
        // Upload a new logo
        self.get_file_manager()->set_operation_type(Files::OperationType::kUpload);
        auto& front_file = self.get_file_manager()->get_files().front();
        self.get_file_manager()->set_directory_base(Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded"));
        
        if(!self.get_file_manager()->ChangePathAndFilename_(front_file, self.get_file_manager()->get_directory_base()))
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error al subir el archivo.");
            return;
        }
        self.get_file_manager()->AddSupportedFile_("png", Files::FileProperties{"image/png", true, {""}});
        self.get_file_manager()->AddSupportedFile_("jpg", Files::FileProperties{"image/jpg", true, {"jpeg"}});

        // Is supported
        if(!self.get_file_manager()->IsSupported_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Archivo no soportado, debe ser formato png, jpg o jpeg.");
            return;
        }

        // Verify max file size
        auto tmp_file_size = self.get_file_manager()->get_files().front().get_tmp_file()->getSize();
        if(tmp_file_size > 5000000) // 5MB
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "El archivo debe ser de menos de 5 MB.");
            return;
        }
        self.get_file_manager()->UploadFile_();

        // Save new logo in DB
        Functions::Action a2("a2");
        a2.set_sql_code(
            "UPDATE settings " \
            "SET value = ? " \
            "WHERE name = 'instance_logo'"
        );
        
        a2.AddParameter_("logo", front_file.get_requested_path()->getFileName(), false);
        if(!a2.Work_())
        {
            self.JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Error " + a2.get_identifier() + ": OAw1WyL0qR86");
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
