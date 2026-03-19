
#include "functions/function.h"

using namespace StructBX;
using namespace StructBX::Functions;

Function::Function() :
    endpoint_("")
    ,target_("")
    ,error_(false)
    ,error_message_("ERR38HJ95K1NA")
    ,remove_file_on_modify_(true)
    ,response_type_(ResponseType::kJSON)
    ,method_(HTTP::EnumMethods::kHTTP_GET)
    ,file_manager_(new Files::FileManager())
    ,custom_process_([](Function&){})
    ,json_array_(new JSON::Array())
    ,json_object_(new JSON::Object())
    ,data_(new JSON::Array())
{
    
}

Function::Function(std::string endpoint, HTTP::EnumMethods method, ResponseType response_type) :
    endpoint_(endpoint)
    ,target_("")
    ,error_(false)
    ,error_message_("ERR38HJ95K1NA")
    ,remove_file_on_modify_(true)
    ,response_type_(response_type)
    ,method_(method)
    ,file_manager_(new Files::FileManager())
    ,custom_process_([](Function&){})
    ,json_array_(new JSON::Array())
    ,json_object_(new JSON::Object())
    ,data_(new JSON::Array())
{
    
}

std::vector<Query::Parameter::Ptr>::iterator Function::GetParameter_(std::string name)
{
    auto found = std::find_if(parameters_.begin(), parameters_.end(), [&name](Query::Parameter::Ptr parameter)
    {
        return parameter->get_name() == name;
    });

    return found;
}

Action::Ptr Function::AddAction_(std::string identifier)
{
    Action::Ptr action = std::make_shared<Action>(identifier);
    actions_.push_back(action);
    return action;
}

std::vector<Action::Ptr>::iterator Function::GetAction_(std::string identifier)
{
    auto found = std::find_if(actions_.begin(), actions_.end(), [&identifier](Action::Ptr action)
    {
        return action->get_identifier() == identifier;
    });

    return found;
}

void Function::Setup_(HTTP::Request::HTTPServerRequestPtr request, HTTP::Request::HTTPServerResponsePtr response)
{
    if(request.has_value())
        SetupRequest_(*request.value());
    else
    {
        JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error to setup Request in Function");
        return;
    }
    if(response.has_value())
        SetupResponse_(*response.value());
    else
    {
        JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Error to setup Response in Function");
        return;
    }
}

void Function::Process_(HTTP::Request::HTTPServerRequestPtr request, HTTP::Request::HTTPServerResponsePtr response)
{
    bool json_sent = false;

    Tools::OutputLogger::Debug_("Function " + endpoint_);

    try
    {
        Setup_(request, response);

        switch(response_type_)
        {
            case Functions::Function::ResponseType::kJSON:
            {
                JSON::Object::Ptr json_result = new JSON::Object();
                if(!ProcessJSON_(json_result))
                {
                    if(error_)
                    {
                        JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, error_message_);
                        json_sent = true;
                        Tools::OutputLogger::Debug_("Error on function.cpp on Process_(): " + error_message_);
                        return;
                    }
                }

                // Send JSON results
                CompoundResponse_(HTTP::Status::kHTTP_OK, json_result);

                break;
            }
            case Functions::Function::ResponseType::kFile:
            {
                std::string filepath = "";
                if(!ProcessFile_(filepath))
                {
                    if(error_)
                    {
                        JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, error_message_);
                        json_sent = true;
                        Tools::OutputLogger::Debug_("Error on function.cpp on Process_(): " + error_message_);
                        return;
                    }
                }

                switch(method_)
                {
                    case HTTP::EnumMethods::kHTTP_GET:
                        DownloadProcess_(filepath);
                        break;
                    case HTTP::EnumMethods::kHTTP_POST:
                        UploadProcess_();
                        break;
                    case HTTP::EnumMethods::kHTTP_PUT:
                        ModifyProcess_(filepath);
                        break;
                    case HTTP::EnumMethods::kHTTP_DEL:
                        RemoveProcess_(filepath);
                        break;
                    case HTTP::EnumMethods::kHTTP_HEAD:
                    case HTTP::EnumMethods::kHTTP_OPTIONS:
                    case HTTP::EnumMethods::kHTTP_PATCH:
                    case HTTP::EnumMethods::kNULL:
                        JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The client provided a bad HTTP method.");
                        json_sent = true;
                        throw std::runtime_error("Error on function.cpp on Process_(): The client provided a bad HTTP method.");
                        break;
                }
                
                break;
            }
            case Functions::Function::ResponseType::kCustom:
            {
                custom_process_(*this);
                break;
            }
        }
    }
    catch(std::runtime_error& error)
    {
        if(!json_sent)
            JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, error_message_);

        Tools::OutputLogger::Error_("Error on function.cpp on Process_(): " + error_message_);
        return;
    }
    catch(std::exception& error)
    {
        if(!json_sent)
            JSONResponse_(HTTP::Status::kHTTP_BAD_REQUEST, error_message_);

        Tools::OutputLogger::Error_("Error on function.cpp on Process_(): " + error_message_);
        return;
    }
    catch(...)
    {
        if(!json_sent)
            JSONResponse_(HTTP::Status::kHTTP_INTERNAL_SERVER_ERROR, "Unknown error");

        Tools::OutputLogger::Error_("Error on function.cpp on Process_(): Unknown error");
        return;
    }
}

