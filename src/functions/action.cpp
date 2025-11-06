
#include "functions/action.h"
#include <Poco/Nullable.h>

using namespace StructBX;
using namespace StructBX::Functions;

Action::Action(std::string identifier) :
    async_(false)
    ,async_finished_(false)
    ,identifier_(identifier)
    ,status_("OK.")
    ,message_("OK.")
    ,custom_error_("Error in Action")
    ,last_insert_id_(0)
    ,final_(true)
    ,error_(false)
    ,sql_code_("SELECT 1")
    ,final_query_("")
    ,affected_rows_(0)
{
    results_ = std::make_shared<Query::Results>();
    json_result_ = new JSON::Object;
}

Action::~Action()
{
    // The current object will be destroyed when the 
    // asynchronous function finishes executing
    if(async_)
    {
        while(true)
        {
            if(async_finished_)
                break;
        }
    }
}

void Action::ReplaceParamater_(Query::Parameter::Ptr parameter)
{
    // Find if exists parameter
    auto found_param = std::find_if(parameters_.begin(), parameters_.end(), [parameter](Query::Parameter::Ptr& param)
    {
        return param->get_name() == parameter->get_name();
    });

    // Remplace parameter value
    if(found_param != parameters_.end())
    {
        if(!found_param->get()->get_editable()) return;

        found_param->get()->set_value(parameter->get_value());
    }
}

void Action::SetValueToParamater_(Tools::DValue::Ptr value, std::string name)
{
    // Find if exists parameter
    auto found_param = std::find_if(parameters_.begin(), parameters_.end(), [name](Query::Parameter::Ptr& param)
    {
        return param->get_name() == name;
    });

    // Remplace parameter value
    if(found_param != parameters_.end())
    {
        found_param->get()->set_value(value);
    }
}

std::vector<Query::Parameter::Ptr>::iterator Action::GetParameter_(std::string name)
{
    auto found = std::find_if(parameters_.begin(), parameters_.end(), [name](Query::Parameter::Ptr param)
    {
        return param->get_name() == name;
    });

    return found;
}

void Action::SetupCondition_(std::string identifier, Query::ConditionType type, Query::Condition<Action&>::Functor functor)
{
    condition_ = std::make_shared<Query::Condition<Action&>>(identifier, type, functor);
}

Query::Parameter::Ptr Action::AddParameter_(std::string name, std::string value_string, bool editable)
{
    Tools::DValue::Ptr value = std::make_shared<Tools::DValue>(value_string);
    parameters_.push_back(std::make_shared<Query::Parameter>(name, value, editable));
    return parameters_.back();
}

Query::Parameter::Ptr Action::AddParameter_(std::string name, const char* value_string, bool editable)
{
    Tools::DValue::Ptr value = std::make_shared<Tools::DValue>(value_string);
    parameters_.push_back(std::make_shared<Query::Parameter>(name, value, editable));
    return parameters_.back();
}

Query::Parameter::Ptr Action::AddParameter_(std::string name, int value_int, bool editable)
{
    Tools::DValue::Ptr value = std::make_shared<Tools::DValue>(value_int);
    parameters_.push_back(std::make_shared<Query::Parameter>(name, value, editable));
    return parameters_.back();
}

Query::Parameter::Ptr Action::AddParameter_(std::string name, float value_float, bool editable)
{
    Tools::DValue::Ptr value = std::make_shared<Tools::DValue>(value_float);
    parameters_.push_back(std::make_shared<Query::Parameter>(name, value, editable));
    return parameters_.back();
}

Query::Parameter::Ptr Action::AddParameter_(std::string name, bool value_bool, bool editable)
{
    Tools::DValue::Ptr value = std::make_shared<Tools::DValue>(value_bool);
    parameters_.push_back(std::make_shared<Query::Parameter>(name, value, editable));
    return parameters_.back();
}

Query::Parameter::Ptr Action::AddParameter_(std::string name, Tools::DValue::Ptr value, bool editable)
{
    parameters_.push_back(std::make_shared<Query::Parameter>(name, value, editable));
    return parameters_.back();
}

Query::Parameter::Ptr Action::AddParameter_(std::string name, Query::Field::Position field_position, std::string related_action, bool editable)
{
    parameters_.push_back(std::make_shared<Query::Parameter>(name, field_position, related_action, editable));
    return parameters_.back();
}

bool Action::Work_()
{
    Tools::OutputLogger::Debug_("Action " + identifier_);

    // Compose query
    ComposeQuery_();
    if(error_) return false;

    // Execute query
    ExecuteQuery_();
    if(error_) return false;

    // Make results
    MakeResults_();
    if(error_) return false;

    // Get LAST_INSERT_ID
    GetLastInsertID_();
    if(error_) return false;

    // Close session
    session_->close();
    if(error_) return false;
    
    // Verify condition
    if(!VerifyCondition_())
        return false;

    // Create JSON result
    json_result_ = CreateJSONResult_();
    json_result_->set("status", get_status());
    json_result_->set("message", get_message());

    return true;
}

