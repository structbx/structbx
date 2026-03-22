
#include "http/response_manager.h"
#include "files/file_manager.h"
#include "http/html_message.h"
#include "http/request.h"

using namespace StructBX::HTTP;

ResponseManager::ResponseManager()
{
    FillResponses_();
}

ResponseManager::~ResponseManager()
{

}

void ResponseManager::CompoundResponse_(HTTP::Status status, JSON::Object::Ptr result_json)
{
    SetupHeaders_();
    SetupCookies_();
    get_http_server_response().value()->setStatus(responses_.find(status)->second.http_status);
    get_http_server_response().value()->setContentType("application/json");
    get_http_server_response().value()->setChunkedTransferEncoding(true);

    std::ostream& out = get_http_server_response().value()->send();
    result_json->stringify(out);
}
void ResponseManager::CompoundFillResponse_(HTTP::Status status, JSON::Object::Ptr result_json, std::string message)
{
    SetupHeaders_();
    SetupCookies_();
    get_http_server_response().value()->setStatus(responses_.find(status)->second.http_status);
    get_http_server_response().value()->setContentType("application/json");
    get_http_server_response().value()->setChunkedTransferEncoding(true);

    FillStatusMessage_(result_json, status, message);
    std::ostream& out = get_http_server_response().value()->send();
    result_json->stringify(out);
}

void ResponseManager::JSONResponse_(HTTP::Status status, std::string message)
{
    SetupHeaders_();
    SetupCookies_();
    get_http_server_response().value()->setStatus(responses_.find(status)->second.http_status);
    get_http_server_response().value()->setContentType("application/json");
    get_http_server_response().value()->setChunkedTransferEncoding(true);

    JSON::Object::Ptr object_json = new JSON::Object;

    FillStatusMessage_(object_json, status, message);

    std::ostream& out = get_http_server_response().value()->send();
    object_json->stringify(out);
}

void ResponseManager::HTMLResponse_(HTTP::Status status, std::string message)
{
    SetupHeaders_();
    SetupCookies_();
    get_http_server_response().value()->setStatus(responses_.find(status)->second.http_status);
    get_http_server_response().value()->setContentType("text/html");
    get_http_server_response().value()->setChunkedTransferEncoding(true);

    std::ostream& out = get_http_server_response().value()->send();

    auto found = responses_.find(status);
    if(found != responses_.end())
    {
        out << HTTP::HTMLMessage(std::to_string(responses_.find(status)->second.status_int), responses_.find(status)->second.message, message);
    }
    else
    {
        out << HTTP::HTMLMessage(std::to_string(responses_.find(status)->second.status_int), responses_.find(status)->second.message, message);
    }
}

void ResponseManager::CustomHTMLResponse_(HTTP::Status status, std::string html_message)
{
    SetupHeaders_();
    SetupCookies_();
    get_http_server_response().value()->setStatus(responses_.find(status)->second.http_status);
    get_http_server_response().value()->setContentType("text/html");
    get_http_server_response().value()->setContentLength(html_message.length());

    std::ostream& out = get_http_server_response().value()->send();
    out << html_message;
}

void ResponseManager::CustomResponse_(HTTP::Status status, std::string message, std::string content_type)
{
    SetupHeaders_();
    SetupCookies_();
    get_http_server_response().value()->setStatus(responses_.find(status)->second.http_status);
    get_http_server_response().value()->setContentType(content_type);
    get_http_server_response().value()->setContentLength(message.length());

    std::ostream& out = get_http_server_response().value()->send();
    out << message;
}

