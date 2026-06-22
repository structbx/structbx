
#ifndef STRUCTBX_HTTP_RESPONSEMANAGER
#define STRUCTBX_HTTP_RESPONSEMANAGER


#include <string>
#include <map>

#include <Poco/Net/HTTPServerResponse.h>
#include <Poco/JSON/JSON.h>
#include <Poco/JSON/Object.h>

#include "structbxConfig.h"
#include "files/file_manager.h"
#include "http/request.h"
#include "http/html_message.h"


namespace StructBX
{
    namespace HTTP
    {
        enum class ResponseType;
        enum class Status;
        class ResponseManager;
    }
}

using namespace Poco;
using namespace Poco::Net;


enum class StructBX::HTTP::ResponseType
{
    kError
    ,kWarning
    ,kInformation
    ,kSuccess
};

enum class StructBX::HTTP::Status
{
    kHTTP_OK = 200
    ,kHTTP_BAD_REQUEST = 400
    ,kHTTP_UNAUTHORIZED = 401
    ,kHTTP_FORBIDDEN = 403
    ,kHTTP_NOT_FOUND = 404
    ,kHTTP_INTERNAL_SERVER_ERROR = 500
    ,kHTTP_BAD_GATEWAY = 502
    ,kHTTP_SERVICE_UNAVAILABLE = 503
};

class StructBX::HTTP::ResponseManager : public HTTP::Request
{
    public:
        struct Attributes
        {
            HTTPResponse::HTTPStatus http_status;
            int status_int;
            ResponseType response_type;
            std::string message;
        };

        ResponseManager();
        ~ResponseManager();

        std::map<HTTP::Status, Attributes>& get_responses_()
        {
            auto& var = responses_;
            return var;
        }

        void CompoundResponse_(HTTP::Status status, JSON::Object::Ptr result_json);
        void CompoundFillResponse_(HTTP::Status status, JSON::Object::Ptr result_json, std::string message, std::string error_code = "");
        void JSONResponse_(HTTP::Status status, std::string message, std::string error_code = "");
        void HTMLResponse_(HTTP::Status status, std::string message);
        void CustomHTMLResponse_(HTTP::Status status, std::string html_message);
        void CustomResponse_(HTTP::Status status, std::string message, std::string content_type);
        void FileResponse_(HTTP::Status status, std::string address);
        void FileResponse_(HTTP::Status status, std::string address, Files::FileManager& file_manager);

    protected:
        void FillResponses_();
        void FillStatusMessage_(JSON::Object::Ptr json_object, HTTP::Status status, std::string message, std::string error_code = "");

    private:
        std::map<HTTP::Status, Attributes> responses_;
};

#endif // STRUCTBX_HTTP_RESPONSEMANAGER
