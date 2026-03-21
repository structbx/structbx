class TableGeneral
{
    VerifySession_()
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
    }

    Read_()
    {
        // Wait animation
        let wait = new wtools.ElementState('#table_name', false, 'button', new wtools.WaitAnimation().for_button);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/start/";
            return;
        }

        // Request
        new wtools.Request(server_config.current.api + `/tables/read/identifier?identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Clean
            wait.Off_();
            $('#table_name').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#wait_animation_page', 'Data: A&ntilde;adir');
            if(!result.Verify_())
            {
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/start/";
                return;
            }
            
            // Setup table name
            const table_name = response_data.body.data[0].name;
            if(table_name == undefined)
            {
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/start/";
            }
            else
            {
                $('#table_name').html(table_name);
                $('.table_title').html(table_name);
            }
        });
    };
}

var objectTableGeneral = new TableGeneral();

$(function ()
{
    // Verify Session
    objectTableGeneral.VerifySession_();

    // Elements
    new Headers().Header_();
    
    // Read Header Form
    objectTableGeneral.Read_();
    
    // Read all Sidebar forms
    const table_sidebar_read_all = () =>
    {
        $('#component_sidebar_tables .contents').html('');

        // Wait animation
        let wait = new wtools.ElementState('#component_sidebar_tables .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        // Request
        new wtools.Request(server_config.current.api + "/tables/read").Exec_(async (response_data) =>
        {
            // Clean
            wait.Off_();
            $('#component_sidebar_tables .notifications').html('');
            $('#component_sidebar_tables .contents').html('');
            $('#component_sidebar_tables_tabs .notifications').html('');
            $('#component_sidebar_tables_tabs .contents').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#component_sidebar_tables .notifications', '');
            if(!result.Verify_())
                return;

            // Handle zero results
            if(response_data.body.data == undefined || response_data.body.data.length < 1)
            {
                new wtools.Notification('SUCCESS', 0, '#component_sidebar_tables .notifications').Show_('Sin resultados.');
                new wtools.Notification('SUCCESS', 0, '#component_sidebar_tables_tabs .notifications').Show_('Sin resultados.');
                return;
            }

            // Results elements creator: Sidebar
            $('#component_sidebar_tables .contents').html('');
            $('#component_sidebar_tables .contents').hide();
            let elements = [];
            for(let row of response_data.body.data)
            {
                elements.push(`
                    <a class="menu_data nav-link mb-2 ${row.identifier == table_identifier ? "active" : ""}" href="/table?identifier=${row.identifier}" table-identifier="${row.identifier}">
                        <i class="fas fa-database"></i>
                        <span class="ms-2">${row.name}</span>
                    </a>
                `);
            }
            let ui_element = new wtools.UIElementsPackage('<div class="nav-item"></div>', elements).Pack_();
            $('#component_sidebar_tables .contents').append(ui_element);

            // Results elements creator: Tabs
            $('#component_sidebar_tables_tabs .tab-scroller').html('');
            $('#component_sidebar_tables_tabs .tab-scroller').hide();
            for(let row of response_data.body.data)
            {
                $('#component_sidebar_tables_tabs .tab-scroller').append(`
                    <div class="tab ${row.identifier == table_identifier ? "active" : ""}" id="${row.identifier}" table-identifier="${row.identifier}">
                        <span class="tab-title">${row.name}</span>
                    </div>
                `);
            }

            await hide_tables_without_permission();
            $('#component_sidebar_tables .contents').show();
            $('#component_sidebar_tables_tabs .tab-scroller').show();
        });
    };
    table_sidebar_read_all();

    // Go to Form data
    $(document).on('click', '.go_table', (e) =>
    {
        e.preventDefault();

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            return;

        new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        document.location.href = `/table?identifier=${table_identifier}`;

    });
    
    // Go to Columns settings
    $(document).on('click', '.go_columns', (e) =>
    {
        e.preventDefault();

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            return;

        new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        document.location.href = `/table/columns?identifier=${table_identifier}`;

    });

    // Go to Form Settings
    $(document).on('click', '.go_settings', (e) =>
    {
        e.preventDefault();

        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            return;

        new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        document.location.href = `/table/settings?identifier=${table_identifier}`;

    });
    
    hide_elements_without_permission();
});