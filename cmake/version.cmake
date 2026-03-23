
# Automatic versioning logic
execute_process(
    COMMAND git describe --tags --always --dirty
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE GIT_VERSION
    ERROR_QUIET
    OUTPUT_STRIP_TRAILING_WHITESPACE
)

# If git command fails, set a default version
if(NOT GIT_VERSION)
    set(GIT_VERSION "v0.0.0-unknown")
endif()

message(STATUS "[StructBX] Compilation version: ${GIT_VERSION}")

# Create a header file with this variable
configure_file(${PROJECT_SOURCE_DIR}/cmake/config.h.cmake structbxConfig.h)
