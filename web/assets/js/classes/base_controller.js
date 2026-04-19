import { Permission } from '../models/Permission.js';
import { TablePermission } from '../models/Table.js';
import { Setting } from '../models/Setting.js';
import { Database } from '../models/Database.js';

export class BaseController {
    constructor() {
        this.apiBase = "/api";
        this.user_permissions = [];
        this.tables_permissions = [];
        this.permission = new Permission;
        this.table_permission = new TablePermission;
        this.setting = new Setting;
        this.Database = new Database;
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        readInstanceName();

        readInstanceLogo()
            
        readCurrentDatabase();
        
        readCurrentUser();

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
}