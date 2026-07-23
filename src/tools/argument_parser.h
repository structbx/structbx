
#ifndef STRUCTBX_TOOLS_ARGUMENTPARSER
#define STRUCTBX_TOOLS_ARGUMENTPARSER


#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <iomanip>


namespace StructBX
{
    namespace Tools
    {
        class ArgumentParser;
    }
}


class StructBX::Tools::ArgumentParser
{
    public:
        struct Option
        {
            std::string long_name;
            std::string short_name;
            std::string description;
            bool requires_value;
            std::string default_value;
        };

        static std::vector<std::string> get_console_parameters(){ return console_parameters_; }
        static void AddOption(const Option& option);
        static bool Parse(int argc, char** argv);
        static bool HasOption(const std::string& name);
        static std::string GetOptionValue(const std::string& name, const std::string& default_val = "");
        static void PrintHelp(const std::string& program_name);
        static void PrintError(const std::string& message);
        static std::vector<std::string> GetUnknownOptions();

    private:
        static std::vector<std::string> console_parameters_;
        static std::vector<Option> options_;
        static std::map<std::string, std::string> parsed_values_;
        static std::vector<std::string> unknown_options_;
        static bool parsed_;

        static std::string NormalizeName_(const std::string& name);
        static const Option* FindOption_(const std::string& name);
};


#endif // STRUCTBX_TOOLS_ARGUMENTPARSER
