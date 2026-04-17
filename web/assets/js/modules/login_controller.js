import { BaseController } from '../classes/base_controller.js';
import * as Tools from '../classes/tools.js';

export class LoginController extends BaseController {
    constructor() {
        super();
    }

    bindEvents() {
        this.verifySession();

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
        $('#component_login form').submit((e) =>
        {
            e.preventDefault();

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
            const data = new FormData($('#component_login form')[0]);

            // Request
            new wtools.Request("/api/auth/login", "POST", data, false).Exec_((response_data) =>
            {
                wait.Off_();
                $('#component_login .notifications').html('');

                // Notifications
                if(response_data.status == 200)
                {
                    new wtools.Notification('SUCCESS').Show_('Inicio de sesi&oacute;n exitoso. Espere...');
                    const callback = () => {window.location.href = "/start/"};
                    this.setupDatabaseIdentifier(callback);
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
            });
        });
    }

    verifySession()
    {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        // Request
        new wtools.Request("/api/auth/login", "POST").Exec_((response_data) =>
        {
            if(response_data.status == 200)
            {
                new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
                window.location.href = "/start/";
                return;
            }

            wait.Off_();
        });
    }

    setupDatabaseIdentifier(callback){
        // Request
        new wtools.Request("/api/databases/read/id").Exec_((response_data) =>
        {
            // Manage error
            if(response_data.status == 401 || response_data.status != 200 || response_data.body.data == undefined || response_data.body.data.length < 1)
            {
                new wtools.Notification('WARNING').Show_('No se pudo acceder a la base de datos.');

                // Logout
                /*new wtools.Request("/api/auth/logout", "POST").Exec_((response_data) =>
                {
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
                });*/
                return;
            }

            callback();
        });
    };
}