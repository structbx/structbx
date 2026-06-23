
# Use custom Find modules only when Conan is not in use,
# since Conan generates its own <pkg>-config.cmake files
if(NOT EXISTS "${CMAKE_BINARY_DIR}/conan_toolchain.cmake")
    list(APPEND CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake/modules)
    message(STATUS "[StructBX] Using custom Find modules (no Conan detected)")
endif()

# When BUILD_STATIC is ON, force find_library to look for .a files first
if(BUILD_STATIC)
    set(_saved_lib_suffixes ${CMAKE_FIND_LIBRARY_SUFFIXES})
    set(CMAKE_FIND_LIBRARY_SUFFIXES ".a")
    message(STATUS "[StructBX] Searching for static libraries (.a)")
endif()

# Find libmysqlclient
find_package(libmysqlclient REQUIRED)
if(NOT libmysqlclient_FOUND)
    message(FATAL_ERROR "[StructBX] libmysqlclient not found")
endif()
list(APPEND HEADER ${libmysqlclient_INCLUDE_DIRS_RELEASE})

# Find yaml-cpp
find_package(yaml-cpp REQUIRED)
if(NOT yaml-cpp_FOUND)
    message(FATAL_ERROR "[StructBX] yaml-cpp not found")
endif()
list(APPEND HEADER ${yaml-cpp_INCLUDE_DIRS})

# Find Poco
find_package(Poco REQUIRED COMPONENTS Foundation Net NetSSL Util Data DataMySQL JSON)
if(NOT Poco_FOUND)
    message(FATAL_ERROR "[StructBX] Poco not found")
endif()
list(APPEND HEADER ${Poco_INCLUDE_DIRS})

# Restore original library suffixes
if(BUILD_STATIC)
    set(CMAKE_FIND_LIBRARY_SUFFIXES ${_saved_lib_suffixes})
endif()
