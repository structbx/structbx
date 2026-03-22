
#ifndef STRUCTBX_TOOLS_CREDENTIALS
#define STRUCTBX_TOOLS_CREDENTIALS

#include <string>

#include "tools/random_generator.h"

namespace StructBX
{
    namespace Tools
    {
        class Credentials;
    }
}

class StructBX::Tools::Credentials
{
    public:
        Credentials();

        std::string get_user() const { return user_; }
        std::string get_password() const { return password_; }

        void set_user(const std::string& user) { user_ = user; }
        void set_password(const std::string& password) { password_ = password; }

        void GenerateRandomCredentials_(size_t user_length, size_t password_length);

    private:
        std::string user_;
        std::string password_;
};

#endif //STRUCTBX_TOOLS_CREDENTIALS