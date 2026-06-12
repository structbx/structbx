import { BaseController } from './base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';

// Data models
import { Session } from '../models/Session.js';
import { Instance } from '../models/Instance.js';
import { Group } from '../models/Group.js';
import { Permission } from '../models/Permission.js';
import { User } from '../models/User.js';
import { Database } from '../models/Database.js';

export class SettingsController extends BaseController{
    constructor() {
        super();

        // Models
        this.session = new Session;
        this.instance = new Instance;
        this.group = new Group;
        this.permission = new Permission;
        this.user = new User;
        this.database = new Database;

        // Notifications for each entity
        this.notifications = {
            groups: {
                read: new wtools.Notification('WARNING', 5000, '#component_groups_read .notifications'),
                add: new wtools.Notification('WARNING', 5000, '#component_groups_add .notifications'),
                modify: new wtools.Notification('WARNING', 5000, '#component_groups_modify .notifications'),
                delete: new wtools.Notification('WARNING', 5000, '#component_groups_delete .notifications')
            },
            permissions: {
                read: new wtools.Notification('WARNING', 5000, '#component_permissions_read .notifications'),
                add: new wtools.Notification('WARNING', 5000, '#component_permissions_add .notifications'),
                modify: new wtools.Notification('WARNING', 5000, '#component_permissions_modify .notifications'),
                delete: new wtools.Notification('WARNING', 5000, '#component_permissions_delete .notifications')
            },
            users: {
                read: new wtools.Notification('WARNING', 5000, '#component_users_read .notifications'),
                add: new wtools.Notification('WARNING', 5000, '#component_users_add .notifications'),
                modify: new wtools.Notification('WARNING', 5000, '#component_users_modify .notifications'),
                delete: new wtools.Notification('WARNING', 5000, '#component_users_delete .notifications'),
                current: new wtools.Notification('WARNING', 5000, '#component_my_account_general .notifications'),
                changePassword: new wtools.Notification('WARNING', 5000, '#component_my_account_change_password .notifications')
            },
            databases: {
                read: new wtools.Notification('WARNING', 5000, '#component_databases_read .notifications'),
                add: new wtools.Notification('WARNING', 5000, '#component_databases_add .notifications')
            }
        }
    }

    build() {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        super.verifySession().then((result) => {
            if(!result){
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/login/";
                return;
            }
        });

        new DOME.Headers().header();
        new DOME.Footers().footer();
        new wtools.MenuManager('#section_settings .sidebar', true);

        super.hideWithoutPermission();
        super.readInstanceName();
        super.readCurrentDatabase();
        super.readCurrentUser();

        this.readInstanceName();
        this.readGroups();
        this.readUsers();
        this.readCurrentUser();

        wait.Off_();
        
    }

    bindEvents(){
        // ---- INSTANCE ----
        $(document).on('submit', '#component_instance_name_read form', (e) => {
            e.preventDefault();
            this.modifyInstanceName();
        });
        $(document).on('submit', '#component_instance_logo_read form', (e) => {
            e.preventDefault();
            this.modifyInstanceLogo();
        });
        
        // ---- USERS ----
        $(document).on('click', '#component_users_read .add', () => {
            this.initGroupSelect('#component_users_add form select[name=id_group]', () => {
                $('#component_users_add').modal('show');
            })
        });
        $(document).on('submit', '#component_users_add form', e => this.addUser(e));
        $(document).on('click', '#component_users_read table tbody tr', e => {
            this.preModifyUser(e)
        });
        $(document).on('submit', '#component_users_modify form', e => this.modifyUser(e));
        $(document).on('click', '#component_users_modify .delete', e => {
            e.preventDefault();
            const data = new FormData($('#component_users_modify form')[0]);
            $('#component_users_delete input[name=identifier]').val(data.get('identifier'));
            $('#component_users_delete strong.username').html(data.get('username'));
            $('#component_users_delete').modal('show');
        });
        $(document).on('submit', '#component_users_delete form', e => this.deleteUser(e));

        // My Account
        $(document).on('submit', '#component_my_account_general form', e => this.modifyCurrentUser(e));
        $(document).on('submit', '#component_my_account_change_password form', e => this.changePassword(e));

        // ---- GROUPS ----
        $(document).on('click', '#component_groups_read .add', (e) => {
            e.preventDefault();
            $('#component_groups_add').modal('show');
        });
        $(document).on('submit', '#component_groups_add form', e => this.addGroup(e));
        $(document).on('click', '#component_groups_read table tbody tr', e => {
            e.preventDefault();
            this.preModifyGroup(e);
        });
        $(document).on('submit', '#component_groups_modify form', e => this.modifyGroup(e));
        $(document).on('click', '#component_groups_modify .delete', e => {
            e.preventDefault();
            this.preDeleteGroup();
        });
        $(document).on('submit', '#component_groups_delete form', e => this.deleteGroup(e));
        
    }

