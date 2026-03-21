const ReadTableInfo = async () =>
{
    // Wait animation
    let wait = new wtools.ElementState('.form-title', false, 'button', new wtools.WaitAnimation().for_button);

    try
    {
        // Get Form identifier
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            throw new Error('Identificador de formulario no proporcionado.');

        // Request
        await new wtools.Request(server_config.current.api + `/forms/tables/read/identifier?table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Clean
            wait.Off_();
            $('.form-title').html('');

            // Manage response
            const result = new ResponseManager(response_data, '#wait_animation_page', 'Data: A&ntilde;adir');
            if(!result.Verify_())
                throw new Error('No se pudo verificar la respuesta del servidor.');
            
            // Setup form name
            if(response_data.body.data == undefined || response_data.body.data.length < 1)
                throw new Error('No se encontr&oacute; el formulario solicitado.');

            const form = response_data.body.data[0].name;
            if(form == undefined)
                throw new Error('El formulario no tiene un nombre definido.');
            else
            {
                $('.form-title').html(form);
                functions.Next_();
            }
        });
    }
    catch(error)
    {
        wait.Off_();
        new wtools.ElementState('#wait_animation_page', true, 'block', 
            new wtools.FullScreenMessage(`
                <img src="/assets/images/logo.png" alt="StructBX Logo" width="50" height="50" class="d-inline-block align-text-top me-2">
                No se puede acceder al formulario, ve a <a href="/">Inicio</a>
            `).message
        );
        console.error(error);
        return;
    }
};

const ReadDataColumns = () =>
{
    try
    {
        $('#component_form_addData .notifications').html('');

        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Get Form identifier
        const table_identifier = GetTableIdentifier();
        if(table_identifier == undefined)
            throw new Error('Identificador de formulario no proporcionado.');

        // Setup data columns
        $('#component_form_addData table tbody').html('');
        
        // Read and setup columns
        new wtools.Request(server_config.current.api + `/forms/columns/read?table-identifier=${table_identifier}`).Exec_((response_data) =>
        {
            // Manage response
            const result = new ResponseManager(response_data, '', 'Formulario: Columnas: Leer');
            if(!result.Verify_())
                throw new Error('No se pudo verificar la respuesta del servidor.');

            // Handle zero results
            if(response_data.body.data == undefined || response_data.body.data.length < 1)
                throw new Error('El formulario no tiene columnas definidas.');
            
            // Results elements creator
            new wtools.UIElementsCreator('#component_form_addData table tbody', response_data.body.data).Build_((row) =>
            {
                if(row.identifier == "id")
                    return undefined;

                // If column type is a NORMAL type
                let table_element_object = new TableElements(wtools.IFUndefined(row.column_type, "text"), row, table_identifier);
                let table_element = $(table_element_object.Get_());
                let table_icon = table_element_object.GetIcon_();

                if(table_element == undefined)
                    return undefined;

                // If column type is SELECTION
                if(row.column_type == "selection")
                {
                    table_element = $('<td></td>');
                    let customSelect = new CustomSelect(table_element);
                    customSelect.hiddenInput.attr('name', row.identifier);
                    OptionsLinkSelection(customSelect, row.link_to_table, row.name, '#component_form_addData .notifications', undefined, '/forms', table_identifier);
                }
                else if(row.column_type == "user")
                    OptionsLinkUsersInDatabase(table_element, '#component_form_addData .notifications', undefined, '/forms');

                // Final elements
                let elements = [
                    `<th scope="row" data-bs-toggle="tooltip" data-bs-placement="top" title="${row.description}">${table_icon}${row.name}</th>`
                    ,table_element
                ];

                return new wtools.UIElementsPackage('<tr></tr>', elements).Pack_();
            });

            wait.Off_();
            $('#component_form_addData form').removeClass('was-validated');
        });

    }
    catch(error)
    {
        new wtools.ElementState('#wait_animation_page', true, 'block', 
            new wtools.FullScreenMessage(`
                <img src="/assets/images/logo.png" alt="StructBX Logo" width="50" height="50" class="d-inline-block align-text-top me-2">
                No se puede acceder al formulario, ve a <a href="/">Inicio</a>
            `).message
        );
        console.error(error);
        return;
    }
}

const AddData = async (e) =>
{
    e.preventDefault();

    // Wait animation
    let wait = new wtools.ElementState('#component_form_addData form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

    // Form check
    const check = new wtools.FormChecker(e.target).Check_();
    if(!check)
    {
        wait.Off_();
        $('#component_form_addData .notifications').html('');
        new wtools.Notification('WARNING', 5000, '#component_form_addData .notifications').Show_('Hay campos inv&aacute;lidos.');
        return;
    }

    // Get Table identifier
    const table_identifier = GetTableIdentifier();
    if(table_identifier == undefined)
    {
        wait.Off_();
        return;
    }

    // Data collection
    let new_data = new FormData($('#component_form_addData form')[0]);
    new_data.append('table-identifier', table_identifier);

    // Request
    new wtools.Request(server_config.current.api + "/forms/tables/data/add", "POST", new_data, false).Exec_((response_data) =>
    {
        wait.Off_();
        
        // Manage response
        const result = new ResponseManager(response_data, '#component_form_addData .notifications', 'Data: A&ntilde;adir');
        if(!result.Verify_())
            return;

        $('#component_form_addData form').trigger('reset');
        $('#component_form_successModal').modal('show');
    });
}

// Stepper functions
const functions = new wtools.StepperFunctions([ReadTableInfo, ReadDataColumns]);
functions.Next_();

$(function()
{
    $('#component_form_addData form').submit(function(e)
    {
        AddData(e);
    });

});