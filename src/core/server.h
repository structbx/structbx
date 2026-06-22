
#ifndef STRUCTBX_CORE_SERVER
#define STRUCTBX_CORE_SERVER


#include <Poco/ThreadPool.h>
#include <map>
#include <exception>
#include <vector>
#include <memory>
#include <stdexcept>

#include <Poco/Exception.h>
#include <Poco/Util/ServerApplication.h>
#include <Poco/Net/HTTPServer.h>
#include <Poco/Net/ServerSocket.h>
#include <Poco/Net/SecureServerSocket.h>

#include "core/handler_factory.h"
#include "tools/output_logger.h"
#include "tools/settings_manager.h"

using namespace Poco;
using namespace Poco::Net;
using namespace Poco::Util;

namespace StructBX
{
    namespace Core
    {
        class Server;
    }
}


class StructBX::Core::Server : public Util::ServerApplication
{
    public:
        using Ptr = std::shared_ptr<Server>;

        Server(HandlerFactory* handler_factory);

        bool get_use_ssl() const { return use_ssl_; }

        void set_use_ssl(bool use_ssl){ use_ssl_ = use_ssl; }

        void initialize(Application& self) override;
        void uninitialize() override;
        int main(const std::vector<std::string>& args) override;

    protected:
        void SetupParams_(HTTPServerParams* params);

    private:
        bool use_ssl_;
        std::string server_name_;
        HandlerFactory* handler_factory_;
        std::unique_ptr<HTTPServer> http_server_;
};

#endif // STRUCTBX_CORE_SERVER