bool Action::ComposeQuery_()
{
    try
    {
        if(error_) {return false;}

        // Initialize de query statement
            if(!InitializeQuery_())
                return false;

        // Set the query
            *query_ << sql_code_;

        // Set the parameters
            for(auto& param : parameters_)
            {
                if(param->get_value()->TypeIsIqual_(Tools::DValue::Type::kEmpty))
                    Tools::OutputLogger::Debug_("Parameter in ComposeQuery_(): " + param->get_name() + ": -- EMPTY VALUE --");
                else if(param->ToString_().size() < 1000)
                    Tools::OutputLogger::Debug_("Parameter in ComposeQuery_(): " + param->get_name() + ": " + param->ToString_());
                else
                    Tools::OutputLogger::Debug_("Parameter in ComposeQuery_(): " + param->get_name() + ": -- BIG STRING --");
                
                // Setup positional parameter
                SetupPositionParameter_(param);

                // Verify Parameter condition
                if(!VerifyParameterCondition_(param))
                    return false;

                // Add final value to query
                switch(param->get_value()->get_type())
                {
                    case Tools::DValue::Type::kEmpty:
                    {
                        Poco::NullType value;
                        *query_ , use(value);
                        break;
                    }
                    case Tools::DValue::Type::kString:
                    {
                        auto& value = param->StringValue_();
                        *query_ , use(value);
                        break;
                    }
                    case Tools::DValue::Type::kInteger:
                    {
                        auto& value = param->IntValue_();
                        *query_ , use(value);
                        break;
                    }
                    case Tools::DValue::Type::kFloat:
                    {
                        auto& value = param->FloatValue_();
                        *query_ , use(value);
                        break;
                    }
                    case Tools::DValue::Type::kBoolean:
                    {
                        auto& value = param->BoolValue_();
                        *query_ , use(value);
                        break;
                    }
                }
            }

        // Return
            Tools::OutputLogger::Debug_("Final query: " + query_->toString());
            return true;
    }
    catch(MySQL::MySQLException& error)
    {
        NotifyError_("Error on action.cpp on ComposeQuery_(): " + std::string(error.message()));
        return false;
    }
    catch(std::runtime_error& error)
    {
        NotifyError_("Error on action.cpp on ComposeQuery_(): " + std::string(error.what()));
        return false;
    }
    catch(std::exception& error)
    {
        NotifyError_("Error on action.cpp on ComposeQuery_(): " + std::string(error.what()));
        return false;
    }
    return false;
}

void Action::ExecuteQuery_()
{
    try
    {
        if(error_)
            return;

        affected_rows_ = query_->execute();
        if(async_) async_finished_ = true;
    }
    catch(Poco::DataException& ce)
    {
        NotifyError_("Error on action.cpp on ExecuteQuery_(): " + std::string(ce.message()));
        return;
    }
    catch(MySQL::MySQLException& error)
    {
        NotifyError_("Error on action.cpp on ExecuteQuery_(): " + std::string(error.message()));
        return;
    }
    catch(std::runtime_error& error)
    {
        NotifyError_("Error on action.cpp on ExecuteQuery_(): " + std::string(error.what()));
        return;
    }
    catch(std::exception& error)
    {
        NotifyError_("Error on action.cpp on ExecuteQuery_(): " + std::string(error.what()));
        return;
    }
}

void Action::ExecuteAsyncQuery_()
{
    try
    {
        if(error_)
            return;

        async_ = true;
        async_finished_ = false;
        std::thread thread_obj(&Action::ExecuteQuery_, this);
        thread_obj.detach();
    }
    catch(MySQL::MySQLException& error)
    {
        NotifyError_("Error on action.cpp on ExecuteAsyncQuery_(): " + std::string(error.message()));
        return;
    }
    catch(std::runtime_error& error)
    {
        NotifyError_("Error on action.cpp on ExecuteAsyncQuery_(): " + std::string(error.what()));
        return;
    }
    catch(std::exception& error)
    {
        NotifyError_("Error on action.cpp on ExecuteAsyncQuery_(): " + std::string(error.what()));
        return;
    }
}

