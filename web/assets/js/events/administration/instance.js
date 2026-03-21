$(function()
{
    // Read Instance name
    const instance_name_read = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_instance_name_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        new wtools.Request(server_config.current.api + `/general/instanceName/read`).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_instance_name_read .notifications', 'Nombre de instancia: Leer');
            if(!result.Verify_())
                return;
            
            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('WARNING', '#component_instance_name_read .notifications').Show_('No se pudo acceder al nombre de la instancia.');
                return;
            }

            $('#component_instance_name_read input[name="name"]').val(response_data.body.data[0].value);
        });
    };
    instance_name_read();
    
    // Modify instance name
    $('#component_instance_name_read form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_instance_name_read form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_instance_name_read .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_instance_name_read .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_instance_name_read form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/general/instanceName/modify", "PUT", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_instance_name_read .notifications', 'Nombre de instancia: Modificar');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Nombre de instancia modificada exitosamente.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            location.reload();
        });
    });

    // Modify instance logo
    $('#component_instance_logo_read form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_instance_logo_read form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_instance_logo_read .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_instance_logo_read .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_instance_logo_read form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/general/instanceLogo/modify", "PUT", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_instance_logo_read .notifications', 'Logo de instancia: Modificar');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Logo de instancia modificada exitosamente.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            location.reload();
        });
    });
    
});