bool Function::ProcessAction_(Action::Ptr action)
{
    // Copy actions references
    action->get_actions_container().clear();
    action->get_actions_container().insert(action->get_actions_container().end(), actions_.begin(), actions_.end());
    
    // Identify parameters
    if(action->get_error())
    {
        error_ = true;
        error_message_ = action->get_custom_error();
        return false;
    }

    // Execute action
    if(!action->Work_())
    {
        error_ = true;
        error_message_ = action->get_custom_error();
        return false;
    }
    return true;
}

bool Function::ProcessJSON_(JSON::Object::Ptr& json_result)
{
    // Process actions of the function
    for(auto& action : actions_)
    {
        // Process Action
        if(!ProcessAction_(action))
        {
            error_ = true;
            return false;
        }

        // Set JSON results
        if(action->get_final())
            json_result = action->get_json_result();
    }

    return true;
}

bool Function::ProcessFile_(std::string& filepath)
{
    // Process actions of the function
    for(auto& action : actions_)
    {
        // Process Action
        if(!ProcessAction_(action))
        {
            error_ = true;
            return false;
        }


        // Set filepath
        if(action->get_final())
        {
            auto field = action->get_results()->First_();
            if(!field->IsNull_())
                filepath = field->String_();
        }
    }

    return true;
}

void Function::DownloadProcess_(std::string& filepath)
{
    // Manage the file
    file_manager_->set_operation_type(Files::OperationType::kDownload);
    file_manager_->get_files().push_back(file_manager_->CreateTempFile_("/" + filepath));
    auto& tmp_file = file_manager_->get_files().front();

    // Check file
    if(!file_manager_->CheckFiles_())
    {
        HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "Requested file bad check.");
        return;
    }

    // Is supported
    if(!file_manager_->IsSupported_(tmp_file))
    {
        HTMLResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Requested file is not supported.");
        return;
    }
    file_manager_->ProcessContentLength_();

    // Reponse
    auto& response = get_http_server_response().value();
    response->setStatus(HTTPResponse::HTTP_OK);
    response->setContentType(tmp_file.get_content_type());
    response->setContentLength(tmp_file.get_content_length());
    
    std::ostream& out_reponse = response->send();

    // Download file
    file_manager_->DownloadFile_(out_reponse);
}

