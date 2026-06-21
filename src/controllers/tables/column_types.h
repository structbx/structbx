
#ifndef STRUCTBX_CONTROLLERS_TABLES_COLUMN_TYPES_H
#define STRUCTBX_CONTROLLERS_TABLES_COLUMN_TYPES_H

#include <string_view>

namespace StructBX::Controllers::Tables::ColumnType
{
    inline constexpr std::string_view Text = "text";
    inline constexpr std::string_view LongText = "long-text";
    inline constexpr std::string_view IntNumber = "int-number";
    inline constexpr std::string_view DecimalNumber = "decimal-number";
    inline constexpr std::string_view Date = "date";
    inline constexpr std::string_view Time = "time";
    inline constexpr std::string_view File = "file";
    inline constexpr std::string_view Image = "image";
    inline constexpr std::string_view Selection = "selection";
    inline constexpr std::string_view User = "user";
    inline constexpr std::string_view CurrentUser = "current-user";
    inline constexpr std::string_view CreatedDate = "created-date";
    inline constexpr std::string_view UpdatedDate = "updated-date";
}

#endif
