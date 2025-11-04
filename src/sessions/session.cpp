
#include "sessions/session.h"
#include "tools/random_generator.h"

using namespace StructBX::Sessions;

Session::Session() :
    id_("")
    ,path_("/")
    ,id_user_(-1)
    ,max_age_(3600)
{
    GenerateNewSessionID_();
}

Session::~Session()
{

}

void Session::GenerateNewSessionID_()
{
    Tools::RandomGenerator random;
    id_ = random.GenerateAlphanumericID_(32);
}