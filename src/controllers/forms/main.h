
#ifndef STRUCTBX_CONTROLLERS_FORMS_MAIN_H
#define STRUCTBX_CONTROLLERS_FORMS_MAIN_H

#include "tools/base_action.h"
#include "tools/function_data.h"
#include "sessions/sessions_manager.h"
#include "http/client.h"
#include "http/methods.h"
#include "tools/credentials.h"


namespace StructBX
{
    namespace Controllers
    {
        namespace Forms
        {
            class Main;
        }
    }
}

using namespace StructBX;


class StructBX::Controllers::Forms::Main : public Tools::FunctionData
{
    public:
        Main(Tools::FunctionData& function_data);

    protected:
        struct VerifyPublicFormEnabled : public Tools::FunctionData
        {
            VerifyPublicFormEnabled(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        
        struct ReadTableSpecific : public Tools::FunctionData
        {
            ReadTableSpecific(Tools::FunctionData& function_data);
        };
        struct ReadColumns : public Tools::FunctionData
        {
            ReadColumns(Tools::FunctionData& function_data);
        };


    private:
        ReadTableSpecific struct_read_table_specific_;
        ReadColumns struct_read_columns_;
};

#endif //STRUCTBX_CONTROLLERS_FORMS_MAIN_H