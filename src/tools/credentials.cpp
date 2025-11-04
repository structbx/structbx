
#include "credentials.h"

using namespace StructBX;

Tools::Credentials::Credentials()
    : user_("")
    , password_("")
{
}

void Tools::Credentials::GenerateRandomCredentials_(size_t user_length, size_t password_length)
{
    Tools::RandomGenerator random_generator;
    user_ = random_generator.GenerateAlphanumericID_(user_length);
    password_ = random_generator.GeneratePassword_(password_length);
}