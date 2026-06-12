import { LoginController } from './modules/login_controller.js';
import { StartController } from './modules/start_controller.js';
import { TableController } from './modules/table_controller.js';
import { SettingsController } from './modules/settings_controller.js';

const Pages = {
    'Login': LoginController
    ,'Start': StartController
    ,'Table': TableController
    ,'Settings': SettingsController
};

$(document).ready(() => {
    const pageName = $('body').data('page');
    const ControllerClass = Pages[pageName];

    if (ControllerClass) {
        const app = new ControllerClass();
        app.init();
    } else {
        console.warn(`Controller not found: ${pageName}`);
    }
});
