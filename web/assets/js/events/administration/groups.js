$(function()
{
    // Read Groups
    const groups_read = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_groups_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        new wtools.Request(server_config.current.api + `/general/groups/read`).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_groups_read .notifications', 'Grupos: Leer');
            if(!result.Verify_())
                return;
            
            // Handle zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('WARNING', '#component_groups_read .notifications').Show_('No se pudo acceder a los grupos.');
                return;
            }

            // Results elements creator
            $('#component_groups_read .notifications').html('');
            $('#component_groups_read table tbody').html('');
            new wtools.UIElementsCreator('#component_groups_read table tbody', response_data.body.data).Build_((row) =>
            {
                let elements = [
                    ,`<td scope="row">${row.id}</td>`
                    ,`<td scope="row">${row.group}</td>`
                    ,`<td scope="row">${row.created_at}</td>`
                ];

                return new wtools.UIElementsPackage(`<tr group-id="${row.id}"></tr>`, elements).Pack_();
            });
        });
    };
    groups_read();
    
    // Click on Add Group button
    $('#component_groups_read .add').click(() => 
    {
        $('#component_groups_add').modal('show');
    });

    // Add Group
    $('#component_groups_add form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_groups_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_groups_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_groups_add .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_groups_add form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/general/groups/add", "POST", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_groups_add .notifications', 'Grupos: A&ntilde;adir');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Grupo agregado exitosamente.');
            groups_read();
            wtools.CleanForm($('#component_groups_add form'));
            $('#component_groups_add').modal('hide');
        });
    });

    // Read group to modify
    $(document).on("click", '#component_groups_read table tbody tr', (e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Get ID
        let id = $(e.currentTarget).attr('group-id');
        if(id == undefined)
        {
            wait.Off_();
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de grupo.');
            return;
        }

        // Read user to modify
        new wtools.Request(server_config.current.api + `/general/groups/read/id?id=${id}`).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '', 'Grupos: Modificar');
            if(!result.Verify_())
                return;

            // Handle no results or zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('SUCCESS').Show_('Sin resultados.');
                return;
            }

            wtools.CleanForm($('#component_groups_read form'));

            // Set data
            $('#component_groups_modify input[name="id"]').val(response_data.body.data[0].id);
            $('#component_groups_modify input[name="group"]').val(response_data.body.data[0].group);

            wait.Off_();
            $('#component_groups_modify').modal('show');
        });
    });
    
    // Modify Group
    $('#component_groups_modify form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_groups_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_groups_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_groups_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_groups_modify form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/general/groups/modify", "PUT", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_groups_modify .notifications', 'Grupos: Modificar');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Grupo modificado exitosamente.');
            groups_read();
            wtools.CleanForm($('#component_groups_modify form'));
            $('#component_groups_modify').modal('hide');
        });
    });
    
    // Read group to Delete
    $('#component_groups_modify .delete').click((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Data
        let data = new FormData($('#component_groups_modify form')[0]);
        const id = data.get('id');
        const group = data.get('group');

        // Setup data to delete
        $('#component_groups_delete input[name=id]').val(id);
        $('#component_groups_delete strong.username').html(group);
        $('#component_groups_delete').modal('show');
        wait.Off_();
    });
    
    // Delete group
    $('#component_groups_delete form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_groups_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Data
        const id = $('#component_groups_delete input[name=id]').val();

        // Request
        new wtools.Request(server_config.current.api + `/general/groups/delete?id=${id}`, "DEL").Exec_((response_data) =>
        {
            wait.Off_();
            
            // Manage response
            const result = new ResponseManager(response_data, '#component_groups_delete .notifications', 'Grupos: Eliminar');
            if(!result.Verify_())
                return;

            new wtools.Notification('SUCCESS').Show_('Grupo eliminado.');
            $('#component_groups_modify').modal('hide');
            $('#component_groups_delete').modal('hide');
            groups_read();
        });
    });
    
});