void ResponseManager::FileResponse_(HTTP::Status status, std::string address)
{
    SetupHeaders_();
    SetupCookies_();
    
    // Manage the file
        Files::FileManager file_manager(Files::OperationType::kDownload);
        file_manager.get_files().push_back(file_manager.CreateTempFileFromAddress_(address));
        auto tmp_file = file_manager.get_files().front();

    // Check file
        if(!file_manager.CheckFiles_())
        {
            HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "Requested file bad check.");
            return;
        }
        file_manager.AddBasicSupportedFiles_();
        if(!file_manager.IsSupported_())
        {
            HTMLResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Requested file is not supported.");
            return;
        }
        
    // Reponse
        get_http_server_response().value()->setStatus(responses_.find(status)->second.http_status);
        get_http_server_response().value()->setContentType(file_manager.get_files().front().get_content_type());
        get_http_server_response().value()->setChunkedTransferEncoding(true);
        std::ostream& out_reponse = get_http_server_response().value()->send();

    // Download file
        file_manager.DownloadFile_(out_reponse);
}

void ResponseManager::FileResponse_(HTTP::Status status, std::string address, Files::FileManager& file_manager)
{
    SetupHeaders_();
    SetupCookies_();

    // Manage the file
        file_manager.get_files().push_back(file_manager.CreateTempFileFromAddress_(address));
        auto tmp_file = file_manager.get_files().front();

    // Check file
        if(!file_manager.CheckFiles_())
        {
            HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "Requested file bad check.");
            return;
        }
        file_manager.AddBasicSupportedFiles_();
        if(!file_manager.IsSupported_())
        {
            HTMLResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Requested file is not supported.");
            return;
        }
        
    // Reponse
        get_http_server_response().value()->setStatus(responses_.find(status)->second.http_status);
        get_http_server_response().value()->setContentType(file_manager.get_files().front().get_content_type());
        get_http_server_response().value()->setChunkedTransferEncoding(true);
        std::ostream& out_reponse = get_http_server_response().value()->send();

    // Download file
        file_manager.DownloadFile_(out_reponse);
}

void ResponseManager::FillResponses_()
{
    responses_.emplace(std::make_pair(Status::kHTTP_OK, Attributes{HTTPResponse::HTTP_OK, 200,ResponseType::kSuccess, "Ok"}));
    responses_.emplace(std::make_pair(Status::kHTTP_BAD_REQUEST, Attributes{HTTPResponse::HTTP_BAD_REQUEST, 400, ResponseType::kWarning, "Client-side input fails validation"}));
    responses_.emplace(std::make_pair(Status::kHTTP_UNAUTHORIZED, Attributes{HTTPResponse::HTTP_UNAUTHORIZED, 401, ResponseType::kWarning, "The user isn’t not authorized to access to this resource"}));
    responses_.emplace(std::make_pair(Status::kHTTP_FORBIDDEN, Attributes{HTTPResponse::HTTP_FORBIDDEN, 403, ResponseType::kWarning, "The user is not allowed to access to this resource"}));
    responses_.emplace(std::make_pair(Status::kHTTP_NOT_FOUND, Attributes{HTTPResponse::HTTP_NOT_FOUND, 404, ResponseType::kInformation, "Resource is not found"}));
    responses_.emplace(std::make_pair(Status::kHTTP_INTERNAL_SERVER_ERROR, Attributes{HTTPResponse::HTTP_INTERNAL_SERVER_ERROR, 500, ResponseType::kError, "Something was wrong"}));
    responses_.emplace(std::make_pair(Status::kHTTP_BAD_GATEWAY, Attributes{HTTPResponse::HTTP_BAD_GATEWAY, 502, ResponseType::kError, "Invalid response from an upstream server"}));
    responses_.emplace(std::make_pair(Status::kHTTP_SERVICE_UNAVAILABLE, Attributes{HTTPResponse::HTTP_SERVICE_UNAVAILABLE, 503, ResponseType::kError, "Something unexpected happened on server side"}));
}

void ResponseManager::FillStatusMessage_(JSON::Object::Ptr json_object, HTTP::Status status, std::string message)
{
    auto found = responses_.find(status);
    if(found != responses_.end())
    {
        json_object->set("status", responses_.find(status)->second.message);
        json_object->set("message", message);
    }
    else
    {
        json_object->set("status", responses_.find(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR)->second.message);
        json_object->set("message", "Error on HTTPStatus");
    }
}
