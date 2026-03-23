
# --- FIND MYSQL ---

# Find include dirs
find_path(MARIADB_INCLUDE_DIRS
	NAMES mysql.h
	PATH_SUFFIXES mariadb
	PATHS /usr/include/mysql
		/usr/local/include/mysql
		/usr/include/mariadb
		/usr/local/include/mariadb
		/opt/mysql/mysql/include
		/opt/mysql/mysql/include/mysql
		/opt/mysql/include
		/opt/local/include/mysql5
		/usr/local/mysql/include
		/usr/local/mysql/include/mysql
		/usr/local/mariadb/include
		/usr/local/mariadb/include/mariadb
		/opt/rh/rh-mariadb105/root/usr/include
		/opt/rh/rh-mariadb105/root/usr/include/mysql
		$ENV{ProgramFiles}/MySQL/*/include
		$ENV{SystemDrive}/MySQL/*/include
)

find_path(MySQL_INCLUDE_DIRS
	NAMES mysql.h
	PATH_SUFFIXES mysql
	PATHS /usr/include/mysql
		/usr/local/include/mysql
		/usr/include/mariadb
		/usr/local/include/mariadb
		/opt/mysql/mysql/include
		/opt/mysql/mysql/include/mysql
		/opt/mysql/include
		/opt/local/include/mysql5
		/usr/local/mysql/include
		/usr/local/mysql/include/mysql
		/usr/local/mariadb/include
		/usr/local/mariadb/include/mariadb
		/opt/rh/rh-mariadb105/root/usr/include
		/opt/rh/rh-mariadb105/root/usr/include/mysql
		$ENV{ProgramFiles}/MySQL/*/include
		$ENV{SystemDrive}/MySQL/*/include
)

# Set include dirs
if(EXISTS "${MARIADB_INCLUDE_DIRS}/mysql.h")
	set(libmysqlclient_INCLUDE_DIRS_RELEASE ${MARIADB_INCLUDE_DIRS})
elseif(EXISTS "${MySQL_INCLUDE_DIRS}/mysql/mysql.h")
	set(libmysqlclient_INCLUDE_DIRS_RELEASE ${MySQL_INCLUDE_DIRS}/mysql)
endif()

# Find library dirs
find_library(libmysqlclient_LIBRARIES
	NAMES mysqlclient_r mariadbclient mariadb mysqlclient libmysqlclient
	PATHS /usr/lib/mysql
			/usr/lib/mariadb
			/usr/local/lib/mysql
			/usr/local/lib/mariadb
			/usr/local/mysql/lib
			/usr/local/mysql/lib/mysql
			/opt/local/mysql5/lib
			/opt/local/lib/mysql5/mysql
			/opt/mysql/mysql/lib/mysql
			/opt/mysql/lib/mysql
			/opt/rh/rh-mariadb105/root/usr/lib64
			/usr/lib/x86_64-linux-gnu/
)

# Verify if exists directories
if(libmysqlclient_INCLUDE_DIRS_RELEASE AND libmysqlclient_LIBRARIES)
	message(STATUS "libmysqlclient Include dir: ${libmysqlclient_INCLUDE_DIRS_RELEASE}")
	message(STATUS "libmysqlclient client libraries: ${libmysqlclient_LIBRARIES}")
elseif(MySQL_FIND_REQUIRED)
	if(NOT libmysqlclient_FOUND)
		message(STATUS "Cannot find libmysqlclient_LIBRARIES. Include dir: ${libmysqlclient_INCLUDE_DIRS_RELEASE}  library dir: ${libmysqlclient_LIBRARIES}")
	endif()
endif()

include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(libmysqlclient
	DEFAULT_MSG
	libmysqlclient_LIBRARIES
	libmysqlclient_INCLUDE_DIRS_RELEASE
)

# Copy the results to the output variables.
if(NOT TARGET libmysqlclient::libmysqlclient)
	add_library(libmysqlclient::libmysqlclient INTERFACE IMPORTED)
	set_target_properties(libmysqlclient::libmysqlclient PROPERTIES
		INTERFACE_INCLUDE_DIRECTORIES "${libmysqlclient_INCLUDE_DIRS_RELEASE}"
		INTERFACE_LINK_LIBRARIES "${libmysqlclient_LIBRARIES}"
	)
else()
	set(libmysqlclient_LIBRARIES)
	set(libmysqlclient_INCLUDE_DIRS_RELEASE)
endif()

mark_as_advanced(libmysqlclient_INCLUDE_DIRS_RELEASE libmysqlclient_LIBRARIES)