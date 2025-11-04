
#ifndef STRUCTBX_TOOLS_RANDOMGENERATOR
#define STRUCTBX_TOOLS_RANDOMGENERATOR

#include <iostream>
#include <string>
#include <random>
#include <algorithm>
#include <chrono>


namespace StructBX
{
    namespace Tools
    {
        class RandomGenerator;
    }
}

class StructBX::Tools::RandomGenerator
{
    public:
        RandomGenerator();

        std::string GeneratePassword_(size_t length);
        std::string GenerateAlphanumericID_(size_t length);
        std::string GenerateNumericID_(size_t length);

    private:
        std::string GenerateString_(size_t length, const std::string& character_set);

        std::mt19937 generator_;

        const std::string CHARS_ALPHANUMERIC = 
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        
        const std::string CHARS_NUMERIC = 
            "0123456789";

        const std::string CHARS_COMPLEX = 
            CHARS_ALPHANUMERIC + "!@#$%^&*()-_+=[]{}|;:,.<>?/`~";
};

#endif //STRUCTBX_TOOLS_RANDOMGENERATOR