import { LoginController } from './modules/login_controller.js';
import { StartController } from './modules/start_controller.js';
import { TableController } from './modules/table_controller.js';
import { SettingsController } from './modules/settings_controller.js';
import { I18n } from './i18n/i18n.js';

const Pages = {
    'Login': LoginController
    ,'Start': StartController
    ,'Table': TableController
    ,'Settings': SettingsController
};

$(document).ready(() => {
    if (!window.structbxI18n)
    {
        window.structbxI18n = new I18n();
    }
    window.structbxI18n.translateDOM();

    const pageName = $('body').data('page');
    const ControllerClass = Pages[pageName];

    if (ControllerClass) {
        const app = new ControllerClass();
        app.init();
    } else {
        console.warn(`Controller not found: ${pageName}`);
    }
});
