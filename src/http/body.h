
#ifndef STRUCTBX_HTTP_BODY
#define STRUCTBX_HTTP_BODY


#include <istream>

#include "Poco/StreamCopier.h"
#include "Poco/NullStream.h"
#include "Poco/URI.h"
#include "Poco/Exception.h"
#include <Poco/JSON/Object.h>
#include <Poco/JSON/Array.h>
#include <Poco/Net/NameValueCollection.h>
#include <Poco/Net/MessageHeader.h>
#include <Poco/Net/HTTPServerRequest.h>
#include <Poco/Net/HTMLForm.h>

#include "tools/manage_json.h"
#include "files/file_manager.h"


namespace StructBX
{
    namespace HTTP
    {
        class Body;
    }
}

using namespace Poco;


class StructBX::HTTP::Body : public Tools::ManageJSON
{
    public:
        enum class Type
        {
            kFormMultipart
            ,kFormURLEncoded
            ,kJSON
            ,kURI
        };

        using Ptr = std::shared_ptr<Body>;

        Body();
        ~Body(){}

        Type get_body_type() const { return body_type_; }
        URI::QueryParameters& get_query_parameters()
        {
            auto& var = query_parameters_;
            return var;
        }
        Files::FileManager::Ptr& get_files_parameters()
        {
            auto& var = files_parameters_;
            return var;
        }
        std::shared_ptr<HTMLForm>& get_form()
        {
            auto& var = form_;
            return var;
        }

        void ReadFormMultipart_(Net::HTTPServerRequest& request);
        void ReadFormURLEncoded_(Net::HTTPServerRequest& request);
        void ReadJSON_(std::istream& stream);
        void ReadFromURI_(std::string& uri);

    private:
        Type body_type_;
        URI::QueryParameters query_parameters_;
        Files::FileManager::Ptr files_parameters_;
        std::shared_ptr<HTMLForm> form_;
        
};

#endif // STRUCTBX_HTTP_BODY
