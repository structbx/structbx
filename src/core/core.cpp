
#include "core/core.h"

using namespace StructBX::Core;

StructBX::Core::Core::Core(bool use_ssl) :
    use_ssl_(use_ssl)
    ,handler_factory_(new HandlerFactory())
{
    if(use_ssl_)
        Net::initializeSSL();

    AddBasicSettings_();
}

StructBX::Core::Core::~Core()
{
    if(use_ssl_)
        Net::uninitializeSSL();
}

int StructBX::Core::Core::Init_()
{
    try
    {
        server_ = std::make_shared<Server>(handler_factory_);
        server_->set_use_ssl(use_ssl_);
        return server_->run(console_parameters_);
    }
    catch(Net::SSLException& error)
    {
        Tools::OutputLogger::Error_("Error on core.cpp on Init_(): " + error.displayText());
        return 1;
    }
    catch(Net::NetException& error)
    {
        Tools::OutputLogger::Error_("Error on core.cpp on Init_(): " + error.displayText());
        return 1;
    }
    catch(Poco::NullPointerException& error)
    {
        Tools::OutputLogger::Error_("Error on core.cpp on Init_(): " + error.displayText());
        return 1;
    }
    catch(Poco::SystemException& error)
    {
        Tools::OutputLogger::Error_("Error on core.cpp on Init_(): " + error.displayText());
        return 1;
    }
    catch(std::runtime_error& error)
    {
        Tools::OutputLogger::Error_("Error on core.cpp on Init_(): " + std::string(error.what()));
        return 1;
    }
    catch(std::exception& error)
    {
        Tools::OutputLogger::Error_("Error on core.cpp on Init_(): " + std::string(error.what()));
        return 1;
    }
    catch(...)
    {
        Tools::OutputLogger::Error_("Error on core.cpp on Init_(): Unhandled");
        return 1;
    }
}

int StructBX::Core::Core::Init_(int argc, char** argv)
{
    console_parameters_ = std::vector<std::string>(argv, argv + argc);

    return Init_();
}

void StructBX::Core::Core::AddBasicSettings_()
{
    Tools::SettingsManager::AddSetting_("port", Tools::DValue::Type::kInteger, Tools::DValue(8080));
    Tools::SettingsManager::AddSetting_("max_queued", Tools::DValue::Type::kInteger, Tools::DValue(1000));
    Tools::SettingsManager::AddSetting_("max_threads", Tools::DValue::Type::kInteger, Tools::DValue(16));
    Tools::SettingsManager::AddSetting_("max_file_size", Tools::DValue::Type::kInteger, Tools::DValue(15));
    Tools::SettingsManager::AddSetting_("db_host", Tools::DValue::Type::kString, Tools::DValue("127.0.0.1"));
    Tools::SettingsManager::AddSetting_("db_port", Tools::DValue::Type::kString, Tools::DValue("3306"));
    Tools::SettingsManager::AddSetting_("db_name", Tools::DValue::Type::kString, Tools::DValue(""));
    Tools::SettingsManager::AddSetting_("db_user", Tools::DValue::Type::kString, Tools::DValue(""));
    Tools::SettingsManager::AddSetting_("db_password", Tools::DValue::Type::kString, Tools::DValue(""));
    Tools::SettingsManager::AddSetting_("session_max_age", Tools::DValue::Type::kInteger, Tools::DValue(3600));
    Tools::SettingsManager::AddSetting_("directory_base", Tools::DValue::Type::kString, Tools::DValue("/var/www/structbx-web"));
    Tools::SettingsManager::AddSetting_("directory_for_temp_files", Tools::DValue::Type::kString, Tools::DValue("/tmp"));
    Tools::SettingsManager::AddSetting_("directory_for_uploaded_files", Tools::DValue::Type::kString, Tools::DValue("/var/www/structbx-web-uploaded"));
    Tools::SettingsManager::AddSetting_("certificate", Tools::DValue::Type::kString, Tools::DValue(""));
    Tools::SettingsManager::AddSetting_("key", Tools::DValue::Type::kString, Tools::DValue(""));
    Tools::SettingsManager::AddSetting_("rootcert", Tools::DValue::Type::kString, Tools::DValue(""));
    Tools::SettingsManager::AddSetting_("logger_output_file", Tools::DValue::Type::kString, Tools::DValue("structbx.log"));
    Tools::SettingsManager::AddSetting_("debug", Tools::DValue::Type::kBoolean, Tools::DValue(false));
    Tools::SettingsManager::AddSetting_("database_id_cookie_name", Tools::DValue::Type::kString, Tools::DValue("1f3efd18688d2"));
}

void StructBX::Core::Core::SetupSettings_()
{
    Tools::OutputLogger::set_log_to_file(SetupOutputLog());
    SetupUploadedDir();
    Tools::OutputLogger::set_output_file_address(Tools::SettingsManager::GetSetting_("logger_output_file", "structbx.log"));
    Tools::OutputLogger::set_print_debug(Tools::SettingsManager::GetSetting_("debug", true));
}

bool StructBX::Core::Core::SetupOutputLog()
{
    // File for output log
    File file_output_log(StructBX::Tools::SettingsManager::GetSetting_("logger_output_file", "/var/log/structbx.log"));
    if(!file_output_log.exists())
    {
        try
        {
            if (!file_output_log.createFile())
            {
                Tools::OutputLogger::Error_("Error on core/core.cpp on SetupOutputLog(): The output log file could not be created (" + file_output_log.path() + ")");
                return false;
            }
        }
        catch (Poco::FileException& e)
        {
            Tools::OutputLogger::Error_("Error on core/core.cpp on SetupOutputLog(): The output log file could not be created (" + file_output_log.path() + "): " + e.what());
            return false;
        }
    }

    return true;
}

bool StructBX::Core::Core::SetupUploadedDir()
{
    // Directory for uploaded files
    File dir_uploaded_files(StructBX::Tools::SettingsManager::GetSetting_("directory_for_uploaded_files", "/var/www/structbx-web-uploaded"));
    if(!dir_uploaded_files.exists())
    {
        try
        {
            dir_uploaded_files.createDirectories();
        }
        catch (Poco::FileException& e)
        {
            Tools::OutputLogger::Error_("Error on core/core.cpp on SetupUploadedDir(): The directory could not be created (" + dir_uploaded_files.path() + "): " + e.what());
            return false;
        }
    }

    return true;
}
