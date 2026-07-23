
# Dependencies
set(LIB_DEPENDECIES
    Poco::Foundation
    Poco::Net
    Poco::NetSSL
    Poco::Util
    Poco::Data
    Poco::DataMySQL
    Poco::JSON
    yaml-cpp::yaml-cpp
)

# Static builds need explicit system library dependencies
# since .a files don't carry transitive dependency info
if(BUILD_STATIC)
    find_package(OpenSSL REQUIRED)
    find_package(ZLIB REQUIRED)
    list(APPEND LIB_DEPENDECIES
        OpenSSL::SSL
        OpenSSL::Crypto
        ZLIB::ZLIB
        pthread
        dl
        rt
    )
    message(STATUS "[StructBX] Added system libraries for static linking")
endif()

# Header
set(HEADER
    ${PROJECT_BINARY_DIR}
    ${PROJECT_SOURCE_DIR}/src
)

# Sources
set(
    SOURCES
    ${PROJECT_SOURCE_DIR}/src/structbx-server.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/general/general.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/general/users.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/general/groups.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/general/permissions.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/databases/databases.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/databases/users.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/tables/tables.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/tables/data.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/tables/columns.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/tables/permissions.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/tables/row_policy.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/tables/views.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/tables/filters.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/tables/sorts.cpp
    ${PROJECT_SOURCE_DIR}/src/controllers/forms/forms.cpp
    ${PROJECT_SOURCE_DIR}/src/core/core.cpp
    ${PROJECT_SOURCE_DIR}/src/core/handler_factory.cpp
    ${PROJECT_SOURCE_DIR}/src/core/server.cpp
    ${PROJECT_SOURCE_DIR}/src/files/file_manager.cpp
    ${PROJECT_SOURCE_DIR}/src/files/file_properties.cpp
    ${PROJECT_SOURCE_DIR}/src/files/file.cpp
    ${PROJECT_SOURCE_DIR}/src/functions/action.cpp
    ${PROJECT_SOURCE_DIR}/src/functions/function.cpp
    ${PROJECT_SOURCE_DIR}/src/functions/functions_manager.cpp
    ${PROJECT_SOURCE_DIR}/src/handlers/backend_handler.cpp
    ${PROJECT_SOURCE_DIR}/src/handlers/web_handler.cpp
    ${PROJECT_SOURCE_DIR}/src/handlers/login_handler.cpp
    ${PROJECT_SOURCE_DIR}/src/handlers/null_handler.cpp
    ${PROJECT_SOURCE_DIR}/src/handlers/root_handler.cpp
    ${PROJECT_SOURCE_DIR}/src/http/body.cpp
    ${PROJECT_SOURCE_DIR}/src/http/client.cpp
    ${PROJECT_SOURCE_DIR}/src/http/response_manager.cpp
    ${PROJECT_SOURCE_DIR}/src/http/html_message.cpp
    ${PROJECT_SOURCE_DIR}/src/http/methods.cpp
    ${PROJECT_SOURCE_DIR}/src/http/request.cpp
    ${PROJECT_SOURCE_DIR}/src/query/condition.cpp
    ${PROJECT_SOURCE_DIR}/src/query/database_manager.cpp
    ${PROJECT_SOURCE_DIR}/src/query/schema_initializer.cpp
    ${PROJECT_SOURCE_DIR}/src/query/field.cpp
    ${PROJECT_SOURCE_DIR}/src/query/parameter.cpp
    ${PROJECT_SOURCE_DIR}/src/query/results.cpp
    ${PROJECT_SOURCE_DIR}/src/query/row.cpp
    ${PROJECT_SOURCE_DIR}/src/security/permission.cpp
    ${PROJECT_SOURCE_DIR}/src/security/permissions_manager.cpp
    ${PROJECT_SOURCE_DIR}/src/security/security_verification.cpp
    ${PROJECT_SOURCE_DIR}/src/security/user.cpp
    ${PROJECT_SOURCE_DIR}/src/security/users_manager.cpp
    ${PROJECT_SOURCE_DIR}/src/security/permission.cpp
    ${PROJECT_SOURCE_DIR}/src/sessions/session.cpp
    ${PROJECT_SOURCE_DIR}/src/sessions/sessions_manager.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/dvalue.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/hmac_tool.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/id_checker.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/manage_json.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/output_logger.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/route.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/hmac_tool.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/base64_tool.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/settings_manager.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/id_checker.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/random_generator.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/credentials.cpp
    ${PROJECT_SOURCE_DIR}/src/tools/argument_parser.cpp
)

# Executable
add_executable(structbx-server ${SOURCES}) 
target_link_libraries(structbx-server PUBLIC ${LIB_DEPENDECIES})
target_include_directories(structbx-server PUBLIC ${HEADER})
