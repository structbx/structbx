# Build security
if(PROJECT_SOURCE_DIR STREQUAL PROJECT_BINARY_DIR)
	message(
		FATAL_ERROR "In-source builds not allowed. Please make a new directory (called a build directory) and run CMake from there."
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
set(CONFIG_OUTPUT_DIR "${CMAKE_BINARY_DIR}/config_files")
set(DOCKER_VOLUME_DIR "${CMAKE_BINARY_DIR}/DockerVolume")
set(UPLOADED_FILES_DIR "${CMAKE_BINARY_DIR}/structbx-web-uploaded")

# Create config directories
file(MAKE_DIRECTORY "${CONFIG_OUTPUT_DIR}")
file(MAKE_DIRECTORY "${DOCKER_VOLUME_DIR}")
file(MAKE_DIRECTORY "${UPLOADED_FILES_DIR}")

# Configure properties.yaml file
if(NOT EXISTS "${CONFIG_OUTPUT_DIR}/properties.yaml")
    message(STATUS "Generating initial configuration file...")
    configure_file(
        "${PROJECT_SOURCE_DIR}/conf/properties.yaml.template"
        "${CONFIG_OUTPUT_DIR}/properties.yaml"
    )
else()
    message(STATUS "properties.yaml exists. Skipping generation.")
endif()

# Configure key and cert files
configure_file(
    "${PROJECT_SOURCE_DIR}/conf/cert.pem.template"
    "${CONFIG_OUTPUT_DIR}/cert.pem"
    COPYONLY
)
configure_file(
    "${PROJECT_SOURCE_DIR}/conf/key.pem.template"
    "${CONFIG_OUTPUT_DIR}/key.pem"
    COPYONLY
)
