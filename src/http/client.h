/*
* <one line to give the program's name and a brief idea of what it does.>
* Copyright (C) 2021  <copyright holder> <email>
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

#ifndef STRUCTBX_HTTP_CLIENT
#define STRUCTBX_HTTP_CLIENT


#include <functional>
#include <vector>
#include <optional>

#include "Poco/Net/HTTPSClientSession.h"
#include "Poco/Net/HTTPClientSession.h"
#include "Poco/Net/HTTPRequest.h"
#include "Poco/Net/HTTPResponse.h"
#include "Poco/Net/HTTPCredentials.h"
#include "Poco/Net/AcceptCertificateHandler.h"
#include <Poco/Net/Context.h>
#include <Poco/Net/NetException.h>
#include <Poco/Net/NetSSL.h>
#include <Poco/Net/SSLManager.h>
#include "Poco/StreamCopier.h"
#include "Poco/NullStream.h"
#include "Poco/Path.h"
#include "Poco/URI.h"
#include "Poco/Exception.h"
#include <Poco/JSON/Object.h>
#include <Poco/Net/NameValueCollection.h>
#include <Poco/Net/SSLException.h>

#include "http/methods.h"
#include "http/request.h"
#include "tools/output_logger.h"


namespace StructBX
{
    namespace HTTP
    {
        class Client;
    }
}

using namespace Poco;
using namespace Poco::Net;


class StructBX::HTTP::Client
{
    public:
        using ClientResponseFunction = std::function<void(std::stringstream& response, Net::HTTPRequest& http_request, Net::HTTPResponse& http_response)>;

        Client(std::string uri, const std::string method);

        std::string get_uri() const { return uri_; }
        std::string get_method() const { return method_; }
        std::string get_username() const { return username_; }
        std::string get_password() const { return password_; }
        bool get_use_credentials() const { return use_credentials_; }
        std::vector<HTTP::Header>& get_headers()
        {
            auto& var = headers_;
            return var;
        }
        std::vector<HTTP::Cookie>& get_cookies()
        {
            auto& var = cookies_;
            return var;
        }
        ClientResponseFunction get_response_handler() const { return response_handler_; }

        void set_uri(std::string uri) { uri_ = uri; }
        void set_method(std::string method) { method_ = method; }
        void set_username(std::string username) { username_ = username; }
        void set_password(std::string password) { password_ = password; }
        void set_use_credentials(bool use_credentials) { use_credentials_ = use_credentials; }
        void set_response_handler(ClientResponseFunction response_handler) { response_handler_ = response_handler; }

        void UseCredentials_(std::string username, std::string password);
        void SetupSSL_(std::string key, std::string cert);
        void SetupSSL_(std::string rootcert);
        void AddHeader_(std::string name, std::string value);
        void AddCookie_(std::string name, std::string value);
        void SendHTTPRequest_();
        void SendHTTPSRequest_();

    protected:
        void SetupHeaders_(Net::HTTPRequest& http_request);
        void SetupCookies_(Net::HTTPRequest& http_request);

    private:
        std::string uri_;
        std::string method_;
        std::string username_;
        std::string password_;
        bool use_credentials_;
        std::vector<HTTP::Header> headers_;
        std::vector<HTTP::Cookie> cookies_;
        ClientResponseFunction response_handler_;
        Context::Ptr ssl_context_;
};

#endif // STRUCTBX_HTTP_CLIENT
