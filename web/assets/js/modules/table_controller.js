import { BaseController } from './base_controller.js';
import * as Tools from '../classes/tools.js';

import { Session } from '../models/Session.js';
import { Table } from '../models/Table.js';

export class TableController extends BaseController {
    constructor() {
        super();
        this.session = new Session;
        this.table = new Table;
    }

    build(){
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        this.verifySession();

        wait.Off_();
    }

    async bindEvents() {
        super.bindEvents();
        
    }

    async verifySession()
    {
        // Request
        const response_data = await this.session.login();
        if(response_data.status != 200)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/login/";
            return;
        }
    }

    async readCurrentTableInfo(){
        // Wait animation
        let wait = new wtools.ElementState('#table_name', false, 'button', new wtools.WaitAnimation().for_button);

        // Get Form identifier
        const table_identifier = super.getTableIdentifier();

        // Request
        const response_data = await this.table.read(table_identifier);
    
        // Clean
        wait.Off_();
        $('#table_name').html('');

        // Manage response
        const result = new ResponseManager(response_data, '#wait_animation_page', 'Data: A&ntilde;adir');
        if(!result.Verify_())
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/start/";
            return;
        }
        
        // Setup table name
        const table_name = response_data.body.data[0].name;
        if(table_name == undefined)
        {
            new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);
            window.location.href = "/start/";
        }
        else
        {
            $('#table_name').html(table_name);
            $('.table_title').html(table_name);
        }
    }
}