void Function::UploadProcess_()
{
    // Manage the files
    file_manager_->set_operation_type(Files::OperationType::kUpload);

    // Change path
    for(auto& file : file_manager_->get_files())
    {
        if(!file_manager_->ChangePathAndFilename_(file, file_manager_->get_directory_base()))
        {
            HTMLResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The file cannot be processed.");
            return;
        }
    }

    // Verify supported files
    if(!file_manager_->IsSupported_())
    {
        HTMLResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Requested file is not supported.");
        return;
    }

    // Verify max file size
    if(!file_manager_->VerifyMaxFileSize_())
    {
        HTMLResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The requested file exceeds the file size limit.");
        return;
    }

    // Upload file
    file_manager_->UploadFile_();

    // Response
    CompoundFillResponse_(HTTP::Status::kHTTP_OK, file_manager_->get_result(), "Ok.");
}

void Function::ModifyProcess_(std::string& filepath)
{
    if(remove_file_on_modify_)
    {
        // Manage the file
        Files::FileManager tmp_file_manager = Files::FileManager(*file_manager_);
        tmp_file_manager.set_operation_type(Files::OperationType::kDelete);

        tmp_file_manager.get_files().clear();
        tmp_file_manager.get_files().push_back(file_manager_->CreateTempFile_("/" + filepath));

        // Check file
        if(!tmp_file_manager.CheckFiles_())
        {
            HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "Requested file bad check.");
            return;
        }

        // Remove the file
        tmp_file_manager.RemoveFile_();
    }

    // Process new file to upload
    file_manager_->set_operation_type(Files::OperationType::kUpload);
    
    // Change path
    for(auto& file : file_manager_->get_files())
    {
        if(!file_manager_->ChangePathAndFilename_(file, file_manager_->get_directory_base()))
        {
            HTMLResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The file cannot be processed.");
            return;
        }
    }

    // Is supported
    if(!file_manager_->IsSupported_())
    {
        HTMLResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "Requested file is not supported.");
        return;
    }
    
    // Verify max file size
    if(!file_manager_->VerifyMaxFileSize_())
    {
        HTMLResponse_(HTTP::Status::kHTTP_BAD_REQUEST, "The requested file exceeds the file size limit.");
        return;
    }

    // Upload
    file_manager_->UploadFile_();

    // Response
    CompoundFillResponse_(HTTP::Status::kHTTP_OK, file_manager_->get_result(), "Ok.");
}

void Function::RemoveProcess_(std::string& filepath)
{
    // Manage file
    file_manager_->set_operation_type(Files::OperationType::kDelete);
    file_manager_->get_files().push_back(file_manager_->CreateTempFile_("/" + filepath));

    // Basic operations
    if(!file_manager_->CheckFiles_())
    {
        HTMLResponse_(HTTP::Status::kHTTP_NOT_FOUND, "Requested file bad check.");
        return;
    }

    // Remove
    file_manager_->RemoveFile_();
        
    // Response
    JSONResponse_(HTTP::Status::kHTTP_OK, "Ok.");
}

void Function::SetupCustomProcess_(std::function<void(Function&)> custom_process)
{
    custom_process_ = custom_process;
}

void Function::IdentifyParameters_(Functions::Action::Ptr action)
{
    // Iterate over action parameters
    for(auto it : action->get_parameters())
    {
        // Iterate over Function parameters
        for(auto it2 : parameters_)
        {
            if(it2->get_name() == it->get_name() && it->get_editable())
            {
                // Copy function parameter value to action parameter value (Shared)
                it->set_value(it2->get_value());
            }
        }
    }
}

void Function::IdentifyParameters_(Functions::Action::Ptr action, std::vector<Query::Parameter::Ptr> parameters)
{
    // Iterate over action parameters
    for(auto it : action->get_parameters())
    {
        // Iterate over Function parameters
        for(auto it2 : parameters)
        {
            if(it2->get_name() == it->get_name() && it->get_editable())
            {
                // Copy function parameter value to action parameter value (Shared)
                it->set_value(it2->get_value());
            }
        }
    }
}