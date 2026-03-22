$(function()
{
    // Verify Session
    let verify_session = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Request
        new wtools.Request(server_config.current.api + "/auth/login", "POST").Exec_((response_data) =>
        {
            if(response_data.status != 200)
            {
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/login/";
                return;
            }

            wait.Off_();
        });
    };
    verify_session();

    // Elements]
    new Sidebars().SidebarMenuDatabase_();
    new Headers().Header_();
    new Footers().Footer_();
    new wtools.MenuManager('#menu_main', true);

    // Read current database
    const databases_read_id = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_database_modify .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Get Form identifier
        const database_identifier = wtools.GetUrlSearchParam('identifier');
        if(database_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la base de datos.');
            return;
        }

        // Request
        new wtools.Request(server_config.current.api + `/databases/read/id?identifier=${database_identifier}`).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '#component_database_modify .notifications', 'Bases de datos: Modificar');
            if(!result.Verify_())
                return;
            
            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('WARNING', '#component_database_modify .notifications').Show_('No se pudo acceder a la informaci&oacute;n general de la base de datos.');
                return;
            }

            $('.database_target_name').html(response_data.body.data[0].name);
            $('#component_database_modify input[name="identifier"]').val(response_data.body.data[0].identifier);
            $('#component_database_modify input[name="name"]').val(response_data.body.data[0].name);
            $('#component_database_modify textarea[name="description"]').val(response_data.body.data[0].description);

            wait.Off_();
        });
    };
    databases_read_id();
    
    // Modify database
    $('#component_database_modify form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_database_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_database_modify .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_database_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_database_modify form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/databases/modify", "PUT", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_database_modify .notifications', 'Bases de datos: Modificar');
            if(!result.Verify_())
                return;
            
            const database_identifier = data.get('identifier');
            new wtools.Notification('SUCCESS').Show_('Base de datos modificada exitosamente.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = `/database?identifier=${database_identifier}`;
        });
    });

    // Read database to Delete
    $(document).on("click", '#component_database_delete .delete', (e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Form data
        const identifier = $('#component_database_modify input[name="identifier"]').val();
        const name = $('#component_database_modify input[name="name"]').val();

        // Setup form to delete
        $('#component_database_delete_final input[name=identifier]').val(identifier);
        $('#component_database_delete_final strong.header').html(name);
        $('#component_database_delete_final strong.name').html(name);
        $('#component_database_delete_final .notifications').html('');
        $('#component_database_delete_final').modal('show');
        wait.Off_();
    });

    // Delete database
    $('#component_database_delete_final form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_database_delete_final form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Data
        const database_id = $('#component_database_delete_final input[name=id]').val();

        // Request
        new wtools.Request(server_config.current.api + `/databases/delete?identifier=${database_id}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();

            // Manage error
            const result = new ResponseManager(response_data, '#component_database_delete_final .notifications', 'Bases de datos: Eliminar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Base de datos eliminada exitosamente.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = `/start`
        });
    });

    hide_elements_without_permission();
});