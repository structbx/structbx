

#ifndef STRUCTBX_TOOLS_FUNCTIONDATA
#define STRUCTBX_TOOLS_FUNCTIONDATA

#include <list>

#include "functions/function.h"
#include "security/user.h"
#include "tools/dvalue.h"
#include "tools/hmac_tool.h"
#include "tools/base64_tool.h"

#include "tools/id_checker.h"

namespace StructBX
{
    namespace Tools
    {
        class FunctionData;
    }
}

using namespace StructBX;

class StructBX::Tools::FunctionData
{
    public:
        using FunctionsList = std::shared_ptr<std::list<StructBX::Functions::Function::Ptr>>;

        FunctionData() :
            id_user_("")
            ,database_id_("")
        {
            functions_ = std::make_shared<std::list<StructBX::Functions::Function::Ptr>>();
        }
        FunctionData(FunctionData& function_data) :
            id_user_(function_data.get_id_user())
            ,database_id_(function_data.get_database_id())
            ,functions_(function_data.get_functions())
            ,current_user_(function_data.get_current_user())
        {
            
        }

        std::string get_id_user(){ return id_user_; }
        std::string get_database_id(){ return database_id_; }
        FunctionsList& get_functions()
        {
            auto& var = functions_;
            return var;
        }
        Security::User& get_current_user()
        {
            auto& var = current_user_;
            return var;
        }

        void set_id_user(std::string id_user){ id_user_ = id_user; }
        void set_database_id(std::string database_id){ database_id_ = database_id; }
        void set_functions(FunctionsList functions){ functions_ = functions; }
        void set_current_user(Security::User current_user){ current_user_ = current_user; }

    private:
        std::string id_user_;
        std::string database_id_;
        FunctionsList functions_;
        Security::User current_user_;
};

#endif //STRUCTBX_TOOLS_FUNCTIONDATA