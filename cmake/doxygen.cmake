
find_package(Doxygen)

if(DOXYGEN_FOUND)
	set(DOXYGEN_IN ${PROJECT_SOURCE_DIR}/docs/Doxyfile.in)
	set(DOXYGEN_OUT ${PROJECT_BINARY_DIR}/Doxyfile)
	configure_file(${DOXYGEN_IN} ${DOXYGEN_OUT} @ONLY)

	message("Doxygen OK")
else()
	message("Doxygen not found.")
endif()