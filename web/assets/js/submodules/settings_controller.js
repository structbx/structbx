import { BaseController } from '../modules/base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';
import { ResponseManager } from '../classes/response_manager.js';
import { TableElements } from '../classes/table_elements.js';

import { Setting } from '../models/Setting.js';

export class SettingsController extends BaseController{
    constructor(onChangedCallback = () => {}) {
        super();
        this.onChanged = onChangedCallback;

        this.setting = new Setting;

        this.readInstanceName();
    }

    build(){

    }

    bindEvents(){
        $(document).on('click', '#component_instance_name_read button[type=submit]', (e) => {
            e.preventDefault();
            this.modifyInstanceName();
        });
        $(document).on('click', '#component_instance_logo_read button[type=submit]', (e) => {
            e.preventDefault();
            this.modifyInstanceLogo();
        });
    }

    readInstanceName(){
        // Wait animation
        let wait = new wtools.ElementState('#component_instance_name_read .notifications', false, 'block', new wtools.WaitAnimation().for_block);

        // Request
        this.setting.readName().then((response_data) => {
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
        this.setting.modifyInstanceName(name).then((response_data) =>
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
        this.setting.modifyInstanceLogo(data).then((response_data) => {
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
}