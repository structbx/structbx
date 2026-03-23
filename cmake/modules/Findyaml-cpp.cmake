
# --- FIND yaml-cpp  ---

# Find include dirs
find_path(yaml-cpp_INCLUDE_DIRS
	NAMES yaml.h
	PATH_SUFFIXES yaml-cpp
	PATHS /usr/include/yaml-cpp
		/usr/local/include/yaml-cpp
		/opt/yaml-cpp/yaml-cpp/include
		/opt/yaml-cpp/include
		/usr/local/yaml-cpp/include
		/usr/local/yaml-cpp/include/yaml-cpp
)

# Find library dirs
find_library(yaml-cpp_LIBRARIES
	NAMES yaml-cpp
	PATHS /usr/lib/yaml-cpp
    /usr/lib/x86_64-linux-gnu/yaml-cpp
    /usr/local/lib/yaml-cpp
    /usr/local/yaml-cpp/lib
    /usr/local/yaml-cpp/lib/yaml-cpp
    /opt/yaml-cpp/yaml-cpp/lib/yaml-cpp
    /opt/yaml-cpp/lib/yaml-cpp
    /opt/rh/rh-mariadb105/root/usr/lib64
)

# Verify if exists dirs
if(yaml-cpp_INCLUDE_DIRS AND yaml-cpp_LIBRARIES)
  message(STATUS "yaml-cpp Include dir: ${yaml-cpp_INCLUDE_DIRS}")
  message(STATUS "yaml-cpp client libraries: ${yaml-cpp_LIBRARIES}")
elseif(yaml-cpp_FIND_REQUIRED)
	if(NOT yaml-cpp_FOUND)
		message(FATAL_ERROR "Cannot find yaml-cpp. Include dir: ${yaml-cpp_INCLUDE_DIRS}  library dir: ${yaml-cpp_LIBRARIES_DIR}")
	endif()
endif()

include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(yaml-cpp
	DEFAULT_MSG
	yaml-cpp_LIBRARIES
	yaml-cpp_INCLUDE_DIRS
)

# Copy the results to the output variables.
if(NOT TARGET yaml-cpp::yaml-cpp)
	add_library(yaml-cpp::yaml-cpp INTERFACE IMPORTED)
	set_target_properties(yaml-cpp::yaml-cpp PROPERTIES 
		INTERFACE_INCLUDE_DIRECTORIES "${yaml-cpp_INCLUDE_DIRS}"
		INTERFACE_LINK_LIBRARIES "${yaml-cpp_LIBRARIES}"
	)
else()
	set(yaml-cpp_LIBRARIES)
	set(yaml-cpp_INCLUDE_DIRS)
endif()

mark_as_advanced(yaml-cpp_INCLUDE_DIRS yaml-cpp_LIBRARIES)