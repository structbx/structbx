import { BaseController } from './base_controller.js';
import * as Tools from '../classes/tools.js';

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

        this.verifySession();

        wait.Off_();
    }

    async bindEvents() {
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

    async verifySession()
    {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Request
        const response_data = await this.session.login(undefined, undefined);
        if(response_data.status == 200)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/start/";
            return;
        }

        wait.Off_();
    }

    async setupDatabaseIdentifier(){
        // Request
        const response_data = await this.database.current();

        // Manage error
        if(response_data.status == 401 || response_data.status != 200 || response_data.body.data == undefined || response_data.body.data.length < 1)
        {
            new wtools.Notification('WARNING').Show_('No se pudo acceder a la base de datos.');

            // Logout
            const logout_response = await this.session.logout();
            // Notifications
            if(logout_response.status == 200)
            {
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/login/";
            }
            else
                new wtools.Notification('WARNING').Show_('No se pudo cerrar la sesi&oacute;n.');

            return;
        }
    };

    async login(){
        // Wait animation
        let wait = new wtools.ElementState('#component_login form button[type=submit]'
            , true, 'button', new wtools.WaitAnimation().for_button);

        // Form check
        const check = new wtools.FormChecker(e.target).Check_();
        if(!check)
        {
            $('#component_login .notifications').html('');
            wait.Off_();
            new wtools.Notification('WARNING', 5000, '#component_login .notifications')
                .Show_('Hay campos inv&aacute;lidos.');
            return;
        }

        // Data collection
        const username = $('#component_login form #user').val();
        const password = $('#component_login form #password').val();

        // Request
        const response_data = await this.session.login(username, password);
        wait.Off_();
        $('#component_login .notifications').html('');

        // Notifications
        if(response_data.status == 200)
        {
            new wtools.Notification('SUCCESS', 0, '#component_login .notifications').Show_('Inicio de sesi&oacute;n exitoso. Espere...');
            this.setupDatabaseIdentifier();
            window.location.href = "/start/"
            return;
        }
        else if(response_data.status == 401)
        {
            $('#component_login form input[name=password]').val('');
            new wtools.Notification('ERROR', 0, '#component_login .notifications').Show_("Usuario o contrase&ntilde;a incorrectos.");
        }
        else
        {
            $('#component_login form input[name=password]').val('');
            new wtools.Notification('ERROR', 0, '#component_login .notifications').Show_("Error al iniciar sesi&oacute;n");
        }
    }
}