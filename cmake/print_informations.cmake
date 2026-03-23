# Information Summary

## project info
message(STATUS "")
message(STATUS "[StructBX] PROJECT_NAME:                 ${PROJECT_NAME}")
message(STATUS "[StructBX] PROJECT_FULL_NAME:            ${PROJECT_FULL_NAME}")
message(STATUS "[StructBX] GIT_VERSION:                  ${GIT_VERSION}")
message(STATUS "[StructBX] PROJECT_SOURCE_DIR:           ${PROJECT_SOURCE_DIR}")
message(STATUS "[StructBX] PROJECT_BINARY_DIR:           ${PROJECT_BINARY_DIR}")

## cmake info
message(STATUS "")
message(STATUS "[StructBX] CMAKE_BUILD_TYPE:             ${CMAKE_BUILD_TYPE}")
message(STATUS "[StructBX] CMAKE_INSTALL_PREFIX:         ${CMAKE_INSTALL_PREFIX}")
message(STATUS "[StructBX] CMAKE_SYSTEM_NAME:            ${CMAKE_SYSTEM_NAME}")
message(STATUS "[StructBX] CMAKE_SYSTEM_VERSION:         ${CMAKE_SYSTEM_VERSION}")
message(STATUS "[StructBX] CMAKE_SYSTEM_PROCESSOR:       ${CMAKE_SYSTEM_PROCESSOR}")
message(STATUS "[StructBX] CMAKE_CXX_COMPILER:           ${CMAKE_CXX_COMPILER}")
message(STATUS "[StructBX] CMAKE_CXX_COMPILER_ID:        ${CMAKE_CXX_COMPILER_ID}")
message(STATUS "[StructBX] CMAKE_CXX_COMPILER_VERSION:   ${CMAKE_CXX_COMPILER_VERSION}")
message(STATUS "[StructBX] CMAKE_MAKE_PROGRAM:           ${CMAKE_MAKE_PROGRAM}")
message(STATUS "[StructBX] CMAKE_MODULE_PATH:            ${CMAKE_MODULE_PATH}")
message(STATUS "[StructBX] CMAKE_PREFIX_PATH:            ${CMAKE_PREFIX_PATH}")

## Win32 info
if(WIN32)
	message(STATUS "")
	message(STATUS "[StructBX] Win32 info.")
	message(STATUS "[StructBX] HAVE_MINGW64:             ${HAVE_MINGW64}")
	message(STATUS "[StructBX] MINGW_PATH:               ${MINGW_PATH}")
	message(STATUS "[StructBX] MINGW_ARCH:               ${MINGW_ARCH}")
	message(STATUS "[StructBX] MINGW_ARCH_PATH:          ${MINGW_ARCH_PATH}")
endif()
