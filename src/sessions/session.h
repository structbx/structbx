
#ifndef STRUCTBX_SESSIONS_SESSION
#define STRUCTBX_SESSIONS_SESSION


#include <string>

#include "Poco/Random.h"
#include <Poco/Net/HTTPCookie.h>
#include <Poco/DateTime.h>
#include "Poco/DigestStream.h"
#include "Poco/MD5Engine.h"

#include "tools/random_generator.h"


namespace StructBX
{
    namespace Sessions
    {
        class Session;
    }
}

using namespace Poco;
using namespace Poco::Net;


class StructBX::Sessions::Session
{
    public:
        Session();
        virtual ~Session();

        std::string get_id() const
        {
            return id_;
        }
        std::string get_path() const
        {
            return path_;
        }
        int get_id_user() const
        {
            return id_user_;
        }
        int get_max_age() const
        {
            return max_age_;
        }
        
        void set_id(std::string id)
        {
            id_ = id;
        }
        void set_path(std::string path)
        {
            path_ = path;
        }
        void set_id_user(int id_user)
        {
            id_user_ = id_user;
        }
        void set_max_age(int max_age)
        {
            max_age_ = max_age;
        }

        void GenerateNewSessionID_();

    private:
        std::string id_;
        std::string path_;
        int id_user_;
        int max_age_;
};


#endif // STRUCTBX_SESSIONS_SESSION
