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


using namespace Poco;
using namespace StructBX;

struct Parameters
{
    std::string properties_file = "";
    bool db_init = false;
    bool db_update = false;
    bool version = false;
};

Parameters SetupParameters(std::vector<std::string>& parameters)
{
    Parameters params;

    // Properties file
    auto config = std::find(parameters.begin(), parameters.end(), "--config");
    params.properties_file = config != parameters.end() ? *(config + 1) : "properties.yaml";

    // Database initialization flag
    auto db_init = std::find(parameters.begin(), parameters.end(), "--db-init");
    params.db_init = db_init != parameters.end();

    // Database update flag (patches only)
    auto db_update = std::find(parameters.begin(), parameters.end(), "--db-update");
    params.db_update = db_update != parameters.end();

    // Version flag
    auto version = std::find(parameters.begin(), parameters.end(), "--version");
    params.version = version != parameters.end();

    // Remove all parameters except the first one
    std::string first_param = parameters.front();
    parameters = std::vector<std::string>();
    parameters.push_back(first_param);

    return params;
}

int main(int argc, char** argv)
{
    // Setup
        Core::Core app;

    // Parameters
        auto& parameters = app.get_console_parameters();
        parameters = std::vector<std::string>(argv, argv + argc);
        Parameters params = SetupParameters(parameters);

    // Version flag (--version)
        if(params.version)
        {
            std::cout << STRUCTBX_VERSION << std::endl;
            return 0;
        }

    // Settings
        StructBX::Tools::SettingsManager::set_config_path(params.properties_file);
        StructBX::Tools::SettingsManager::ReadSettings_();
        app.SetupSettings_();

    // Setup
        StructBX::Query::DatabaseManager::StartMySQL_();

    // Database initialization (--db-init flag, full schema + patches)
        if(params.db_init)
        {
            StructBX::Query::SchemaInitializer::Initialize_();
            StructBX::Query::DatabaseManager::StopMySQL_();
            return 0;
        }

    // Database update (--db-update flag, patches only)
        if(params.db_update)
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
