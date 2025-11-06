
#ifndef STRUCTBX_FUNCTIONS_ACTION
#define STRUCTBX_FUNCTIONS_ACTION


#include <string>
#include <vector>
#include <memory>
#include <array>
#include <map>
#include <stdexcept>
#include <vector>
#include <thread>

#include "Poco/JSON/Object.h"
#include <Poco/Net/HTTPServerRequest.h>
#include "Poco/Data/Session.h"
#include "Poco/Data/MySQL/Connector.h"
#include <Poco/Data/MySQL/MySQLException.h>
#include <Poco/Data/Statement.h>
#include <Poco/URI.h>
#include <Poco/StreamCopier.h>
#include <Poco/JSON/JSON.h>
#include <Poco/JSON/JSONException.h>
#include <Poco/JSON/Array.h>
#include <Poco/JSON/Object.h>
#include <Poco/JSON/Parser.h>
#include <Poco/Dynamic/Var.h>
#include <Poco/Dynamic/Struct.h>
#include <Poco/Data/RecordSet.h>
#include <Poco/Net/HTMLForm.h>

#include "query/database_manager.h"
#include "tools/settings_manager.h"
#include "query/results.h"
#include "query/parameter.h"
#include "query/condition.h"
#include "tools/manage_json.h"
#include "tools/output_logger.h"
#include "tools/dvalue.h"
#include "files/file_manager.h"


namespace StructBX
{
    namespace Functions
    {
        class Action;
    }
}

using namespace Poco;
using namespace Poco::Net;
using namespace Poco::Data;
using namespace Poco::Data::Keywords;


class StructBX::Functions::Action
{
    public:
        using Ptr = std::shared_ptr<Action>;

        Action(std::string identifier);
        virtual ~Action();

        std::string get_identifier() const { return identifier_; };
        std::string get_status() const { return status_; };
        std::string get_message() const { return message_; };
        std::string get_custom_error() const { return custom_error_; };
        int get_last_insert_id() const { return last_insert_id_; };
        bool get_final() const { return final_; };
        bool get_error() const { return error_; };
        std::vector<Query::Parameter::Ptr>& get_parameters()
        {
            auto& var = parameters_;
            return var;
        }
        Query::Condition<Action&>::Ptr get_condition()
        {
            auto& var = condition_;
            return var;
        }
        Query::Results::Ptr get_results()
        {
            auto& var = results_;
            return var;
        }
        JSON::Object::Ptr get_json_result()
        {
            auto& var = json_result_;
            return var;
        }
        std::vector<Ptr>& get_actions_container()
        {
            auto& var = actions_container_;
            return var;
        }
        std::string get_sql_code() const { return sql_code_; };
        std::string get_final_query() const {return final_query_;}
        int get_affected_rows_() const {return affected_rows_;}
        std::shared_ptr<Data::Session>& get_session()
        {
            auto& var = session_;
            return var;
        }
        std::shared_ptr<Data::Statement>& get_query()
        {
            auto& var = query_;
            return var;
        }

        void set_identifier(std::string identifier) { identifier_ = identifier; };
        void set_status(std::string status) { status_ = status; };
        void set_message(std::string message) { message_ = message; };
        void set_custom_error(std::string custom_error) { custom_error_ = custom_error; };
        void set_final(bool final) { final_ = final; };
        void set_error(bool error) { error_ = error; };
        void set_sql_code(std::string sql_code) { sql_code_ = sql_code; };
        void set_final_query(std::string final_query) {final_query_ = final_query;}

        void ReplaceParamater_(Query::Parameter::Ptr parameter);
        void SetValueToParamater_(Tools::DValue::Ptr value, std::string name);
        std::vector<Query::Parameter::Ptr>::iterator GetParameter_(std::string name);
        Query::Parameter::Ptr AddParameter_(std::string name, std::string value_string, bool editable);
        Query::Parameter::Ptr AddParameter_(std::string name, const char* value_string, bool editable);
        Query::Parameter::Ptr AddParameter_(std::string name, int value_int, bool editable);
        Query::Parameter::Ptr AddParameter_(std::string name, float value_float, bool editable);
        Query::Parameter::Ptr AddParameter_(std::string name, bool value_bool, bool editable);
        Query::Parameter::Ptr AddParameter_(std::string name, Tools::DValue::Ptr value, bool editable);
        Query::Parameter::Ptr AddParameter_(std::string name, Query::Field::Position field_position, std::string related_action, bool editable);
        void SetupCondition_(std::string identifier, Query::ConditionType type, Query::Condition<Action&>::Functor functor);
        bool ComposeQuery_();
        void ExecuteQuery_();
        void ExecuteAsyncQuery_();
        void MakeResults_();
        JSON::Object::Ptr CreateJSONResult_();
        virtual bool Work_();

    protected:
        void GetLastInsertID_();
        void NotifyError_(std::string message);
        void SetupPositionParameter_(Query::Parameter::Ptr parameter);
        bool VerifyParameterCondition_(Query::Parameter::Ptr parameter);
        bool VerifyCondition_();

    private:
        bool InitializeQuery_();

        bool async_;
        bool async_finished_;
        std::string identifier_;
        std::string status_;
        std::string message_;
        std::string custom_error_;
        int last_insert_id_;
        bool final_;
        bool error_;
        std::vector<Query::Parameter::Ptr> parameters_;
        Query::Condition<Action&>::Ptr condition_;
        std::shared_ptr<Query::Results> results_;
        JSON::Object::Ptr json_result_;
        std::vector<Ptr> actions_container_;
        std::string sql_code_;
        std::string final_query_;
        int affected_rows_;
        std::shared_ptr<Data::Session> session_;
        std::shared_ptr<Data::Statement> query_;
        std::mutex mutex_;
        
};

#endif // STRUCTBX_FUNCTIONS_ACTION
