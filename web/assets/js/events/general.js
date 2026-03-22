var user_permissions = [];
var tables_permissions = [];

var read_current_user_permissions = async (callback) =>
{
    // Request
    await new wtools.Request(server_config.current.api + "/general/permissions/current/read").Exec_((response_data) =>
    {
        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
        
        for(let i = 0; i < response_data.body.data.length; i++)
            user_permissions.push(response_data.body.data[i].endpoint);
    });

    callback();
}

var verify_if_user_has_permission = (permission_endpoint) =>
{
    return user_permissions.includes(permission_endpoint);
}

var hide_elements_without_permission = () =>
{
    read_current_user_permissions(() =>
    {
        $('[permission-endpoint]').each((index, element) =>
        {
            let endpoint = $(element).attr('permission-endpoint');
            if(!verify_if_user_has_permission(endpoint))
                $(element).remove();
        });
    });
}

var read_current_user_tablePermissions = async (callback) =>
{
    // Request
    await new wtools.Request(server_config.current.api + "/tables/permissions/tables/read").Exec_((response_data) =>
    {
        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
        
        for(let i = 0; i < response_data.body.data.length; i++)
            tables_permissions.push(response_data.body.data[i].table_identifier);
    });

    callback();
}

var verify_if_user_has_tablePermission = (permission_endpoint) =>
{
    return tables_permissions.includes(permission_endpoint);
}

var hide_tables_without_permission = async () =>
{
    await read_current_user_tablePermissions(() =>
    {
        $('[table-identifier]').each((index, element) =>
        {
            let table_identifier = $(element).attr('table-identifier');
            if(!verify_if_user_has_tablePermission(table_identifier))
                $(element).remove();
        });
    });
}

var instance_logo_read = async () =>
{
    // Request
    await new wtools.Request(server_config.current.api + "/general/instanceLogo/read").ExecPlain_((response_data) =>
    {
        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
        
        // The endpoint returns an image
    });
}

$(function ()
{
    instance_name_read();

    instance_logo_read()
        
    databases_read_id();
    
    username_logued_read();

    $(document).on('click', '#logout-button', (e) =>
    {
        e.preventDefault();

        logout();
    });
    
    $(document).on('click', '.go-button', function(e)
    {
        e.preventDefault();
        let path = $(e.currentTarget).attr('go-path');
        let hash = $(e.currentTarget).attr('go-hash');
        if(window.location.pathname == path || window.location.pathname == path + "/")
        {
            location.hash = hash;
            location.reload();
        }
        else
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = path + hash;
        }
    });

    $(document).on('click', '.go-form-button', function(e)
    {
        e.preventDefault();
        new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        window.location.href = `/table?identifier=${wtools.GetUrlSearchParam('identifier')}`;
    });

    // Change current database
    $(document).on("click", '#component_sidebar_databases .contents a', (e) =>
    {
        e.preventDefault();

        change_current_database($(e.currentTarget).attr('database_id'));
    });
    $(document).on("click", '#component_databases_selector li a', (e) =>
    {
        e.preventDefault();

        change_current_database($(e.currentTarget).attr('database_id'));
    });

});
