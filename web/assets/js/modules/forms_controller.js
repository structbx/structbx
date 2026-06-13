import { BaseController } from './base_controller.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';
import { Form } from '../models/Form.js';

export class FormsController extends BaseController
{
    constructor()
    {
        super();
        this.notification.warning = new wtools.Notification('WARNING', 5000, '#component_form_addData .notifications');
        this.form = new Form();
    }

    build()
    {
        this.readTableInfo();
    }

    bindEvents()
    {
        super.bindEvents();
        $('#component_form_addData form').submit((e) =>
        {
            this.addData(e);
        });
    }

    getTableIdentifier()
    {
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            new wtools.Notification('ERROR').Show_('No se encontr&oacute; el identificador del formulario.');
        return table_identifier;
    }

    getViewIdentifier()
    {
        return undefined;
    }

    readTableInfo()
    {
        let wait = new wtools.ElementState('.form-title', false, 'button', new wtools.WaitAnimation().for_button);

        try
        {
            const table_identifier = this.getTableIdentifier();
            if(table_identifier == undefined)
                throw new Error('Identificador de formulario no proporcionado.');

            this.form.readTableInfo(table_identifier).then((response_data) =>
            {
                wait.Off_();
                $('.form-title').html('');

                const result = new ResponseManager(response_data, '#wait_animation_page', 'Data: A&ntilde;adir');
                if(!result.Verify_())
                    throw new Error('No se pudo verificar la respuesta del servidor.');

                if(response_data.body.data == undefined || response_data.body.data.length < 1)
                    throw new Error('No se encontr&oacute; el formulario solicitado.');

                const form = response_data.body.data[0].name;
                if(form == undefined)
                    throw new Error('El formulario no tiene un nombre definido.');

                $('.form-title').html(form);
                this.readDataColumns();
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
        }
    }

    readDataColumns()
    {
        try
        {
            $('#component_form_addData .notifications').html('');

            let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

            const table_identifier = this.getTableIdentifier();
            if(table_identifier == undefined)
                throw new Error('Identificador de formulario no proporcionado.');

            $('#component_form_addData table tbody').html('');

            this.form.readColumns(table_identifier).then((response_data) =>
            {
                const result = new ResponseManager(response_data, '', 'Formulario: Columnas: Leer');
                if(!result.Verify_())
                    throw new Error('No se pudo verificar la respuesta del servidor.');

                if(response_data.body.data == undefined || response_data.body.data.length < 1)
                    throw new Error('El formulario no tiene columnas definidas.');

                new wtools.UIElementsCreator('#component_form_addData table tbody', response_data.body.data).Build_((row) =>
                {
                    if(row.identifier == "id")
                        return undefined;

                    const column_type = wtools.IFUndefined(row.column_type, "text");
                    let table_element_object = new TableElements(column_type, row, table_identifier);
                    let table_element = $(table_element_object.Get_());
                    let table_icon = table_element_object.GetIcon_();

                    if(table_element == undefined)
                        return undefined;

                    if(row.column_type == "selection")
                    {
                        table_element = $('<td></td>');
                        let customSelect = new DOME.CustomSelect(table_element);
                        customSelect.hiddenInput.attr('name', row.identifier);
                        this.linkSelectionOptions(customSelect, row.link_to, row.name, '#component_form_addData .notifications', undefined, '/forms');
                    }
                    else if(row.column_type == "user")
                    {
                        this.linkUsersInDatabaseOptions(table_element, '#component_form_addData .notifications', undefined, '/forms');
                    }

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
        }
    }

    addData(e)
    {
        e.preventDefault();

        let wait = new wtools.ElementState('#component_form_addData form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            wait.Off_();
            $('#component_form_addData .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_form_addData .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        const table_identifier = this.getTableIdentifier();
        if(table_identifier == undefined)
        {
            wait.Off_();
            return;
        }

        let new_data = new FormData($('#component_form_addData form')[0]);
        new_data.append('table-identifier', table_identifier);

        this.form.addData(new_data).then((response_data) =>
        {
            wait.Off_();

            const result = new ResponseManager(response_data, '#component_form_addData .notifications', 'Data: A&ntilde;adir');
            if(!result.Verify_())
                return;

            $('#component_form_addData form').trigger('reset');
            $('#component_form_successModal').modal('show');
        });
    }
}
