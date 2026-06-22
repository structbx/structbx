import { BaseController } from './base_controller.js';
import * as Tools from '../classes/tools.js';
import { I18n } from '../i18n/i18n.js';

import { Session } from '../models/Session.js';
import { Database } from '../models/Database.js';

export class LoginController extends BaseController {
    constructor() {
        super();
        this.session = new Session;
        this.database = new Database;
    }

    build(){
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        super.verifySession().then((result) => {
            if(result){
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/";
                return;
            }
        });

        wait.Off_();
    }

    bindEvents() {
        super.bindEvents();
        
        // Toggle password visibility
        $('#togglePassword').click(function()
        {
            const passwordInput = $('#password');
            const type = passwordInput.attr('type') === 'password' ? 'text' : 'password';
            passwordInput.attr('type', type);
            
            // Toggle eye icon
            $(this).find('i').toggleClass('fa-eye fa-eye-slash');
        });
        
        // Add focus effects to form inputs
        $('.form-control').focus(function()
        {
            $(this).parent().addClass('focused');
        })
        .blur(function()
        {
            if ($(this).val() === '')
            {
                $(this).parent().removeClass('focused');
            }
        });

        // Login
        $('#component_login form').submit(async (e) =>
        {
            e.preventDefault();
            this.login();
        });
    }

    setupDatabaseIdentifier(){
        // Request
        this.database.current().then((response_data) => {
            // Manage error
            if(response_data.status == 401 || response_data.status != 200 
                || response_data.body.data == undefined 
                || response_data.body.data.length < 1){
                new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('login.database_access_failed') : 'Could not access the database.');

                // Logout
                this.session.logout().then((logout_response) => {
                    // Notifications
                    if(logout_response.status == 200){
                        new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                        window.location.href = "/login/";
                    }
                    else
                        new wtools.Notification('WARNING').Show_(window.structbxI18n ? window.structbxI18n.t('login.logout_failed') : 'Could not close the session.');

                    return;
                })
            }
            else
                window.location.href = "/";
        });

    };

    login(){
        // Wait animation
        let wait = new wtools.ElementState('#component_login form button[type=submit]'
            , true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker($('#component_login form')[0]).Check_();
        if(!check)
        {
            $('#component_login .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_login .notifications')
                .Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_fields') : 'There are invalid fields.');
            return;
        }

        // Data collection
        const username = $('#component_login form #user').val();
        const password = $('#component_login form #password').val();

        // Request
        this.session.login(username, password).then((response_data) => {
            wait.Off_();
            $('#component_login .notifications').html('');

            // Notifications
            if(response_data.status == 200){
                new wtools.Notification('SUCCESS', 0, '#component_login .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.success') : 'Login successful. Please wait...');
                this.setupDatabaseIdentifier();
                return;
            } else if(response_data.status == 401){
                $('#component_login form input[name=password]').val('');
                new wtools.Notification('ERROR', 0, '#component_login .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.invalid_credentials') : 'Invalid username or password.');
            } else {
                $('#component_login form input[name=password]').val('');
                new wtools.Notification('ERROR', 0, '#component_login .notifications').Show_(window.structbxI18n ? window.structbxI18n.t('login.error') : 'Error logging in.');
            }
        });
    }
}