void Action::MakeResults_()
{
    try
    {
        if(error_)
            return;

        mutex_.lock();

        // Variables
            Data::RecordSet results_dataquery(*query_);

        // Default values
            if(query_.get() == nullptr)
            {
                mutex_.unlock();
                return;
            }

        // Make Results
            for(auto& it : results_dataquery)
            {
                Query::Row::Ptr row_fields(new Query::Row);

                std::size_t col = 0;
                for(size_t a = 0; a < it.fieldCount(); a++)
                {
                    auto column_name = results_dataquery.columnName(col);
                    auto value = it.get(a);
                    // Create shared Query::Field
                    row_fields->push_back(std::make_shared<Query::Field>(column_name, Tools::DValue::Ptr(new Tools::DValue(value))));
                    col++;
                }

                get_results()->push_back(std::move(row_fields));
            }

        mutex_.unlock();
    }
    catch(JSON::JSONException& error)
    {
        mutex_.unlock();
        NotifyError_("Error on action.cpp on MakeResults_(): " + std::string(error.message()));
        return;
    }
    catch(std::runtime_error& error)
    {
        mutex_.unlock();
        NotifyError_("Error on action.cpp on MakeResults_(): " + std::string(error.what()));
        return;
    }
    catch(std::exception& error)
    {
        mutex_.unlock();
        NotifyError_("Error on action.cpp on MakeResults_(): " + std::string(error.what()));
        return;
    }

    return;
}

JSON::Object::Ptr Action::CreateJSONResult_()
{
    try
    {
        mutex_.lock();

        // Variables
            JSON::Object::Ptr result_json = new JSON::Object();
            JSON::Array::Ptr columns_array = new JSON::Array();
            JSON::Array::Ptr data_array = new JSON::Array();

        if(error_)
        {
            mutex_.unlock();
            return result_json;
        }
        
        // Make columns array
            if(results_->size() > 0)
            {
                auto first_row = results_->front();
                for(auto field : *first_row)
                {
                    columns_array->set(columns_array->size(), field.get()->get_column_name());
                }
            }

        // Make JSON data
            for(auto& rows : *results_)
            {
                JSON::Object::Ptr row_fields = new JSON::Object();
                
                // Iterate over rows
                for(auto& field : *rows)
                {
                    auto column_name = field->get_column_name();
                    auto& field_value = field->get_value();
                    switch(field->get_value()->get_type())
                    {
                        case Tools::DValue::Type::kBoolean:
                            row_fields->set(column_name, field_value->Bool_());
                            break;
                        case Tools::DValue::Type::kFloat:
                            row_fields->set(column_name, field_value->Float_());
                            break;
                        case Tools::DValue::Type::kInteger:
                            row_fields->set(column_name, field_value->Int_());
                            break;
                        case Tools::DValue::Type::kString:
                            row_fields->set(column_name, field_value->String_());
                            break;
                        case Tools::DValue::Type::kEmpty:
                            row_fields->set(column_name, "");
                            break;
                    }
                }

                data_array->set(data_array->size(), row_fields);
            }

            result_json->set("columns", columns_array);
            result_json->set("data", data_array);

            mutex_.unlock();
            return result_json;
    }
    catch(JSON::JSONException& error)
    {
        mutex_.unlock();
        Tools::OutputLogger::Error_("Error on action.cpp on CreateJSONResult_(): " + std::string(error.message()));
        return JSON::Object::Ptr{};
    }
    catch(std::runtime_error& error)
    {
        mutex_.unlock();
        Tools::OutputLogger::Error_("Error on action.cpp on CreateJSONResult_(): " + std::string(error.what()));
        return JSON::Object::Ptr{};
    }
    catch(std::exception& error)
    {
        mutex_.unlock();
        Tools::OutputLogger::Error_("Error on action.cpp on CreateJSONResult_(): " + std::string(error.what()));
        return JSON::Object::Ptr{};
    }
}

void Action::GetLastInsertID_()
{
    try
    {
        query_ = std::make_shared<Data::Statement>(*session_);
        *query_ << "SELECT LAST_INSERT_ID()";
        ExecuteQuery_();
        if(error_)
            return;

        // Default values
        if(query_.get() == nullptr)
            return;

        // Variables
        Data::RecordSet results_dataquery(*query_);
        auto results = Query::Results::Ptr(new Query::Results());

        // Make Results
        for(auto& it : results_dataquery)
        {
            Query::Row::Ptr row_fields(new Query::Row);

            std::size_t col = 0;
            for(size_t a = 0; a < it.fieldCount(); a++)
            {
                auto column_name = results_dataquery.columnName(col);
                auto value = it.get(a);
                // Create shared Query::Field
                row_fields->push_back(std::make_shared<Query::Field>(column_name, Tools::DValue::Ptr(new Tools::DValue(value))));
                col++;
            }

            results->push_back(std::move(row_fields));
        }

        // Get LastInsertID
        auto id = results->First_();
        if(!id->IsNull_() && id->get_value()->TypeIsIqual_(Tools::DValue::Type::kInteger))
            last_insert_id_ = id->Int_();

    }
    catch(JSON::JSONException& error)
    {
        NotifyError_("Error on action.cpp on GetLastInsertID_(): " + std::string(error.message()));
        return;
    }
    catch(std::runtime_error& error)
    {
        NotifyError_("Error on action.cpp on GetLastInsertID_(): " + std::string(error.what()));
        return;
    }
    catch(std::exception& error)
    {
        NotifyError_("Error on action.cpp on GetLastInsertID_(): " + std::string(error.what()));
        return;
    }
}

