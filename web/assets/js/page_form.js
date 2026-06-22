import { FormsController } from './modules/forms_controller.js';
import { I18n } from './i18n/i18n.js';

$(document).ready(() =>
{
    if (!window.structbxI18n)
    {
        window.structbxI18n = new I18n();
    }
    window.structbxI18n.translateDOM();

    new FormsController().init();
});
