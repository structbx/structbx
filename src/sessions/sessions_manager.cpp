
#include "sessions/sessions_manager.h"

using namespace StructBX::Sessions;

std::map<std::string, StructBX::Sessions::Session> SessionsManager::sessions_ = {};
std::mutex SessionsManager::mutex_;

SessionsManager::SessionsManager()
{

}

SessionsManager::~SessionsManager()
{

}

void SessionsManager::ReadSessions_()
{
    try
    {
        mutex_.lock();
        // Setting up the action
            Functions::Action action{"SessionsManager::ReadSessions_"};
            action.set_custom_error("Sessions not found.");
            action.set_sql_code("SELECT * FROM sessions WHERE NOW() < created_at + INTERVAL max_age SECOND");

        // Query process
            if(!action.Work_())
            {
                mutex_.unlock();
                Tools::OutputLogger::Error_("Error on sessions_manager.cpp on ReadSessions_(): " + action.get_custom_error());
                return;
            }

            for(auto& row : *action.get_results())
            {
                auto identifier = row->ExtractField_("identifier");
                auto path = row->ExtractField_("path");
                auto id_user = row->ExtractField_("id_user");
                auto max_age = row->ExtractField_("max_age");

                if(identifier->IsNull_() || path->IsNull_() || id_user->IsNull_() || max_age->IsNull_())
                {
                    mutex_.unlock();
                    throw std::runtime_error("Error to get results, ExtractField_ return a nullptr object.");
                    return;
                }

                Sessions::Session new_session;
                new_session.set_id(identifier->String_());
                new_session.set_id_user(id_user->String_());
                new_session.set_path(path->String_());
                new_session.set_max_age(max_age->Int_());

                sessions_.emplace(identifier->String_(), std::move(new_session));

            }
        mutex_.unlock();
    }
    catch(MySQL::MySQLException& error)
    {
        mutex_.unlock();
        Tools::OutputLogger::Error_("Error on sessions_manager.cpp on ReadSessions_(): " + std::string(error.message()));
        return;
    }
    catch(std::exception& error)
    {
        mutex_.unlock();
        Tools::OutputLogger::Error_("Error on sessions_manager.cpp on ReadSessions_(): " + std::string(error.what()));
        return;
    }
}

StructBX::Sessions::Session& SessionsManager::CreateSession_(std::string id_user, std::string path, int max_age)
{
    Sessions::Session new_session;
    new_session.set_id_user(id_user);
    new_session.set_path(path);
    new_session.set_max_age(max_age);

    std::string id;
    while(true)
    {
        id = new_session.get_id();
        if(SessionExists_(id))
            new_session.GenerateNewSessionID_();
        else
            break;
    }

    sessions_.emplace(id, std::move(new_session));

    // Save in DB
    try
    {
        // Setting up the action
            Functions::Action action{""};
            action.set_custom_error("Session not saved.");
            std::string sql_code =
                "INSERT INTO sessions (identifier, path, max_age, id_user) "
                "VALUES (?, ?, ?, ?)"
            ;
            action.set_sql_code(sql_code);
            action.AddParameter_("identifier", id, false);
            action.AddParameter_("path", path, false);
            action.AddParameter_("max_age", max_age, false);
            action.AddParameter_("id_user", id_user, false);

        // Query process
            action.Work_();
    }
    catch(MySQL::MySQLException& error)
    {
        Tools::OutputLogger::Error_("Error on sessions_manager.cpp on CreateSession_(): " + std::string(error.message()));
    }

    return sessions_.at(id);
}

void SessionsManager::DeleteSession_(std::string id)
{
    if(sessions_.find(id) == sessions_.end())
        return;

    sessions_.erase(id);

    try
    {
        // Setting up the action
            Functions::Action action{""};
            action.set_custom_error("Session not saved.");
            action.set_sql_code("DELETE FROM sessions WHERE identifier = ?");
            action.AddParameter_("identifier", id, false);

        // Query process
            action.ComposeQuery_();
            if(action.get_error())
                return;
            action.ExecuteQuery_();
    }
    catch(MySQL::MySQLException& error)
    {
        Tools::OutputLogger::Error_("Error on sessions_manager.cpp on DeleteSession_(): " + std::string(error.message()));
    }
}

bool SessionsManager::SessionExists_(std::string id)
{
    return sessions_.find(id) != sessions_.end();
}
