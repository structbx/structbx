
#ifndef STRUCTBX_HANDLERS_ROOTHANDLER
#define STRUCTBX_HANDLERS_ROOTHANDLER


#include <istream>
#include <string>
#include <list>
#include <map>
#include <vector>
#include <algorithm>
#include <functional>
#include <stdexcept>
#include <memory>

#include "yaml-cpp/yaml.h"
#include "Poco/Exception.h"
#include <Poco/Net/HTTPRequestHandler.h>
#include <Poco/Net/HTTPServerRequest.h>
#include <Poco/Net/HTTPResponse.h>
#include <Poco/Net/HTTPServerResponse.h>
#include <Poco/URI.h>
#include <Poco/StreamCopier.h>
#include "Poco/Data/Session.h"
#include "Poco/Data/MySQL/Connector.h"
#include <Poco/Data/MySQL/MySQLException.h>
#include <Poco/Data/Statement.h>
#include <Poco/Format.h>
#include <Poco/NumberFormatter.h>
#include <Poco/JSON/JSON.h>
#include <Poco/JSON/JSONException.h>
#include <Poco/JSON/Array.h>
#include <Poco/JSON/Object.h>
#include <Poco/JSON/Parser.h>
#include <Poco/Dynamic/Var.h>
#include <Poco/Dynamic/Struct.h>
#include "Poco/Net/HTTPServerRequestImpl.h"
#include "Poco/Net/SecureStreamSocket.h"
#include "Poco/Net/SecureServerSocket.h"
#include "Poco/Net/X509Certificate.h"

#include "structbxConfig.h"
#include "sessions/sessions_manager.h"
#include "query/database_manager.h"
#include "tools/route.h"
#include "http/response_manager.h"
#include "security/security_verification.h" 
#include "tools/manage_json.h"
#include "security/user.h"
#include "functions/functions_manager.h"
#include "functions/action.h"
#include "query/condition.h"
#include "tools/settings_manager.h"
#include "tools/output_logger.h"
#include "http/methods.h"
#include "http/body.h"
#include "tools/hmac_tool.h"
#include "tools/base64_tool.h"


namespace StructBX
{
    namespace Handlers
    {
        class ReferenceContainer;
        class RootHandler;
    }
}

using namespace Poco;
using namespace Poco::Net;
using namespace Poco::Data::Keywords;

using Poco::Data::Session;
using Poco::Data::Statement;


class StructBX::Handlers::RootHandler :
    public HTTPRequestHandler
    ,public HTTP::ResponseManager
    ,public HTTP::Methods
    ,public Security::SecurityVerification
    ,public HTTP::Body
{
    public:
        struct Properties
        {
            std::string method;
            std::string uri;
            std::string content_type;
            Net::NameValueCollection content_type_parameters;
        };

        RootHandler();
        virtual ~RootHandler();

        struct Properties& get_properties()
        {
            auto& var = properties_;
            return var;
        }
        std::shared_ptr<StructBX::Tools::Route>& get_requested_route()
        {
            auto& var = requested_route_;
            return var;
        }
        Functions::FunctionsManager& get_functions_manager()
        {
            auto& var = functions_manager_;
            return var;
        }
        Functions::Function::Ptr& get_current_function()
        {
            auto& var = current_function_;
            return var;
        }

        void set_current_function(Functions::Function::Ptr function) {current_function_ = function; }

        virtual void handleRequest(HTTPServerRequest& request, HTTPServerResponse& response);
        bool SetupSSL_();
        Functions::Function::Ptr AddFunction_(std::string endpoint, HTTP::EnumMethods method);
        virtual void Process_() = 0;
        bool VerifySession_();
        bool VerifyApiKey_();
        bool VerifyPermissions_();
        bool IdentifyRoute_();
        void ManageRequestBody_();
        void IdentifyParameters_();

    protected:
        void SetupProperties_();
        void IdentifyParameters_(std::shared_ptr<Net::HTMLForm> form);
        void IdentifyParameters_(Files::FileManager& files_parameters);
        void IdentifyParameters_(JSON::Array::Ptr json_array);
        void IdentifyParameters_(URI::QueryParameters& query_parameters);

    private:
        struct Properties properties_;
        std::list<std::string> targets_;
        std::shared_ptr<StructBX::Tools::Route> requested_route_;
        Functions::FunctionsManager functions_manager_;
        Functions::Function::Ptr current_function_;
};

#endif // STRUCTBX_HANDLERS_ROOTHANDLER
