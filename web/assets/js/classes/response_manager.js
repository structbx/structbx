class ResponseManager
{
    constructor(response, component, target)
    {
        this.response = response;
        this.component = component;
        if(target == '')
            this.target = '';
        else
            this.target = ' (' + target + ')';
    }
    Verify_()
    {
        let randomSuffix = GenerateRandomName(5);
        if(this.response.status >= 200 && this.response.status < 300)
        {
            return true;
        }
        else if(this.response.status == 401)
        {
            this.Warning_().Show_(`
                <p>
                    No tiene permisos para acceder a este recurso. 
                    <a href="" class="btn" data-bs-toggle="collapse" data-bs-target="#notification_collapse_${randomSuffix}" aria-expanded="false" aria-controls="notification_collapse_${randomSuffix}">
                        <i class="fas fa-caret-down"></i>
                    </a>
                </p>
                <div class="collapse" id="notification_collapse_${randomSuffix}">
                    <div class="card card-body">
                        <ul>
                            <li>Target: ${this.target}</li>
                            <li>Server response: ${this.response.body.message == undefined ? "" : this.response.body.message}</li>
                        </ul>
                    </div>
                </div>
            `);
            return false;
        }
        if(this.response.status >= 500 && this.response.status < 600)
        {
            if(this.response != undefined && this.response.body != undefined && this.response.body.message != undefined)
            {
                const error_message = this.response.body.message;
                this.Error_().Show_(`
                    <p>
                        Hubo un error en la comunicaci&oacute;n con el servidor. 
                        <a href="" class="btn" data-bs-toggle="collapse" data-bs-target="#notification_collapse_${randomSuffix}" aria-expanded="false" aria-controls="notification_collapse_${randomSuffix}">
                            <i class="fas fa-caret-down"></i>
                        </a>
                    </p>
                    <div class="collapse" id="notification_collapse_${randomSuffix}">
                        <div class="card card-body">
                            <ul>
                                <li>Target: ${this.target}</li>
                                <li>Server response: ${error_message == undefined ? "" : error_message}</li>
                            </ul>
                        </div>
                    </div>
                `);
            }
            return false;
        }
        else
        {
            if(this.response != undefined && this.response.body != undefined && this.response.body.message != undefined)
            {
                const error_message = this.response.body.message;
                this.Warning_().Show_(`
                    <p>
                        Hubo un error al realizar la operaci&oacute;n. 
                        <a href="" class="btn" data-bs-toggle="collapse" data-bs-target="#notification_collapse_${randomSuffix}" aria-expanded="false" aria-controls="notification_collapse_${randomSuffix}">
                            <i class="fas fa-caret-down"></i>
                        </a>
                    </p>
                    <div class="collapse" id="notification_collapse_${randomSuffix}">
                        <div class="card card-body">
                            <ul>
                                <li>Target: ${this.target}</li>
                                <li>Server response: ${error_message == undefined ? "" : error_message}</li>
                            </ul>
                        </div>
                    </div>
                `);
            }
            return false;
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