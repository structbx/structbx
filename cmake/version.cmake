
# Read current version
file(READ ${CMAKE_SOURCE_DIR}/version.txt CURRENT_VERSION)
set(VERSION ${CURRENT_VERSION})

# Extract
string(REGEX MATCH "v([0-9]+)\\.([0-9]+)\\.([0-9]+)" _ ${VERSION})

set(${PROJECT_NAME}_VERSION_MAJOR ${CMAKE_MATCH_1})
set(${PROJECT_NAME}_VERSION_MINOR ${CMAKE_MATCH_2})
set(${PROJECT_NAME}_VERSION_PATCH ${CMAKE_MATCH_3})

# Setting up variables
set(PACKAGE_VERSION "${VERSION}")
set(PACKAGE_VERSION_COMPLETE "${VERSION}")

message(STATUS "Package version: ${PACKAGE_VERSION}")