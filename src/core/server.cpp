
#include "core/server.h"

using namespace StructBX::Core;

Server::Server(HandlerFactory* handler_factory) :
    handler_factory_(handler_factory)
{
    if(handler_factory_ == nullptr)
        handler_factory_ = new HandlerFactory();

}

void Server::SetupParams_(HTTPServerParams* params)
{
    params->setServerName(server_name_);
    params->setMaxQueued(Tools::SettingsManager::GetSetting_("max_queued", 1000));
    params->setMaxThreads(Tools::SettingsManager::GetSetting_("max_threads", 16));
    params->setThreadPriority(Poco::Thread::PRIO_NORMAL);
}

void Server::initialize(Application& self)
{
    ServerApplication::initialize(self);

    if(use_ssl_)
    {
        auto& config = self.config();
        config.setString("openSSL.server.privateKeyFile", Tools::SettingsManager::GetSetting_("key", "key.pem"));
        config.setString("openSSL.server.certificateFile", Tools::SettingsManager::GetSetting_("certificate", "cert.pem"));
        config.setString("openSSL.server.caConfig", Tools::SettingsManager::GetSetting_("rootcert", ""));
    }
}
    
void Server::uninitialize()
{
    ServerApplication::uninitialize();
}

int Server::main(const std::vector<std::string>&)
{
    auto server_params = new HTTPServerParams;
    SetupParams_(server_params);

    // Setup Socket and Server
    if(use_ssl_)
    {
        SecureServerSocket secure_server_socket(Tools::SettingsManager::GetSetting_("port", 8080));
        http_server_ = std::make_unique<HTTPServer>(handler_factory_, secure_server_socket, server_params);
    }
    else
    {
        ServerSocket server_socket(Tools::SettingsManager::GetSetting_("port", 8080));
        http_server_ = std::make_unique<HTTPServer>(handler_factory_, server_socket, server_params);
    }

    http_server_->start();
    Tools::OutputLogger::Log_(
        "Server started at port " + std::to_string(Tools::SettingsManager::GetSetting_("port", 8080))
        + " (Max threads: " + std::to_string(Tools::SettingsManager::GetSetting_("max_threads", 16))
        + ", Max Queued: " + std::to_string(Tools::SettingsManager::GetSetting_("max_queued", 1000)) + ")"
    );
    
    waitForTerminationRequest();
    
    http_server_->stop();
        
    return Application::EXIT_OK;
}