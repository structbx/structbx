$(function()
{
    // SELECT options
    const options_status = new wtools.SelectOptions
    ([
        new wtools.OptionValue("active", "Activo", true)
        ,new wtools.OptionValue("inactive", "Inactivo")
    ]);
    options_status.Build_('#component_users_add select[name="status"]');
    options_status.Build_('#component_users_modify select[name="status"]');

    let options_id_group = new wtools.SelectOptions();
    const options_id_group_init = (options, callback) => new wtools.Request(server_config.current.api + "/general/groups/read").Exec_((response_data) =>
    {
        try
        {
            let tmp_options = [];
            for(let row of response_data.body.data)
                tmp_options.push(new wtools.OptionValue(row.id, row.group));

            options.options = tmp_options;
            options.Build_('#component_users_add select[name="id_group"]');
            options.Build_('#component_users_modify select[name="id_group"]');
            callback();
        }
        catch(error)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder a grupos.');
            new wtools.Notification('WARNING', 0, '#component_users_add .notifications').Show_('No se pudo acceder a grupos.');
            new wtools.Notification('WARNING', 0, '#component_users_modify .notifications').Show_('No se pudo acceder a grupos.');
        }
    });
    options_id_group_init(options_id_group, () => {})

    // Read Users
    const users_read = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_users_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        new wtools.Request(server_config.current.api + `/general/users/read`).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_users_read .notifications', 'Usuarios: Leer');
            if(!result.Verify_())
                return;
            
            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('WARNING', '#component_users_read .notifications').Show_('No se pudo acceder a los usuarios.');
                return;
            }

            // Results elements creator
            $('#component_users_read .notifications').html('');
            $('#component_users_read table tbody').html('');
            new wtools.UIElementsCreator('#component_users_read table tbody', response_data.body.data).Build_((row) =>
            {
                let elements = [
                    ,`<td scope="row">${row.username}</td>`
                    ,`<td scope="row">${options_status.ValueToOption_(row.status)}</td>`
                    ,`<td scope="row">${row.group}</td>`
                    ,`<td scope="row">${row.created_at}</td>`
                ];

                return new wtools.UIElementsPackage(`<tr user-id="${row.id}"></tr>`, elements).Pack_();
            });
        });
    };
    users_read();
    
    // Read Current User
    const users_read_current = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_my_account_general .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        new wtools.Request(server_config.current.api + `/general/users/current/read`).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_my_account_general .notifications', 'Usuario actual: Leer');
            if(!result.Verify_())
                return;
            
            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('WARNING', '#component_my_account_general .notifications').Show_('No se pudo acceder al usuario actual.');
                return;
            }

            $('#component_my_account_general input[name="username"]').val(response_data.body.data[0].username);

        });
    };
    users_read_current();
    
    // Modify current user
    $('#component_my_account_general form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_my_account_general form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_my_account_general .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_my_account_general .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_my_account_general form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/general/users/current/username/modify", "PUT", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_my_account_general .notifications', 'Usuario actual: Modificar');
            if(!result.Verify_())
                return;
            
            $('#component_my_account_general .notifications').html('');
            new wtools.Notification('SUCCESS').Show_('Usuario actual modificado exitosamente.');
        });
    });
    
    // Modify password of current user
    $('#component_my_account_change_password form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_my_account_change_password form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_my_account_change_password .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_my_account_change_password .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_my_account_change_password form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/general/users/current/password/modify", "PUT", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_my_account_change_password .notifications', 'Contrase&ntilde;a: Modificar');
            if(!result.Verify_())
                return;
            
            $('#component_my_account_change_password .notifications').html('');
            new wtools.Notification('SUCCESS').Show_('Contrase&ntilde;a modificada exitosamente.');
            wtools.CleanForm($('#component_my_account_change_password form'));
            $('#component_my_account_change_password form').removeClass('was-validated');
        });
    });
    
    // Click on Add User button
    $('#component_users_read .add').click(() => 
    {
        $('#component_users_add').modal('show');
    });

    // Add User
    $('#component_users_add form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_users_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_users_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_users_add .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_users_add form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/general/users/add", "POST", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_users_add .notifications', 'Usuarios: A&ntilde;adir');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Usuario creado exitosamente.');
            users_read();
            wtools.CleanForm($('#component_users_add form'));
            $('#component_users_add').modal('hide');
        });
    });
    
    // Read user to modify
    $(document).on("click", '#component_users_read table tbody tr', (e) =>
    {
        const read_modify = () => 
        {
            e.preventDefault();

            // Wait animation
            let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

            // Get ID
            let id = $(e.currentTarget).attr('user-id');
            if(id == undefined)
            {
                wait.Off_();
                new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de usuario.');
                return;
            }

            // Read user to modify
            new wtools.Request(server_config.current.api + `/general/users/read/id?id=${id}`).Exec_((response_data) =>
            {
                // Manage response
                const result = new ResponseManager(response_data, '', 'Usuarios: Modificar');
                if(!result.Verify_())
                    return;
    
                // Handle no results or zero results
                if(response_data.body.data.length < 1)
                {
                    new wtools.Notification('SUCCESS').Show_('Sin resultados.');
                    return;
                }

                wtools.CleanForm($('#component_users_modify form'));

                // Set data
                $('#component_users_modify input[name="id"]').val(response_data.body.data[0].id);
                $('#component_users_modify input[name="username"]').val(response_data.body.data[0].username);
                $('#component_users_modify select[name="status"]').val(response_data.body.data[0].status);
                $('#component_users_modify select[name="id_group"]').val(response_data.body.data[0].id_group);

                wait.Off_();
                $('#component_users_modify').modal('show');
            });
        }
        options_id_group_init(options_id_group, read_modify);
    });
    
    // Modify User
    $('#component_users_modify form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_users_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_users_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_users_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_users_modify form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/general/users/modify", "PUT", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_users_modify .notifications', 'Usuarios: Modificar');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Usuario modificado exitosamente.');
            users_read();
            wtools.CleanForm($('#component_users_modify form'));
            $('#component_users_modify').modal('hide');
        });
    });

    // Read user to Delete
    $('#component_users_modify .delete').click((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Data
        let data = new FormData($('#component_users_modify form')[0]);
        const id = data.get('id');
        const username = data.get('username');

        // Setup data to delete
        $('#component_users_delete input[name=id]').val(id);
        $('#component_users_delete strong.username').html(username);
        $('#component_users_delete').modal('show');
        wait.Off_();
    });
    
    // Delete user
    $('#component_users_delete form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_users_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Data
        const id = $('#component_users_delete input[name=id]').val();

        // Request
        new wtools.Request(server_config.current.api + `/general/users/delete?id=${id}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_users_delete .notifications', 'Usuarios: Eliminar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Usuario eliminado.');
            $('#component_users_delete').modal('hide');
            $('#component_users_modify').modal('hide');
            users_read();
        });
    });
    
});