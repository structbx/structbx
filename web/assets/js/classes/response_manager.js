
import * as tools from '../classes/tools.js';

export class ResponseManager
{
    constructor(response, component, targetKey)
    {
        this.response = response;
        this.component = component;
        this.targetKey = targetKey || '';
    }

    getI18n_()
    {
        return window.structbxI18n || null;
    }

    getDisplayMessage_()
    {
        const i18n = this.getI18n_();
        if (!i18n || i18n.getLang() === 'en')
        {
            return this.response.body.message;
        }
        if (this.response.body.error_code)
        {
            const translated = i18n.translateError(this.response.body.error_code);
            if (translated) return translated;
        }
        return this.response.body.message;
    }

    _parseErrorCode_(errorCode)
    {
        if (!errorCode) return null;
        const parts = errorCode.split(':');
        if (parts.length < 4) return null;
        return {
            file: parts[0] || '',
            function: parts[1] || '',
            task: parts[2] || '',
            errorId: parts.slice(3).join(':') || ''
        };
    }

    _getCategoryFromFile_(file)
    {
        if (!file) return null;
        const map = {
            'databases.cpp':      { label: 'Databases',  cls: 'bg-primary' },
            'users.cpp':          { label: 'Users',      cls: 'bg-info' },
            'groups.cpp':         { label: 'Groups',     cls: 'bg-success' },
            'permissions.cpp':    { label: 'Permissions',cls: 'bg-warning text-dark' },
            'tables.cpp':         { label: 'Tables',     cls: 'bg-secondary' },
            'backend_handler.cpp':{ label: 'Auth',       cls: 'bg-danger' },
            'login_handler.cpp':  { label: 'Login',      cls: 'bg-danger' },
            'root_handler.cpp':   { label: 'Server',     cls: 'bg-dark' },
            'general.cpp':        { label: 'General',    cls: 'bg-secondary' },
            'forms.cpp':          { label: 'Forms',      cls: 'bg-info' },
            'action.cpp':         { label: 'Action',     cls: 'bg-primary' },
            'function.cpp':       { label: 'Action',     cls: 'bg-primary' }
        };
        return map[file] || { label: file.replace('.cpp', ''), cls: 'bg-secondary' };
    }

    _getStatusBadgeClass_(status)
    {
        if (status >= 200 && status < 300) return 'bg-success';
        if (status >= 300 && status < 400) return 'bg-info';
        if (status >= 400 && status < 500) return 'bg-warning text-dark';
        if (status >= 500 && status < 600) return 'bg-danger';
        return 'bg-secondary';
    }

    Verify_()
    {
        let randomSuffix = tools.randomGenerator(5);
        const i18n = this.getI18n_();
        const t = (key, params) => i18n ? i18n.t(key, params) : key;
        const displayMessage = this.getDisplayMessage_() || '';
        if(this.response.status >= 200 && this.response.status < 300)
        {
            return true;
        }
        else if(this.response.status == 401)
        {
            const title = i18n ? i18n.t('response.no_permissions') : 'No tiene permisos para acceder a este recurso.';
            this._showErrorNotification_(randomSuffix, title, displayMessage);
            return false;
        }
        if(this.response.status >= 500 && this.response.status < 600)
        {
            if(this.response != undefined && this.response.body != undefined && this.response.body.message != undefined)
            {
                const title = i18n ? i18n.t('response.server_error') : 'Hubo un error en la comunicaci&oacute;n con el servidor.';
                this._showErrorNotification_(randomSuffix, title, displayMessage);
            }
            return false;
        }
        else
        {
            if(this.response != undefined && this.response.body != undefined && this.response.body.message != undefined)
            {
                const title = i18n ? i18n.t('response.operation_error') : 'Hubo un error al realizar la operaci&oacute;n.';
                this._showErrorNotification_(randomSuffix, title, displayMessage);
            }
            return false;
        }
    }

