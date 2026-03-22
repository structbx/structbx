

#ifndef STRUCTBX_CONTROLLERS_VERIFICATIONS
#define STRUCTBX_CONTROLLERS_VERIFICATIONS

#include <list>

#include "functions/function.h"
#include "tools/function_data.h"

namespace StructBX
{
    namespace Controllers
    {
        class Verifications;
    }
}

using namespace StructBX;

class Controllers::Verifications : public Tools::FunctionData
{
    public:
        struct UserInDatabase : public Tools::FunctionData
        {
            UserInDatabase(Tools::FunctionData& function_data);

            Functions::Action::Ptr action;
        };

        Verifications(Tools::FunctionData& function_data);

        UserInDatabase& get_user_in_database()
        {
            return user_in_database_;
        }
    
    private:
        UserInDatabase user_in_database_;
};

#endif //STRUCTBX_CONTROLLERS_VERIFICATIONS