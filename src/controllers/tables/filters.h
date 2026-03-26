
#ifndef STRUCTBX_CONTROLLERS_TABLES_FILTERS_H
#define STRUCTBX_CONTROLLERS_TABLES_FILTERS_H

#include "tools/base_action.h"
#include "tools/function_data.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Tables
        {
            class Filters;
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::Tables::Filters : public Tools::FunctionData
{
    public:
        Filters(Tools::FunctionData& function_data);

    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };
        

    private:
        Read struct_read_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_FILTERS_H