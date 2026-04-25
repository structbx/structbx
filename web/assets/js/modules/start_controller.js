import { BaseController } from '../classes/base_controller.js';
import * as Tools from '../classes/tools.js';
import * as DOME from '../classes/dom_elements.js';

import { Session } from '../models/Session.js';

export class StartController extends BaseController {
    constructor() {
        super();
        this.session = new Session;
    }

    bindEvents() {
        // Wait animation
        let wait = new wtools.ElementState('#wait_animation_page', true, 'block', new wtools.WaitAnimation().for_page);

        super.bindEvents();
        
        this.verifySession();

        new DOME.Sidebars().SidebarMenu_();
        new DOME.Headers().Header_();
        new DOME.Footers().Footer_();
        new wtools.MenuManager('#menu_main', true);

        super.hideWithoutPermission();

        super.readInstanceName();
        super.readCurrentDatabase();
        super.readCurrentUser();

        wait.Off_();
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
    };
}