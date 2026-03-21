
# Install files
include(GNUInstallDirs)

# Install files
install(
    TARGETS structbx-server
    DESTINATION ${CMAKE_INSTALL_BINDIR}
)
install(
    FILES
        "${CONFIG_OUTPUT_DIR}/properties.yaml"
        "${CONFIG_OUTPUT_DIR}/cert.pem"
        "${CONFIG_OUTPUT_DIR}/key.pem"
    DESTINATION ${CMAKE_INSTALL_SYSCONFDIR}/structbx
)