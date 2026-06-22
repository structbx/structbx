
#ifndef STRUCTBX_FUNCTIONS_FUNCTION
#define STRUCTBX_FUNCTIONS_FUNCTION


#include <functional>
#include <string>
#include <vector>
#include <map>
#include <memory>

#include "files/file_manager.h"
#include "functions/action.h"
#include "http/methods.h"
#include "query/parameter.h"
#include "http/request.h"
#include "http/response_manager.h"
#include "security/user.h"
#include "security/users_manager.h"


namespace StructBX
{
    namespace Functions
    {
        class Function;
    }
}


class StructBX::Functions::Function : public HTTP::ResponseManager
{
    public:
        using Ptr = std::shared_ptr<Functions::Function>;

        enum class ResponseType
        {
            kJSON
            ,kFile
            ,kCustom
        };

        Function();
        Function(std::string endpoint, HTTP::EnumMethods method, ResponseType response_type = ResponseType::kJSON);

        std::string get_endpoint() const { return endpoint_; }
        std::string get_target() const { return target_; }
        bool get_error() const { return error_; }
        std::string get_error_message() const { return error_message_; }
        std::string get_error_code() const { return error_code_; }
        bool get_remove_file_on_modify() const { return remove_file_on_modify_; }
        ResponseType get_response_type() const { return response_type_; }
        HTTP::EnumMethods get_method() const { return method_; }
        Security::User& get_current_user()
        {
            auto& var = current_user_;
            return var;
        }
        std::vector<Action::Ptr>& get_actions()
        {
            auto& var = actions_;
            return var;
        }
        HTTP::Methods& get_methods()
        {
            auto& var = methods_;
            return var;
        }
        Files::FileManager::Ptr& get_file_manager()
        {
            auto& var = file_manager_;
            return var;
        }
        std::vector<Query::Parameter::Ptr>& get_parameters()
        {
            auto& var = parameters_;
            return var;
        }
        JSON::Array::Ptr& get_json_array()
        {
            auto& var = json_array_;
            return var;
        }
        JSON::Object::Ptr& get_json_object()
        {
            auto& var = json_object_;
            return var;
        }
        JSON::Array::Ptr& get_data()
        {
            auto& var = data_;
            return var;
        }

        void set_endpoint(std::string endpoint) { endpoint_ = endpoint; }
        void set_target(std::string target) { target_ = target; }
        void set_remove_file_on_modify(bool remove_file_on_modify) { remove_file_on_modify_ = remove_file_on_modify; }
        void set_method(HTTP::EnumMethods type) { method_ = type; }
        void set_response_type(ResponseType response_type) { response_type_ = response_type; }
        void set_json_array(JSON::Array::Ptr json_array) { json_array_ = json_array; }
        void set_json_object(JSON::Object::Ptr json_object) { json_object_ = json_object; }
        void set_data(JSON::Array::Ptr data) { data_ = data; }
        void set_current_user(Security::User user) { current_user_ = user; }

        std::vector<Query::Parameter::Ptr>::iterator  GetParameter_(std::string name);
        Action::Ptr AddAction_(std::string identifier);
        std::vector<Action::Ptr>::iterator GetAction_(std::string identifier);
        void Process_(HTTP::Request::HTTPServerRequestPtr request, HTTP::Request::HTTPServerResponsePtr response);
        bool ProcessAction_(Action::Ptr action);
        bool ProcessJSON_(JSON::Object::Ptr& json_result);
        bool ProcessFile_(std::string& filepath);
        void DownloadProcess_(std::string& filepath);
        void UploadProcess_();
        void ModifyProcess_(std::string& filepath);
        void RemoveProcess_(std::string& filepath);
        void SetupCustomProcess_(std::function<void(Function&)> custom_process);
        void IdentifyParameters_(Functions::Action::Ptr action);
        void IdentifyParameters_(Functions::Action::Ptr action, std::vector<Query::Parameter::Ptr> parameters);

    protected:
        void Setup_(HTTP::Request::HTTPServerRequestPtr request, HTTP::Request::HTTPServerResponsePtr response);

    private:
        std::string endpoint_;
        std::string target_;
        bool error_;
        std::string error_message_;
        std::string error_code_;
        bool remove_file_on_modify_;
        ResponseType response_type_;
        HTTP::EnumMethods method_;
        Security::User current_user_;
        std::vector<Action::Ptr> actions_;
        HTTP::Methods methods_;
        Files::FileManager::Ptr file_manager_;
        std::function<void(Function&)> custom_process_;
        std::vector<Query::Parameter::Ptr> parameters_;
        JSON::Array::Ptr json_array_;
        JSON::Object::Ptr json_object_;
        JSON::Array::Ptr data_;
};


#endif // STRUCTBX_FUNCTIONS_FUNCTION
