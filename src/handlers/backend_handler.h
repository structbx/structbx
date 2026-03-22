
#ifndef STRUCTBX_HANDLERS_BACKENDHANDLER
#define STRUCTBX_HANDLERS_BACKENDHANDLER


#include "handlers/root_handler.h"
#include "query/results.h"
#include "tools/function_data.h"
#include "controllers/general/main.h"
#include "controllers/databases/main.h"
#include "controllers/tables/main.h"
#include "controllers/forms/main.h"


namespace StructBX
{
    namespace Handlers
    {
        class BackendHandler;
    }
}


class StructBX::Handlers::BackendHandler : public RootHandler
{
    public:
        using VectorShrResults = std::vector<Query::Results::Ptr>;

        BackendHandler();

        void AddFunctions_();

    protected:
        virtual void Process_() override;
        void AddOpenEndpoints_();
        void ProcessActions_();
        void SetupFunctionData_();
        bool VerifyActiveUser_();

    private:
        Tools::FunctionData function_data_;
        HTTP::Cookie database_id_cookie_;
        bool add_database_id_cookie_;
        std::vector<std::string> open_endpoints_;
};

#endif // STRUCTBX_HANDLERS_BACKENDHANDLER
