$(function()
{
    // SELECT options
    let options_endpoints_out = new wtools.SelectOptions();
    const options_endpoints_out_init = (options, callback) => 
    {
        // Data
        const id_group = $('#component_permissions_read select[name=id_group]').val();

        new wtools.Request(server_config.current.api + `/general/permissions/out/read?id_group=${id_group}`).Exec_((response_data) =>
        {
            try
            {
                let tmp_options = [];
                if(response_data.body.data.length < 1)
                    tmp_options.push(new wtools.OptionValue("", "No hay endpoints disponibles."));

                for(let row of response_data.body.data)
                    tmp_options.push(new wtools.OptionValue(row.endpoint, row.title));

                options.options = tmp_options;
                options.Build_('#component_permissions_add select[name="endpoint"]');
                callback();
            }
            catch(error)
            {
                new wtools.Notification('WARNING').Show_('No se pudo acceder a los endpoints.');
                new wtools.Notification('WARNING', 0, '#component_permissions_add .notifications').Show_('No se pudo acceder a los endpoints.');
            }
        });
    };

    const options_actions = new wtools.SelectOptions
    ([
        new wtools.OptionValue("GET", "Leer", true)
        ,new wtools.OptionValue("POST", "A&ntilde;adir")
        ,new wtools.OptionValue("PUT", "Modificar")
        ,new wtools.OptionValue("DEL", "Borrar")
    ]);
    options_actions.Build_('#component_permissions_add select[name="action"]');

    let options_id_group = new wtools.SelectOptions();
    const options_id_group_init = (options, callback) => new wtools.Request(server_config.current.api + "/general/groups/read").Exec_((response_data) =>
    {
        try
        {
            let tmp_options = [];
            for(let row of response_data.body.data)
                tmp_options.push(new wtools.OptionValue(row.id, row.group));

            options.options = tmp_options;
            options.Build_('#component_permissions_read select[name="id_group"]');
            callback();
        }
        catch(error)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder a grupos.');
            new wtools.Notification('WARNING', 0, '#component_permissions_add .notifications').Show_('No se pudo acceder a grupos.');
        }
    });

    // Read Permissions
    const permissions_read = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_permissions_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Data
        const id_group = $('#component_permissions_read select[name=id_group]').val();

        // Request
        new wtools.Request(server_config.current.api + `/general/permissions/read?id_group=${id_group}`).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_permissions_read .notifications', 'Permisos: Leer');
            if(!result.Verify_())
                return;
            
            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                $('#component_permissions_read table tbody').html('');
                $('#component_permissions_read .notifications').html('');
                new wtools.Notification('SUCCESS', 0, '#component_permissions_read .notifications').Show_('Sin resultados.');
                return;
            }

            // Results elements creator
            $('#component_permissions_read .notifications').html('');
            $('#component_permissions_read table tbody').html('');
            new wtools.UIElementsCreator('#component_permissions_read table tbody', response_data.body.data).Build_((row) =>
            {
                let elements = [
                    ,`<th scope="row">${row.id}</th>`
                    ,`<td scope="row">${row.title}</td>`
                    ,`<td scope="row">${options_actions.ValueToOption_(row.action)}</td>`
                    ,`<td scope="row">${row.created_at}</td>`
                ];

                return new wtools.UIElementsPackage(`<tr permission-id="${row.id}"></tr>`, elements).Pack_();
            });
        });
    };
    options_id_group_init(options_id_group, permissions_read);

    // Change id group
    $('#component_permissions_read select[name=id_group]').change(() => permissions_read());
    
    // Click on Add Permission button
    $('#component_permissions_read .add').click(() => 
    {
        options_endpoints_out_init(options_endpoints_out, function()
        {
            // Data
            const id_group = $('#component_permissions_read select[name=id_group]').val();
            $('#component_permissions_add input[name=id_group]').val(id_group);
    
            $('#component_permissions_add').modal('show');
        });
    });

    // Add Permission
    $('#component_permissions_add form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_permissions_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_permissions_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_permissions_add .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_permissions_add form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/general/permissions/add", "POST", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_permissions_add .notifications', 'Permisos: A&ntilde;adir');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Permiso agregado exitosamente.');
            permissions_read();
            wtools.CleanForm($('#component_permissions_add form'));
            $('#component_permissions_add').modal('hide');
        });
    });

    // Read permission to Delete
    $(document).on("click", '#component_permissions_read table tbody tr', (e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Get ID
        let id = $(e.currentTarget).attr('permission-id');
        if(id == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de permiso.');
            return;
        }

        // Setup data to delete
        $('#component_permissions_delete input[name=id]').val(id);
        $('#component_permissions_delete strong.value').html(id);
        $('#component_permissions_delete').modal('show');
        wait.Off_();
    });
    
    // Delete permission
    $('#component_permissions_delete form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_permissions_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Data
        const id = $('#component_permissions_delete input[name=id]').val();

        // Request
        new wtools.Request(server_config.current.api + `/general/permissions/delete?id=${id}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_permissions_delete .notifications', 'Permisos: Eliminar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Permiso eliminado.');
            $('#component_permissions_delete').modal('hide');
            permissions_read();
        });
    });
    
});