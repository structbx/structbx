import { errorCodes } from './errorCodes.js';
import { uiTexts } from './uiTexts.js';

export class I18n
{
    constructor()
    {
        this.lang = localStorage.getItem('structbx_lang') || 'en';
        this.errorCodes = errorCodes;
        this.uiTexts = uiTexts;
    }

    t(key, params = {})
    {
        const entry = this.uiTexts[key] || this.errorCodes[key];
        if (!entry) return key;
        let text = entry[this.lang] || entry['en'];
        if (!text) return key;
        for (const [k, v] of Object.entries(params))
            text = text.replace(new RegExp(`\\$\\{${k}\\}`, 'g'), v);
        return text;
    }

    translateError(errorCode, fallbackMessage = '')
    {
        const entry = this.errorCodes[errorCode];
        if (!entry) return fallbackMessage;
        return entry[this.lang] || entry['en'] || fallbackMessage;
    }

    setLang(lang)
    {
        if (lang !== 'en' && lang !== 'es') return;
        this.lang = lang;
        localStorage.setItem('structbx_lang', lang);
        location.reload();
    }

    getLang()
    {
        return this.lang;
    }

    translateDOM()
    {
        if (this.lang !== 'es') return;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const text = this.t(key);
            if (text && text !== key) el.textContent = text;
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.dataset.i18nHtml;
            const html = this.t(key);
            if (html && html !== key) el.innerHTML = html;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            const text = this.t(key);
            if (text && text !== key) el.placeholder = text;
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.dataset.i18nTitle;
            const text = this.t(key);
            if (text && text !== key) el.title = text;
        });
        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.dataset.i18nAriaLabel;
            const text = this.t(key);
            if (text && text !== key) el.setAttribute('aria-label', text);
        });
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.dataset.i18nAlt;
            const text = this.t(key);
            if (text && text !== key) el.setAttribute('alt', text);
        });
        document.documentElement.lang = this.lang;
    }
}
