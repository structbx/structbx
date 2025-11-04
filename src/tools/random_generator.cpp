
#include "tools/random_generator.h"

using namespace StructBX;

Tools::RandomGenerator::RandomGenerator()
{
    generator_.seed(std::chrono::high_resolution_clock::now().time_since_epoch().count());
}

std::string Tools::RandomGenerator::GeneratePassword_(size_t length)
{
    return GenerateString_(length, CHARS_COMPLEX);
}

std::string Tools::RandomGenerator::GenerateAlphanumericID_(size_t length)
{
    return GenerateString_(length, CHARS_ALPHANUMERIC);
}

std::string Tools::RandomGenerator::GenerateNumericID_(size_t length)
{
    return GenerateString_(length, CHARS_NUMERIC);
}

std::string Tools::RandomGenerator::GenerateString_(size_t length, const std::string& character_set)
{
    if (length == 0 || character_set.empty())
        return "";

    std::string random_string(length, ' ');
    size_t set_size = character_set.length();

    std::uniform_int_distribution<> distribution(0, set_size - 1);

    for (size_t i = 0; i < length; ++i)
        random_string[i] = character_set[distribution(generator_)];

    return random_string;
}