    // --------------------------------------------------
    // INSTANCE
    // --------------------------------------------------
    readInstanceName(){
        // Wait animation
        let wait = new wtools.ElementState('#component_instance_name_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        this.instance.readName().then((response_data) => {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_instance_name_read .notifications', 'Nombre de instancia: Leer');
            if(!result.Verify_())
                return;
            
            // Handle zero results
            if(response_data.body.data.length < 1){
                new wtools.Notification('WARNING', '#component_instance_name_read .notifications').Show_('No se pudo acceder al nombre de la instancia.');
                return;
            }

            $('#component_instance_name_read input[name="name"]').val(response_data.body.data[0].value);
        });
    }
    
    modifyInstanceName(){
        // Wait animation
        let wait = new wtools.ElementState('#component_instance_name_read form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker($('#component_instance_name_read form')[0]).Check_();
        if(!check){
            wait.Off_();
            $('#component_instance_name_read .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_instance_name_read .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const name = $('#component_instance_name_read input[name="name"]').val();

        // Request
        this.instance.modifyName(name).then((response_data) =>
        {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_instance_name_read .notifications', 'Nombre de instancia: Modificar');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Nombre de instancia modificada exitosamente.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            location.reload();
        });
    }

    // Modify instance logo
    modifyInstanceLogo(){
        // Wait animation
        let wait = new wtools.ElementState('#component_instance_logo_read form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker($('#component_instance_logo_read form')[0]).Check_();
        if(!check){
            wait.Off_();
            $('#component_instance_logo_read .notifications').html('');
            new wtools.Notification('WARNING', 5000, '#component_instance_logo_read .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const data = new FormData($('#component_instance_logo_read form')[0]);

        // Request
        this.instance.modifyLogo(data).then((response_data) => {
            wait.Off_();

            // Manage response
            const result = new ResponseManager(response_data, '#component_instance_logo_read .notifications', 'Logo de instancia: Modificar');
            if(!result.Verify_())
                return;
            
            new wtools.Notification('SUCCESS').Show_('Logo de instancia modificada exitosamente.');
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            location.reload();
        });
    }

    // --------------------------------------------------
    // USERS
    // --------------------------------------------------
    readUsers() {
        const wait = new wtools.ElementState('#component_users_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);
        this.user.readAll().then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_users_read .notifications', 'Usuarios: Leer');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('WARNING', '#component_users_read .notifications').Show_('No se pudo acceder a los usuarios.');
                return;
            }
            $('#component_users_read .notifications').html('');
            $('#component_users_read table tbody').html('');
            new wtools.UIElementsCreator('#component_users_read table tbody', response.body.data).Build_(row => {
                const statusText = row.status === 'active' ? 'Activo' : 'Inactivo';
                const elements = [
                    `<td scope="row">${row.username}</td>`,
                    `<td scope="row">${statusText}</td>`,
                    `<td scope="row">${row.group}</td>`,
                    `<td scope="row">${row.created_at}</td>`
                ];
                return new wtools.UIElementsPackage(`<tr user-identifier="${row.identifier}"></tr>`, elements).Pack_();
            });
        });
    }

    readCurrentUser() {
        const wait = new wtools.ElementState('#component_my_account_general .notifications', false, 'block', new wtools.WaitAnimation().for_block);
        this.user.current().then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_my_account_general .notifications', 'Usuario actual: Leer');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('WARNING', '#component_my_account_general .notifications').Show_('No se pudo acceder al usuario actual.');
                return;
            }
            $('#component_my_account_general input[name="username"]').val(response.body.data[0].username);
        });
    }

    modifyCurrentUser(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_my_account_general form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_my_account_general .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_my_account_general .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }
        const data = new FormData($('#component_my_account_general form')[0]);
        this.userModel.modifyCurrentUsername(data.get('username')).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_my_account_general .notifications', 'Usuario actual: Modificar');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_('Usuario actual modificado exitosamente.');
            this.onChanged();
        });
    }

    changePassword(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_my_account_change_password form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_my_account_change_password .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_my_account_change_password .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }
        const data = new FormData($('#component_my_account_change_password form')[0]);
        this.userModel.changePassword(data.get('current_password'), data.get('new_password'), data.get('confirm_password')).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_my_account_change_password .notifications', 'Contrase&ntilde;a: Modificar');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_('Contrase&ntilde;a modificada exitosamente.');
            wtools.CleanForm($('#component_my_account_change_password form'));
            $('#component_my_account_change_password form').removeClass('was-validated');
        });
    }

    addUser(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_users_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_users_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_users_add .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }
        const data = new FormData($('#component_users_add form')[0]);
        this.userModel.add(data.get('username'), data.get('password'), data.get('status'), data.get('id_group')).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_users_add .notifications', 'Usuarios: A&ntilde;adir');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_('Usuario creado exitosamente.');
            this.readUsers();
            wtools.CleanForm($('#component_users_add form'));
            $('#component_users_add').modal('hide');
            this.onChanged();
        });
    }

    preModifyUser(e){
        const id = $(e.currentTarget).attr('user-id');
        if (!id) {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de usuario.');
            return;
        }
        const wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        this.userModel.readById(id).then(response => {
            const result = new ResponseManager(response, '', 'Usuarios: Modificar');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('SUCCESS').Show_('Sin resultados.');
                wait.Off_();
                return;
            }
            wtools.CleanForm($('#component_users_modify form'));
            $('#component_users_modify input[name="id"]').val(response.body.data[0].id);
            $('#component_users_modify input[name="username"]').val(response.body.data[0].username);
            $('#component_users_modify select[name="status"]').val(response.body.data[0].status);
            $('#component_users_modify select[name="id_group"]').val(response.body.data[0].id_group);
            wait.Off_();
            $('#component_users_modify').modal('show');
        });
    }

    preModifyUser(e){
        const identifier = $(e.currentTarget).attr('user-identifier');
        if (!identifier) {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de usuario.');
            return;
        }
        const wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        this.user.readByIdentifier(identifier).then(response => {
            const result = new ResponseManager(response, '', 'Usuarios: Modificar');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('SUCCESS').Show_('Sin resultados.');
                wait.Off_();
                return;
            }
            wtools.CleanForm($('#component_users_modify form'));
            $('#component_users_modify input[name="id"]').val(response.body.data[0].id);
            $('#component_users_modify input[name="username"]').val(response.body.data[0].username);
            $('#component_users_modify select[name="status"]').val(response.body.data[0].status);
            $('#component_users_modify select[name="id_group"]').val(response.body.data[0].id_group);
            wait.Off_();
            $('#component_users_modify').modal('show');
        });
    }

    modifyUser(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_users_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_users_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_users_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }
        const data = new FormData($('#component_users_modify form')[0]);
        this.userModel.modify(data.get('id'), data.get('username'), data.get('status'), data.get('id_group')).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_users_modify .notifications', 'Usuarios: Modificar');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_('Usuario modificado exitosamente.');
            this.readUsers();
            wtools.CleanForm($('#component_users_modify form'));
            $('#component_users_modify').modal('hide');
            this.onChanged();
        });
    }

    deleteUser(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_users_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const id = $('#component_users_delete input[name=id]').val();
        this.userModel.delete(id).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_users_delete .notifications', 'Usuarios: Eliminar');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_('Usuario eliminado.');
            $('#component_users_delete').modal('hide');
            $('#component_users_modify').modal('hide');
            this.readUsers();
            this.onChanged();
        });
    }

    // --------------------------------------------------
    // GROUPS
    // --------------------------------------------------

    initGroupSelect(selector, callback) {
        const select = new wtools.SelectOptions();
        this.group.readAll().then(response => {
            try {
                const tmp = [];
                for (const row of response.body.data) {
                    tmp.push(new wtools.OptionValue(row.identifier, row.group));
                }
                select.options = tmp;
                select.Build_(selector);
                if (callback) callback();
            } catch (error) {
                new wtools.Notification('WARNING').Show_('No se pudo acceder a grupos.');
            }
        });
    }
    
    readGroups() {
        const wait = new wtools.ElementState('#component_groups_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);
        this.group.readAll().then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_groups_read .notifications', 'Grupos: Leer');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('WARNING', '#component_groups_read .notifications').Show_('No se pudo acceder a los grupos.');
                return;
            }
            $('#component_groups_read .notifications').html('');
            $('#component_groups_read table tbody').html('');
            new wtools.UIElementsCreator('#component_groups_read table tbody', response.body.data).Build_(row => {
                const elements = [
                    `<td scope="row">${row.group}</td>`
                ];
                return new wtools.UIElementsPackage(`<tr group-identifier="${row.identifier}"></tr>`, elements).Pack_();
            });
        });
    }

    addGroup(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_groups_add form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_groups_add .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_groups_add .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }
        const group = $('#component_groups_add form input[name=group]').val();
        this.group.add(group).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_groups_add .notifications', 'Grupos: A&ntilde;adir');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_('Grupo agregado exitosamente.');
            this.readGroups();
            wtools.CleanForm($('#component_groups_add form'));
            $('#component_groups_add').modal('hide');
        });
    }
    preModifyGroup(e){
        const identifier = $(e.currentTarget).attr('group-identifier');
        if (!identifier) {
            new wtools.Notification('WARNING').Show_('No se encontr&oacute; el identificador de grupo.');
            return;
        }
        const wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
        this.group.readByIdentifier(identifier).then(response => {
            const result = new ResponseManager(response, '', 'Grupos: Modificar');
            if (!result.Verify_()) return;
            if (response.body.data.length < 1) {
                new wtools.Notification('SUCCESS').Show_('Sin resultados.');
                return;
            }
            wtools.CleanForm($('#component_groups_modify form'));
            $('#component_groups_modify input[name="identifier"]').val(response.body.data[0].identifier);
            $('#component_groups_modify input[name="group"]').val(response.body.data[0].group);
            $('#component_groups_modify').modal('show');
            wait.Off_();
        });
    }
    modifyGroup(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_groups_modify form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const check = new wtools.FormChecker(e.target).Check_();
        if (!check) {
            $('#component_groups_modify .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_groups_modify .notifications').Show_('Hay campos inv&aacute;lidos.');
            return;
        }
        const identifier = $('#component_groups_modify form input[name=identifier]').val();
        const group = $('#component_groups_modify form input[name=group]').val();
        this.group.modify(identifier, group).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_groups_modify .notifications', 'Grupos: Modificar');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_('Grupo modificado exitosamente.');
            this.readGroups();
            wtools.CleanForm($('#component_groups_modify form'));
            $('#component_groups_modify').modal('hide');
        });
    }

    preDeleteGroup(){
        const data = new FormData($('#component_groups_modify form')[0]);
        $('#component_groups_delete input[name=identifier]').val(data.get('identifier'));
        $('#component_groups_delete strong.group').html(data.get('group'));
        $('#component_groups_delete').modal('show');
    }

    deleteGroup(e) {
        e.preventDefault();
        const wait = new wtools.ElementState('#component_groups_delete form button[type=submit]', true, 'button', new wtools.WaitAnimation().for_button);
        const identifier = $('#component_groups_delete input[name=identifier]').val();
        this.group.delete(identifier).then(response => {
            wait.Off_();
            const result = new ResponseManager(response, '#component_groups_delete .notifications', 'Grupos: Eliminar');
            if (!result.Verify_()) return;
            new wtools.Notification('SUCCESS').Show_('Grupo eliminado.');
            $('#component_groups_modify').modal('hide');
            $('#component_groups_delete').modal('hide');
            this.readGroups();
        });
    }
}