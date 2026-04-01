
#ifndef STRUCTBX_SECURITY_USER
#define STRUCTBX_SECURITY_USER


#include <string>


namespace StructBX
{
    namespace Security
    {
        class User;
    }
}


class StructBX::Security::User
{
    public:
        User();
        User(std::string id, std::string username, std::string id_group);

        std::string get_id() const { return id_; }
        std::string get_username() const { return username_; }
        std::string get_id_group() const { return id_group_; }
        std::string get_type() const { return type_; }
        std::string get_status() const { return status_; }

        void set_id(std::string id) { id_ = id; }
        void set_username(std::string username) { username_ = username; }
        void set_id_group(std::string id_group) { id_group_ = id_group; }
        void set_type(std::string type) { type_ = type; }
        void set_status(std::string status) { status_ = status; }

    private:
        std::string id_;
        std::string username_;
        std::string id_group_;
        std::string type_;
        std::string status_;
};


#endif // STRUCTBX_SECURITY_USER