void Action::NotifyError_(std::string message)
{
    Tools::OutputLogger::Error_(message);
    set_error(true);
}

bool Action::InitializeQuery_()
{
    try
    {
        session_ = Query::DatabaseManager::StartSessionMySQL_();
        if(session_.get() == nullptr)
        {
            throw MySQL::MySQLException("Error to connect to database server.");
            return false;
        }

        query_ = std::make_shared<Data::Statement>(*session_);
        return true;
    }
    catch(MySQL::MySQLException& error)
    {
        NotifyError_("Error on action.cpp on InitializeQuery_(): " + std::string(error.message()));
        return false;
    }
    catch(std::runtime_error& error)
    {
        NotifyError_("Error on action.cpp on InitializeQuery_(): " + std::string(error.what()));
        return false;
    }
    catch(std::exception& error)
    {
        NotifyError_("Error on action.cpp on InitializeQuery_(): " + std::string(error.what()));
        return false;
    }
    return false;
}

void Action::SetupPositionParameter_(Query::Parameter::Ptr parameter)
{
    if(parameter->get_parameter_type() == Query::ParameterType::kPosition)
    {
        // Find action results
        auto action_found = std::find_if(actions_container_.begin(), actions_container_.end(),[&parameter](Functions::Action::Ptr action)
        {
            return action->get_identifier() == parameter->get_related_action();
        });

        // Set DValue found
        if(action_found != actions_container_.end())
        {
            auto row_value = action_found->get()->get_results()->ExtractField_(parameter->get_field_position());
            if(!row_value->IsNull_())
                parameter->set_value(row_value->get_value());
        }
    }
}

bool Action::VerifyParameterCondition_(Query::Parameter::Ptr parameter)
{
    bool result = true;
    if(parameter->get_condition() == nullptr)
        result = true;
    else if(!parameter->get_condition()->VerifyCondition_(parameter))
    {
        switch(parameter->get_condition()->get_type())
        {
            case Query::ConditionType::kWarning:
            {
                if(parameter->get_error() == "")
                    Tools::OutputLogger::Debug_("Parameter condition warning (Identifier: " + parameter->get_condition()->get_identifier() + ", Parameter name: " + parameter->get_name() + ").");
                else
                    Tools::OutputLogger::Debug_(parameter->get_error());
                result = true;
                break;
            }
            case Query::ConditionType::kError:
            {
                if(parameter->get_error() == "")
                {
                    Tools::OutputLogger::Debug_("Parameter condition error (Identifier: " + parameter->get_condition()->get_identifier() + ", Parameter name: " + parameter->get_name() + ").");
                    set_custom_error("Parameter condition error (Identifier: " + parameter->get_condition()->get_identifier() + ", Parameter name: " + parameter->get_name() + ").");
                }
                else
                {
                    Tools::OutputLogger::Debug_(parameter->get_error());
                    set_custom_error(parameter->get_error());
                }
                error_ = true;
                result = false;
                break;
            }
        }
    }
    return result;
}

bool Action::VerifyCondition_()
{
    bool result = true;
    if(condition_ == nullptr)
        result = true;
    else if(!condition_->VerifyCondition_(*this))
    {
        switch(condition_->get_type())
        {
            case Query::ConditionType::kWarning:
            {
                if(custom_error_ == "")
                    Tools::OutputLogger::Debug_("Action condition warning (Identifier: " + condition_->get_identifier() + ", Action: " + identifier_ + ").");
                else
                    Tools::OutputLogger::Debug_(custom_error_);
                result = true;
                break;
            }
            case Query::ConditionType::kError:
            {
                if(custom_error_ == "")
                {
                    Tools::OutputLogger::Debug_("Action condition error (Identifier: " + condition_->get_identifier() + ", Action: " + identifier_ + ").");
                    set_custom_error("Action condition error (Identifier: " + condition_->get_identifier() + ", Action: " + identifier_ + ").");
                }
                else
                {
                    Tools::OutputLogger::Debug_(custom_error_);
                    set_custom_error(custom_error_);
                }
                error_ = true;
                result = false;
                break;
            }
        }
    }
    return result;
}