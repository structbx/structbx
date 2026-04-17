import { LoginController } from './modules/login_controller.js';
import { StartController } from './modules/start_controller.js';

const Pages = {
    'Login': LoginController
    ,'Start': StartController
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
