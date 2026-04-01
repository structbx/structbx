
#ifndef STRUCTBX_SESSIONS_SESSIONSMANAGER
#define STRUCTBX_SESSIONS_SESSIONSMANAGER


#include <string>
#include <map>
#include <mutex>
#include <exception>

#include "Poco/Exception.h"

#include "query/database_manager.h"
#include "sessions/session.h"
#include "functions/action.h"
#include "tools/output_logger.h"
#include "query/parameter.h"
#include "tools/dvalue.h"
#include "tools/settings_manager.h"

namespace StructBX
{
    namespace Sessions
    {
        class SessionsManager;
    }
}


class StructBX::Sessions::SessionsManager
{
    public:
        SessionsManager();
        ~SessionsManager();

        static std::map<std::string, StructBX::Sessions::Session>& get_sessions()
        {
            auto& var = sessions_;
            return var;
        }

        static void ReadSessions_();
        static StructBX::Sessions::Session& CreateSession_(std::string id_user, std::string path, int max_age);
        static void DeleteSession_(std::string id);

    protected:
        static bool SessionExists_(std::string id);

    private:
        static std::mutex mutex_;
        static std::map<std::string, StructBX::Sessions::Session> sessions_;
};

#endif // STRUCTBX_SESSIONS_SESSIONSMANAGER
