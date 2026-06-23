# Build security
if(PROJECT_SOURCE_DIR STREQUAL PROJECT_BINARY_DIR)
	message(
		FATAL_ERROR "[StructBX] In-source builds not allowed. Please make a new directory (called a build directory) and run CMake from there."
	)
endif()

# Language standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Build type
if(NOT CMAKE_BUILD_TYPE)
	set(CMAKE_BUILD_TYPE Release)
endif()

# Compiler options
if (CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
	set(CMAKE_CXX_FLAGS_DEBUG "-g -O0 -Wall -Wextra")
elseif (CMAKE_CXX_COMPILER_ID STREQUAL "Clang")
	set(CMAKE_CXX_FLAGS_DEBUG "-g -O0 -Wall -Wextra -fstandalone-debug")
else()
	set(CMAKE_CXX_FLAGS_DEBUG "-g -O0 -Wall -Wextra")
endif()
set(CMAKE_CXX_FLAGS_RELEASE "-O3")
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Module and Prefix Path
list(APPEND CMAKE_MODULE_PATH ${CMAKE_BINARY_DIR})
list(APPEND CMAKE_PREFIX_PATH ${CMAKE_BINARY_DIR})

# Setting up header
set(HEADER ${PROJECT_SOURCE_DIR}/src)
list(APPEND HEADER ${PROJECT_BINARY_DIR})

# Variables for build directories and config files
set(PROJECT_PWD "${CMAKE_SOURCE_DIR}")
set(CONFIG_OUTPUT_DIR "${CMAKE_BINARY_DIR}/config-files")
set(DOCKER_VOLUME_DIR "${CMAKE_BINARY_DIR}/docker-volume")
set(UPLOADED_FILES_DIR "${CMAKE_BINARY_DIR}/structbx-web-uploaded")

# Create config directories
file(MAKE_DIRECTORY "${CONFIG_OUTPUT_DIR}")
file(MAKE_DIRECTORY "${DOCKER_VOLUME_DIR}")
file(MAKE_DIRECTORY "${UPLOADED_FILES_DIR}")

# Configure properties.yaml file (development)
if(NOT EXISTS "${CONFIG_OUTPUT_DIR}/properties.yaml")
    message(STATUS "[StructBX] Generating config-files/properties.yaml file...")
    configure_file(
        "${PROJECT_SOURCE_DIR}/conf/properties-dev.yaml.template"
        "${CONFIG_OUTPUT_DIR}/properties.yaml"
    )
else()
    message(STATUS "[StructBX] config-files/properties.yaml exists. Skipping generation.")
endif()

# Configure properties.yaml file (Docker)
if(NOT EXISTS "${DOCKER_VOLUME_DIR}/properties.yaml")
    message(STATUS "[StructBX] Generating docker-volume/properties.yaml file...")
    configure_file(
        "${PROJECT_SOURCE_DIR}/conf/properties.yaml.template"
        "${DOCKER_VOLUME_DIR}/properties.yaml"
        COPYONLY
    )
else()
    message(STATUS "[StructBX] docker-volume/properties.yaml exists. Skipping generation.")
endif()

# Configure key and cert files
configure_file("${PROJECT_SOURCE_DIR}/conf/cert.pem.template" "${CONFIG_OUTPUT_DIR}/cert.pem" COPYONLY)
configure_file("${PROJECT_SOURCE_DIR}/conf/cert.pem.template" "${DOCKER_VOLUME_DIR}/cert.pem" COPYONLY)
configure_file("${PROJECT_SOURCE_DIR}/conf/key.pem.template" "${CONFIG_OUTPUT_DIR}/key.pem" COPYONLY)
configure_file("${PROJECT_SOURCE_DIR}/conf/key.pem.template" "${DOCKER_VOLUME_DIR}/key.pem" COPYONLY)

# Static linking option (default ON for portable builds)
option(BUILD_STATIC "Build a fully statically-linked binary" ON)

if(BUILD_STATIC)
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -static-libgcc -static-libstdc++")
    message(STATUS "[StructBX] Static linking enabled")
endif()