    _showErrorNotification_(randomSuffix, title, displayMessage)
    {
        const i18n = this.getI18n_();
        const t = (key, params) => i18n ? i18n.t(key, params) : key;

        const statusClass = this._getStatusBadgeClass_(this.response.status);
        let statusBadge = `<span class="badge ${statusClass} me-1">${this.response.status}</span>`;

        let parsed = null;
        let categoryBadge = '';
        let errorIdBadge = '';

        if (this.response.body && this.response.body.error_code)
        {
            parsed = this._parseErrorCode_(this.response.body.error_code);

            if (parsed)
            {
                const cat = this._getCategoryFromFile_(parsed.file);
                if (cat)
                {
                    categoryBadge = `<span class="badge ${cat.cls} ms-1">${cat.label}</span>`;
                }
                errorIdBadge = `<span class="badge bg-secondary ms-1">${parsed.errorId}</span>`;
            }
        }

        let targetDisplay = '';
        if (this.targetKey)
        {
            const resolved = t(this.targetKey);
            targetDisplay = ' (' + resolved + ')';
        }

        const labelError = t('response.error');
        const labelTarget = t('response.target');
        const labelHttpStatus = t('response.http_status');
        const labelErrorCode = t('response.error_code');
        const labelFile = t('response.file');
        const labelFunction = t('response.function_');
        const labelTask = t('response.task');
        const labelErrorId = t('response.error_id');

        let collapseContent = '';

        if (this.response.body && this.response.body.error_code && parsed)
        {
            collapseContent = `
                <div class="collapse" id="notification_collapse_${randomSuffix}">
                    <div class="card card-body p-2 small mt-1">
                        <ul class="list-unstyled mb-0 response-details-list">
                            <li><strong>${labelError}:</strong> ${title}</li>
                            <li><strong>${labelTarget}:</strong> ${targetDisplay}</li>
                            <li><strong>${labelHttpStatus}:</strong> ${this.response.status}</li>
                            <li><strong>${labelErrorCode}:</strong> <code>${this.response.body.error_code}</code></li>
                            <li><strong>${labelFile}:</strong> ${parsed.file}</li>
                            <li><strong>${labelFunction}:</strong> ${parsed.function}</li>
                            <li><strong>${labelTask}:</strong> ${parsed.task}</li>
                            <li><strong>${labelErrorId}:</strong> ${parsed.errorId}</li>
                        </ul>
                    </div>
                </div>`;
        }
        else
        {
            collapseContent = `
                <div class="collapse" id="notification_collapse_${randomSuffix}">
                    <div class="card card-body p-2 small mt-1">
                        <ul class="list-unstyled mb-0 response-details-list">
                            <li><strong>${labelError}:</strong> ${title}</li>
                            <li><strong>${labelTarget}:</strong> ${targetDisplay}</li>
                            <li><strong>${labelHttpStatus}:</strong> ${this.response.status}</li>
                        </ul>
                    </div>
                </div>`;
        }

        let html = `
            <p>
                ${statusBadge}
                ${displayMessage}
                ${categoryBadge}
                ${errorIdBadge}
                <a href="" class="btn btn-sm py-0" data-bs-toggle="collapse" data-bs-target="#notification_collapse_${randomSuffix}" aria-expanded="false" aria-controls="notification_collapse_${randomSuffix}">
                    <i class="fas fa-caret-down"></i>
                </a>
            </p>
            ${collapseContent}`;

        if(this.response.status >= 500 && this.response.status < 600)
        {
            this.Error_().Show_(html);
        }
        else
        {
            this.Warning_().Show_(html);
        }
    }

    Warning_()
    {
        if(this.component == '')
            return new wtools.Notification('WARNING');
        else
            return new wtools.Notification('WARNING', 0, this.component);
    }
    Error_()
    {
        if(this.component == '')
            return new wtools.Notification('ERROR');
        else
            return new wtools.Notification('ERROR', 0, this.component);
    }
}
