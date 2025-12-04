
#include "security/user.h"

using namespace StructBX::Security;

User::User() :
    id_(-1)
    ,username_("")
    ,id_group_(-1)
    ,type_("default")
    ,status_("")
{

}

User::User(int id, std::string username, int id_group) :
    id_(id)
    ,username_(username)
    ,id_group_(id_group)
    ,type_("default")
    ,status_("")
{

}
