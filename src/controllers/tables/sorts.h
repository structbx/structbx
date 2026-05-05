
#ifndef STRUCTBX_CONTROLLERS_TABLES_SORTS_H
#define STRUCTBX_CONTROLLERS_TABLES_SORTS_H

#include <unordered_set>

#include "tools/base_action.h"
#include "tools/function_data.h"

namespace StructBX
{
    namespace Controllers
    {
        namespace Tables
        {
            class Sorts;

            static const std::unordered_set<std::string> valid_sorts = {
                "ASC", "DESC"
            };
        }
    }
}

using namespace StructBX;

class StructBX::Controllers::Tables::Sorts : public Tools::FunctionData
{
    public:
        Sorts(Tools::FunctionData& function_data);

    protected:
        struct Read : public Tools::FunctionData
        {
            Read(Tools::FunctionData& function_data);

            void A1(StructBX::Functions::Action::Ptr action);
        };

    private:
        Read struct_read_;
};

#endif //STRUCTBX_CONTROLLERS_TABLES_SORTS_H