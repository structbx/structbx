#include <iostream>
#include <memory>

#include <Poco/File.h>
#include <Poco/Exception.h>

#include "core/core.h"
#include "structbxConfig.h"
#include "functions/action.h"
#include "query/schema_initializer.h"
#include "tools/route.h"
#include "query/parameter.h"
#include "tools/dvalue.h"
#include "tools/output_logger.h"
#include "tools/hmac_tool.h"
#include "tools/argument_parser.h"


using namespace Poco;
using namespace StructBX;

static void OverrideSetting_(const std::string& name, const std::string& value)
{
    auto it = Tools::SettingsManager::GetSetting_(name);
    if(it == Tools::SettingsManager::get_settings().end())
        return;

    try
    {
        switch(it->type)
        {
            case Tools::DValue::Type::kInteger:
                it->value = Tools::DValue(std::stoi(value)); break;
            case Tools::DValue::Type::kFloat:
                it->value = Tools::DValue(std::stof(value)); break;
            case Tools::DValue::Type::kBoolean:
                it->value = Tools::DValue(value == "true" || value == "1"); break;
            case Tools::DValue::Type::kString:
                it->value = Tools::DValue(value); break;
            default: break;
        }
    }
    catch(...)
    {
        Tools::OutputLogger::Error_("Failed to override setting '" + name + "' with value '" + value + "'");
    }
}

int main(int argc, char** argv)
{
    // Register all available options
    Tools::ArgumentParser::AddOption({"help", "h",
        "Show this help message and exit", false, ""});
    Tools::ArgumentParser::AddOption({"version", "v",
        "Print version and exit", false, ""});
    Tools::ArgumentParser::AddOption({"config", "c",
        "Path to YAML properties file", true, "properties.yaml"});
    Tools::ArgumentParser::AddOption({"db-init", "",
        "Initialize database schema from scratch", false, ""});
    Tools::ArgumentParser::AddOption({"db-update", "",
        "Apply pending database schema patches only", false, ""});
    Tools::ArgumentParser::AddOption({"port", "p",
        "Override server port", true, ""});
    Tools::ArgumentParser::AddOption({"host", "",
        "Override bind address", true, ""});
    Tools::ArgumentParser::AddOption({"debug", "d",
        "Enable debug mode", false, ""});
    Tools::ArgumentParser::AddOption({"log-file", "l",
        "Override log file path", true, ""});
    Tools::ArgumentParser::AddOption({"no-ssl", "",
        "Disable SSL even if certificate is configured", false, ""});
    Tools::ArgumentParser::AddOption({"db-host", "",
        "Override database host", true, ""});
    Tools::ArgumentParser::AddOption({"db-port", "",
        "Override database port", true, ""});
    Tools::ArgumentParser::AddOption({"db-name", "",
        "Override database name", true, ""});
    Tools::ArgumentParser::AddOption({"db-user", "",
        "Override database user", true, ""});
    Tools::ArgumentParser::AddOption({"db-password", "",
        "Override database password", true, ""});

    // Parse arguments
    if(!Tools::ArgumentParser::Parse(argc, argv))
    {
        auto unknown = Tools::ArgumentParser::GetUnknownOptions();
        std::string unknown_str;
        for(auto& u : unknown)
            unknown_str += u + " ";
        Tools::ArgumentParser::PrintError("Unknown option(s): " + unknown_str);
        Tools::ArgumentParser::PrintHelp(argv[0]);
        return 1;
    }

    // --help
    if(Tools::ArgumentParser::HasOption("help"))
    {
        Tools::ArgumentParser::PrintHelp(argv[0]);
        return 0;
    }

    // --version
    if(Tools::ArgumentParser::HasOption("version"))
    {
        std::cout << STRUCTBX_VERSION << std::endl;
        return 0;
    }

    // Setup
    Core::Core app;

    // Settings from config file
    std::string config_path = Tools::ArgumentParser::GetOptionValue("config", "properties.yaml");
    Tools::SettingsManager::set_config_path(config_path);
    Tools::SettingsManager::ReadSettings_();

    // CLI overrides (highest priority — applied before SetupSettings_)
    if(Tools::ArgumentParser::HasOption("port"))
        OverrideSetting_("port", Tools::ArgumentParser::GetOptionValue("port"));
    if(Tools::ArgumentParser::HasOption("host"))
        OverrideSetting_("host", Tools::ArgumentParser::GetOptionValue("host"));
    if(Tools::ArgumentParser::HasOption("debug"))
        OverrideSetting_("debug", "true");
    if(Tools::ArgumentParser::HasOption("log-file"))
        OverrideSetting_("logger_output_file", Tools::ArgumentParser::GetOptionValue("log-file"));
    if(Tools::ArgumentParser::HasOption("db-host"))
        OverrideSetting_("db_host", Tools::ArgumentParser::GetOptionValue("db-host"));
    if(Tools::ArgumentParser::HasOption("db-port"))
        OverrideSetting_("db_port", Tools::ArgumentParser::GetOptionValue("db-port"));
    if(Tools::ArgumentParser::HasOption("db-name"))
        OverrideSetting_("db_name", Tools::ArgumentParser::GetOptionValue("db-name"));
    if(Tools::ArgumentParser::HasOption("db-user"))
        OverrideSetting_("db_user", Tools::ArgumentParser::GetOptionValue("db-user"));
    if(Tools::ArgumentParser::HasOption("db-password"))
        OverrideSetting_("db_password", Tools::ArgumentParser::GetOptionValue("db-password"));

    if(Tools::ArgumentParser::HasOption("no-ssl"))
        app.set_no_ssl(true);

    app.SetupSettings_();

    // DB
    StructBX::Query::DatabaseManager::StartMySQL_();

    // --db-init
    if(Tools::ArgumentParser::HasOption("db-init"))
    {
        StructBX::Query::SchemaInitializer::Initialize_();
        StructBX::Query::DatabaseManager::StopMySQL_();
        return 0;
    }

    // --db-update
    if(Tools::ArgumentParser::HasOption("db-update"))
    {
        StructBX::Query::SchemaInitializer::Update_();
        StructBX::Query::DatabaseManager::StopMySQL_();
        return 0;
    }

    StructBX::Security::PermissionsManager::LoadPermissions_();
    StructBX::Sessions::SessionsManager::ReadSessions_();

    // Run
    auto code = app.Init_();

    // End
    StructBX::Query::DatabaseManager::StopMySQL_();
    return code;
}
