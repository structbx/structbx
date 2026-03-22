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

#include "http/client.h"
#include <Poco/Net/HTMLForm.h>

using namespace StructBX::HTTP;

Client::Client(std::string uri, const std::string method) :
    uri_(uri)
    ,method_(method)
    ,username_("")
    ,password_("")
    ,use_credentials_(false)
    ,ssl_context_(nullptr)
    ,form_(HTMLForm::ENCODING_URL)
{
    auto params = Context::Params();
    params.verificationMode = Context::VerificationMode::VERIFY_NONE;
    ssl_context_ = new Context(Context::Usage::TLS_CLIENT_USE, params);
}

void Client::UseCredentials_(std::string username, std::string password)
{
    username_ = username;
    password_ = password;
}

void Client::SetupSSL_(std::string key, std::string cert)
{
    ssl_context_ = new Context(Context::TLS_CLIENT_USE, key, cert, "", Context::VERIFY_NONE, 9, true, "ALL:!ADH:!LOW:!EXP:!MD5:@STRENGTH");
}

void Client::SetupSSL_(std::string rootcert)
{
    ssl_context_ = new Context(Context::TLS_CLIENT_USE, "", "", rootcert, Context::VERIFY_NONE, 9, true, "ALL:!ADH:!LOW:!EXP:!MD5:@STRENGTH");
}

void Client::AddHeader_(std::string name, std::string value)
{
    headers_.push_back(HTTP::Header{name, value});
}

void Client::AddCookie_(std::string name, std::string value)
{
    cookies_.push_back(HTTP::Cookie{name, value});
}

void Client::SendHTTPRequest_()
{
	try
	{
		URI uri(uri_);
		std::string path(uri.getPathAndQuery());
		if (path.empty()) path = "/";

		Net::HTTPClientSession session(uri.getHost(), uri.getPort());
		Net::HTTPRequest http_request(method_, path, HTTPMessage::HTTP_1_1);
        SetupHeaders_(http_request);
        SetupCookies_(http_request);

		Net::HTTPResponse http_response;

        if(use_credentials_)
        {
            Net::HTTPCredentials credentials(username_, password_);
            credentials.authenticate(http_request, http_response);
        }

        if (form_.size() > 0 && (method_ == Net::HTTPRequest::HTTP_POST || method_ == Net::HTTPRequest::HTTP_PUT))
        {
            form_.prepareSubmit(http_request);
            http_request.setContentLength(form_.calculateContentLength());

            std::ostream& os = session.sendRequest(http_request);
            form_.write(os);
        }
        else
        {
            session.sendRequest(http_request);
        }
        
        std::istream& is = session.receiveResponse(http_response);
        std::stringstream ss;
		StreamCopier::copyStream(is, ss);
        response_handler_(ss, http_request, http_response);
	}
	catch (Exception& exc)
	{
		Tools::OutputLogger::Error_(exc.displayText());
		return;
	}
}

void Client::SendHTTPSRequest_()
{
	try
	{
        Net::initializeSSL();
		URI uri(uri_);
		std::string path(uri.getPathAndQuery());
		if (path.empty()) path = "/";

		Net::HTTPSClientSession session(uri.getHost(), uri.getPort(), ssl_context_);
		Net::HTTPRequest http_request(method_, path, HTTPMessage::HTTP_1_1);
        SetupHeaders_(http_request);
        SetupCookies_(http_request);
        
		Net::HTTPResponse http_response;

        if(use_credentials_)
        {
            Net::HTTPCredentials credentials(username_, password_);
            credentials.authenticate(http_request, http_response);
        }

        if (form_.size() > 0 && (method_ == Net::HTTPRequest::HTTP_POST || method_ == Net::HTTPRequest::HTTP_PUT))
        {
            form_.prepareSubmit(http_request);
            http_request.setContentLength(form_.calculateContentLength());

            std::ostream& os = session.sendRequest(http_request);
            form_.write(os);
        }
        else
        {
            session.sendRequest(http_request);
        }
        
        std::istream& is = session.receiveResponse(http_response);
        std::stringstream ss;
		StreamCopier::copyStream(is, ss);
        response_handler_(ss, http_request, http_response);

        Net::uninitializeSSL();
	}
	catch (SSLException& exc)
	{
		Tools::OutputLogger::Error_(exc.displayText());
		return;
	}
	catch (Exception& exc)
	{
		Tools::OutputLogger::Error_(exc.displayText());
		return;
	}
}

void Client::SetupHeaders_(Net::HTTPRequest& http_request)
{
    for(auto& header : headers_)
        http_request.add(header.name, header.value);
}

void Client::SetupCookies_(Net::HTTPRequest& http_request)
{
    NameValueCollection poco_cookies;
    for(auto& cookie : cookies_)
        poco_cookies.add(cookie.name, cookie.value);

    http_request.setCookies(poco_cookies);
}