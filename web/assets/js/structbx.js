import { LoginController } from './modules/login_controller.js';
import { StartController } from './modules/start_controller.js';
import { TableController } from './modules/table_controller.js';
import { SettingsController } from './modules/settings_controller.js';
import { I18n } from './i18n/i18n.js';

const savedTheme = localStorage.getItem('structbx_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

const FOCUSABLE_MODAL_SELECTOR = [
    'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image]):not([type=checkbox]):not([type=radio]):not(:disabled)',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '.custom-select-display'
].join(', ');

$(document).on('shown.bs.modal', '.modal', function() {
    const $modal = $(this);
    const focusFirst = () => {
        const $first = $modal.find('form')
            .find(FOCUSABLE_MODAL_SELECTOR)
            .not('.dropdown-menu .custom-select-display')
            .not('.searchBox')
            .first();
        if ($first.length) {
            $first.trigger('focus');
            return true;
        }
        return false;
    };

    if (focusFirst())
        return;

    const body = $modal.find('.modal-body').get(0);
    if (!body)
        return;

    const observer = new MutationObserver(() => {
        if (focusFirst())
            observer.disconnect();
    });
    observer.observe(body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 4000);
});

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
