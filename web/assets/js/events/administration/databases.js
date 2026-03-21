$(function()
{
    // Read databases
    const databases_read = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#component_databases_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        new wtools.Request(server_config.current.api + `/databases/read`).Exec_((response_data) =>
        {
            // Clean
            wait.Off_();
            $('#component_databases_read .notifications').html('');
            $('#component_databases_read table tbody').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_databases_read .notifications', 'Bases de datos: Leer');
            if(!result.Verify_())
                return;

            // Handle no results or zero results
            if(response_data.body.data.length < 1)
            {
                new wtools.Notification('SUCCESS', 0, '#component_databases_read .notifications').Show_('Sin resultados.');
                return;
            }

            // Results elements creator
            wait.Off_();
            $('#component_databases_read .notifications').html('');
            $('#component_databases_read table tbody').html('');
            new wtools.UIElementsCreator('#component_databases_read table tbody', response_data.body.data).Build_((row) =>
            {
                let elements = [
                    `<th scope="row"><a href="/database?identifier=${row.identifier}">${row.name}</a></th>`
                    ,`<td scope="row">${row.size} MB</td>`
                    ,`<td scope="row">${row.directory_size} MB</td>`
                    ,`<td scope="row">${row.description}</td>`
                    ,`<td scope="row">${row.created_at}</td>`
                ];

                return new wtools.UIElementsPackage(`<tr database-id="${row.id}"></tr>`, elements).Pack_();
            });
        });
    }
    databases_read();

    // Click on Add Database button
    $('#component_databases_read .add').click(() => 
    {
        $('#component_databases_add').modal('show');
    });

    // Add Database
    $('#component_databases_add form').submit((e) =>
    {
        e.preventDefault();

        // Wait animation
        let wait = new wtools.ElementState('#component_databases_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_databases_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_databases_add .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_databases_add form')[0]);

        // Request
        new wtools.Request(server_config.current.api + "/databases/add", "POST", data, false).Exec_((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_databases_add .notifications', 'Bases de datos: A&ntilde;adir');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Base de datos creada exitosamente.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            location.reload();
        });
    });

});