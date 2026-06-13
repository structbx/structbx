
#include "security/user.h"

using namespace StructBX::Security;

User::User() :
    id_("")
    ,username_("")
    ,id_group_("")
    ,type_("default")
    ,status_("")
{

}

User::User(std::string id, std::string username, std::string id_group) :
    id_(id)
    ,username_(username)
    ,id_group_(id_group)
    ,type_("default")
    ,status_("")
{

}
