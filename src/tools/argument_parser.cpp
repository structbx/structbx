
#include "tools/argument_parser.h"

using namespace StructBX;
using namespace StructBX::Tools;

std::vector<std::string> ArgumentParser::console_parameters_;
std::vector<ArgumentParser::Option> ArgumentParser::options_;
std::map<std::string, std::string> ArgumentParser::parsed_values_;
std::vector<std::string> ArgumentParser::unknown_options_;
bool ArgumentParser::parsed_ = false;

void ArgumentParser::AddOption(const Option& option)
{
    options_.push_back(option);
}

bool ArgumentParser::Parse(int argc, char** argv)
{
    parsed_values_.clear();
    unknown_options_.clear();
    parsed_ = true;

    for (int i = 1; i < argc; ++i)
    {
        std::string arg(argv[i]);

        if (arg.empty())
            continue;

        console_parameters_.push_back(arg);

        std::string name;

        if (arg.substr(0, 2) == "--")
        {
            name = arg.substr(2);
        }
        else if (arg[0] == '-')
        {
            name = arg.substr(1);
        }
        else
        {
            unknown_options_.push_back(arg);
            continue;
        }

        const Option* opt = FindOption_(name);
        if (!opt)
        {
            unknown_options_.push_back(arg);
            continue;
        }

        if (opt->requires_value)
        {
            if (i + 1 < argc)
            {
                std::string value(argv[i + 1]);
                if (!value.empty() && value[0] != '-')
                {
                    parsed_values_[opt->long_name] = value;
                    ++i;
                }
                else
                {
                    parsed_values_[opt->long_name] = opt->default_value;
                }
            }
            else
            {
                parsed_values_[opt->long_name] = opt->default_value;
            }
        }
        else
        {
            parsed_values_[opt->long_name] = "true";
        }
    }

    return unknown_options_.empty();
}

bool ArgumentParser::HasOption(const std::string& name)
{
    auto it = parsed_values_.find(name);
    return it != parsed_values_.end();
}

std::string ArgumentParser::GetOptionValue(const std::string& name, const std::string& default_val)
{
    auto it = parsed_values_.find(name);
    if (it != parsed_values_.end())
        return it->second;

    const Option* opt = FindOption_(name);
    if (opt)
        return opt->default_value;

    return default_val;
}

void ArgumentParser::PrintHelp(const std::string& program_name)
{
    std::cout << "\nUsage: " << program_name << " [OPTIONS]\n";
    std::cout << "StructBX Server - Backend for StructBX application\n";
    std::cout << "\nOptions:\n";

    for (const auto& opt : options_)
    {
        std::string left = "  ";
        if (!opt.long_name.empty())
            left += "--" + opt.long_name;
        if (!opt.short_name.empty())
        {
            if (!opt.long_name.empty())
                left += ", ";
            left += "-" + opt.short_name;
        }
        if (opt.requires_value)
            left += " <value>";

        std::cout << left;
        int pad = 36 - static_cast<int>(left.size());
        if (pad < 2) pad = 2;
        std::cout << std::string(pad, ' ') << opt.description;

        if (!opt.default_value.empty())
            std::cout << " (default: " << opt.default_value << ")";

        std::cout << "\n";
    }

    std::cout << "\nExamples:\n";
    std::cout << "  " << program_name << "\n";
    std::cout << "  " << program_name << " --config /etc/structbx/properties.yaml\n";
    std::cout << "  " << program_name << " --port 9090 --debug\n";
    std::cout << "  " << program_name << " --db-init\n";
    std::cout << "  " << program_name << " --db-update\n";
    std::cout << "  " << program_name << " --help\n";
    std::cout << std::endl;
}

void ArgumentParser::PrintError(const std::string& message)
{
    std::cerr << "Error: " << message << std::endl;
}

std::vector<std::string> ArgumentParser::GetUnknownOptions()
{
    return unknown_options_;
}

std::string ArgumentParser::NormalizeName_(const std::string& name)
{
    std::string result = name;
    while (!result.empty() && result[0] == '-')
        result.erase(result.begin());
    return result;
}

const ArgumentParser::Option* ArgumentParser::FindOption_(const std::string& name)
{
    for (const auto& opt : options_)
    {
        if (opt.long_name == name || opt.short_name == name)
            return &opt;
    }
    return nullptr;
}
