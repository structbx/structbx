
#ifndef STRUCTBX_CORE_CORE
#define STRUCTBX_CORE_CORE


#include <string>
#include <iostream>
#include <memory>
#include <exception>

#include <Poco/Net/ServerSocket.h>
#include <Poco/Net/HTTPServer.h>
#include <Poco/Net/HTTPServerParams.h>
#include <Poco/Net/NetSSL.h>
#include <Poco/Format.h>
#include <Poco/Exception.h>
#include <Poco/Net/SecureStreamSocket.h>
#include <Poco/Net/SecureServerSocket.h>
#include <Poco/Net/X509Certificate.h>
#include <Poco/Net/SSLManager.h>
#include <Poco/Net/SSLException.h>
#include <Poco/Net/KeyConsoleHandler.h>
#include <Poco/Net/AcceptCertificateHandler.h>
#include <Poco/Net/ConsoleCertificateHandler.h>
#include <Poco/Crypto/RSAKey.h>
#include <Poco/Net/AcceptCertificateHandler.h>
#include <Poco/Net/Context.h>
#include <Poco/Net/NetException.h>
#include <Poco/Net/NetSSL.h>
#include <Poco/Net/SSLManager.h>

#include "core/server.h"
#include "core/handler_factory.h"
#include "query/database_manager.h"
#include "tools/settings_manager.h"
#include "tools/output_logger.h"
#include "sessions/sessions_manager.h"
#include "security/permissions_manager.h"


namespace StructBX
{
    namespace Core
    {
        class Core;
    }
}

using namespace Poco;
using namespace Poco::Net;
using namespace Poco::Util;

class StructBX::Core::Core
{
    public:
        Core();
        virtual ~Core();

        bool get_use_ssl() const { return use_ssl_; }
        bool get_no_ssl() const { return no_ssl_; }
        Server::Ptr get_server() const { return server_; }
        HandlerFactory* get_handler_factory()
        {
            return handler_factory_;
        }

        void set_no_ssl(bool val) { no_ssl_ = val; }

        int Init_();
        void SetupSettings_();

    protected:
        void AddBasicSettings_();
        bool SetupOutputLog();
        bool SetupUploadedDir();

    private:
        bool use_ssl_;
        bool no_ssl_;
        Server::Ptr server_;
        HandlerFactory* handler_factory_;
};

#endif // STRUCTBX_CORE_CORE
