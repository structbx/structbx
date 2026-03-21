$(function()
{
    // SELECT options

    const get_database_identifier = () =>
    {
        const database_identifier = wtools.GetUrlSearchParam('identifier');
        if(database_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la base de datos.');
            return;
        }
        return database_identifier;
    }
    let options_users = new wtools.SelectOptions();
    const options_users_init = (options, callback) => new wtools.Request(server_config.current.api + `/databases/users/out/read?identifier_database=${get_database_identifier()}`).Exec_((response_data) =>
    {
        try
        {
            let tmp_options = [];
            if(response_data.body.data.length < 1)
                tmp_options.push(new wtools.OptionValue("", "No hay usuarios disponibles"));
            for(let row of response_data.body.data)
                tmp_options.push(new wtools.OptionValue(row.id, row.username));

            options.options = tmp_options;
            options.Build_('#component_users_add select[name="id_user"]');
            callback();
        }
        catch(error)
        {
            new wtools.Notification('WARNING', 0, '#component_users_add .notifications').Show_('No se pudo acceder a los usuarios.');
        }
    });
    options_users_init(options_users, () => {})

    // Read Users
    const users_read = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_users_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Get database identifier
        const database_identifier = wtools.GetUrlSearchParam('identifier');
        if(database_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la base de datos.');
            return;
        }

        // Request
        new wtools.Request(server_config.current.api + `/databases/users/read?identifier=${database_identifier}`).Exec_((response_data) =>
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
                    ,`<td scope="row">${row.created_at}</td>`
                ];

                return new wtools.UIElementsPackage(`<tr user-id="${row.id}" user-username="${row.username}"></tr>`, elements).Pack_();
            });
        });
    };
    users_read();
    
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

        // Get database identifier
        const database_identifier = wtools.GetUrlSearchParam('identifier');
        if(database_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la base de datos.');
            return;
        }
        
        // Data collection
        const data = new FormData($('#component_users_add form')[0]);
        data.append('identifier_database', database_identifier);

        // Request
        new wtools.Request(server_config.current.api + "/databases/users/add", "POST", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_users_add .notifications', 'Usuarios: A&ntilde;adir');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Usuario agregado exitosamente.');
            users_read();
            wtools.CleanForm($('#component_users_add form'));
            $('#component_users_add').modal('hide');
            options_users_init(options_users, () => {});
        });
    });
    
    // Read user to Delete
    $(document).on("click", '#component_users_read table tbody tr', (e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Data
        let id = $(e.currentTarget).attr('user-id');
        let username = $(e.currentTarget).attr('user-username');
        if(id == undefined || username == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; la informaci&oacute;n del usuario.');
            return;
        }

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

        // Get database identifier
        const database_identifier = wtools.GetUrlSearchParam('identifier');
        if(database_identifier == undefined)
        {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de la base de datos.');
            return;
        }
        
        // Data
        const id = $('#component_users_delete input[name=id]').val();

        // Request
        new wtools.Request(server_config.current.api + `/databases/users/delete?id=${id}&database_identifier=${database_identifier}`, "DEL").Exec_((response_data) =>
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