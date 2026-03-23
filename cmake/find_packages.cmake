
# Add CMake modules
if(CMAKE_BUILD_TYPE STREQUAL "Release")
    list(APPEND CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake/modules)
endif()

# Find libmysqlclient
find_package(libmysqlclient REQUIRED)
if(NOT libmysqlclient_FOUND)
    message(FATAL_ERROR "libmysqlclient not found")
endif()
list(APPEND HEADER ${libmysqlclient_INCLUDE_DIRS_RELEASE})

# Find yaml-cpp
find_package(yaml-cpp REQUIRED)
if(NOT yaml-cpp_FOUND)
    message(FATAL_ERROR "yaml-cpp not found")
endif()
list(APPEND HEADER ${yaml-cpp_INCLUDE_DIRS})

# Find Poco
find_package(Poco REQUIRED COMPONENTS Foundation Net NetSSL Util Data DataMySQL JSON)
if(NOT Poco_FOUND)
    message(FATAL_ERROR "Poco not found")
endif()
list(APPEND HEADER ${Poco_INCLUDE_DIRS})
