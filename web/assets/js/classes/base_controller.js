
import * as DOME from '../classes/dom_elements.js';

import { Permission } from '../models/Permission.js';
import { TablePermission } from '../models/Table.js';
import { Setting } from '../models/Setting.js';
import { Database } from '../models/Database.js';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { TableData } from '../models/TableData.js';

export class BaseController {
    constructor() {
        this.apiBase = "/api";
        this.user_permissions = [];
        this.tables_permissions = [];
        this.permission = new Permission;
        this.table_permission = new TablePermission;
        this.setting = new Setting;
        this.database = new Database;
        this.user = new User;
        this.session = new Session;
        this.table_data = new TableData;
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.readInstanceName();
        this.readInstanceLogo()
        this.readCurrentDatabase();
        this.readCurrentUser();

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

            this.changeCurrentDatabase($(e.currentTarget).attr('database_id'));
        });
        $(document).on("click", '#component_databases_selector li a', (e) =>
        {
            e.preventDefault();

            this.changeCurrentDatabase($(e.currentTarget).attr('database_id'));
        });
    }
    
    handleError(error) {
        console.error(error);
    }

    async readCurrentUserPermissions (callback){
        // Request
        const response_data = this.permission.currentUser();

        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
        
        for(let i = 0; i < response_data.body.data.length; i++)
            this.user_permissions.push(response_data.body.data[i].endpoint);

        callback();
    }

    async verifyUserHasPermission(permission_endpoint){
        return this.user_permissions.includes(permission_endpoint);
    }

    async hideWithoutPermission(){
        this.readCurrentUserPermissions(() =>{
            $('[permission-endpoint]').each((index, element) =>
            {
                let endpoint = $(element).attr('permission-endpoint');
                if(!this.verifyUserHasPermission(endpoint))
                    $(element).remove();
            });
        });
    }

    async readCurrentUserTablePermissions(callback){
        const response_data = this.table_permission.read();

        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
        
        for(let i = 0; i < response_data.body.data.length; i++)
            this.tables_permissions.push(response_data.body.data[i].table_identifier);
        
        callback();
    }

    async verifyUserHasTablePermission(permission_endpoint){
        return this.tables_permissions.includes(permission_endpoint);
    }

    async hideTablesWithoutPermission()
    {
        await this.readCurrentUserTablePermissions(() =>
        {
            $('[table-identifier]').each((index, element) =>
            {
                let table_identifier = $(element).attr('table-identifier');
                if(!this.verifyUserHasTablePermission(table_identifier))
                    $(element).remove();
            });
        });
    }

    readInstanceName = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#instance_name', false, 'button', new wtools.WaitAnimation().for_button);

        const response_data = this.setting.readName();

        // Clean
        wait.Off_();

        // Manage error
        if(response_data.status == 401 || response_data.status != 200 || response_data.body.data == undefined || response_data.body.data.length < 1)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder al nombre de la instancia.');
            return;
        }
        
        // Setup database name
        $("#instance_name").html(response_data.body.data[0].value);
    };

    readInstanceLogo = () =>{
        const response_data = this.setting.readLogo();

        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
    }

    // Read current Database
    readCurrentDatabase = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#database_name', false, 'button', new wtools.WaitAnimation().for_button);

        const response_data = this.database.current();

        // Clean
        wait.Off_();

        // Manage error
        if(response_data.status == 401 || response_data.status != 200 || response_data.body.data == undefined || response_data.body.data.length < 1)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder a la base de datos.');
            return;
        }
        
        // Setup database name
        $(".database_name").html(response_data.body.data[0].name);

        this.readDatabasesSelector();
    };

    // Read databases
    readDatabasesSelector = () =>
    {
        // Wait animation
        let wait_sidebar = new wtools.ElementState('#component_sidebar_databases .contents', false, 'block', new wtools.WaitAnimation().for_block);
        let wait_header = new wtools.ElementState('#component_databases_selector', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        const response_data = this.database.read();
    
        // Clean
        wait_sidebar.Off_();
        wait_header.Off_();
        $('#component_sidebar_databases .contents').html('');
        $('#component_databases_selector').html('');

        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
        
        // Results elements creator (Sidebar)
        new wtools.UIElementsCreator('#component_sidebar_databases .contents', response_data.body.data).Build_((row) =>
        {
            let element = '';
            if($('.database_name').html() == row.name)
            {
                element = `
                    <div class="nav-item">
                        <a class="nav-link mb-2 active" href="#" database_id="${row.identifier}">
                            <i class="fas fa-building"></i>
                            <span class="ms-2">${row.name}</span>
                        </a>
                    </div>`
            }
            else
            {
                element = `
                    <div class="nav-item">
                        <a class="nav-link mb-2" href="#" database_id="${row.identifier}">
                            <i class="fas fa-building"></i>
                            <span class="ms-2">${row.name}</span>
                        </a>
                    </div>`
            }

            return new wtools.UIElementsPackage('<li></li>', [element]).Pack_();
        });

        // Results elements creator (Header)
        new wtools.UIElementsCreator('#component_databases_selector', response_data.body.data).Build_((row) =>
        {
            let element = '';
            if($('.database_name').html() != row.name)
            {
                element = `
                    <li>
                        <a class="dropdown-item btn btn-ligth" href="#" database_id="${row.identifier}">
                            ${row.name}
                        </a>
                    </li>`
            }

            return new wtools.UIElementsPackage('<li></li>', [element]).Pack_();
        });
    };

    changeCurrentDatabase = (database_id) =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Read dashboard to modify
        const response_data = this.database.change(database_id);
    
        // Manage error
        const result = new ResponseManager(response_data, '');
        if(!result.Verify_())
            return;
        
        new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        location.href = "/start/";

        wait.Off_();
    }

    readCurrentUser = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#instance_name', false, 'button', new wtools.WaitAnimation().for_button);

        // Request
        const response_data = this.user.current();
    
        // Clean
        wait.Off_();

        // Manage error
        if(response_data.status == 403 || response_data.status == 401 || response_data.status != 200 || response_data.body.data == undefined || response_data.body.data.length < 1)
        {
            this.logout();
            return;
        }
        
        // Setup username logued
        $(".username_logued").html(response_data.body.data[0].username);
    };

    logout = () =>
    {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Request
        const response_data = this.session.logout();
        
        wait.Off_();

        // Notifications
        if(response_data.status == 200)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/login/";
        }
        else
        {
            new wtools.Notification('WARNING').Show_('No se pudo cerrar la sesi&oacute;n.');
        }
    }

    getTableIdentifier = () =>
    {
        const table_identifier = wtools.GetUrlSearchParam('identifier');
        if(table_identifier == undefined)
            new wtools.Notification('ERROR').Show_('No se encontr&oacute; el identificador de la tabla.');

        return table_identifier;
    }

    linkSelectionOptions(element, link_to_table, column_name, target, selected = undefined, form = '', main_table = '')
    {
        const response_data = this.table_data.readToLinkSelectionOptions(form, link_to_table, main_table);
    
        try
        {
            // Add empty <option>
            element.AddOption_('', '-- Ninguno --');

            // Verify status
            if(response_data.status == 401) throw new Error(`No posee los permisos necesarios para acceder a <b>${column_name}</b>`);
            if(response_data.status != 200) throw new Error(`Hubo un error al acceder a la columna enlazada <b>${column_name}</b>`);
            if(response_data.body == undefined || response_data.body.data == undefined) throw new Error(`No se encontraron datos en la columna enlazada <b>${column_name}</b>`);

            // Add select or not selected <option>
            for(let row of response_data.body.data)
            {
                const col_id = response_data.body.columns[0];
                const col_name = response_data.body.columns[1];
                
                let final_value = row[col_name];
                if(row._structbx_column_colorHeader != "")
                    final_value = getHeaderColor(row._structbx_column_colorHeader, row[col_name]);

                element.AddOption_(row[col_id], final_value);
                if(selected == row[col_name])
                    element.setValue(row[col_id]);
            }
        }
        catch(error)
        {
            new wtools.Notification('WARNING', 0, target).Show_(error);
        }
    }
}