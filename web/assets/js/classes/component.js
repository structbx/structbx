export class ComponentTypes
{
    static get BLOCK() { return 'block'; }
    static get MODAL() { return 'modal'; }
    static get DROPDOWN() { return 'dropdown'; }
}

export class Component
{
    constructor(identifier, type = ComponentTypes.MODAL)
    {
        this.identifier = identifier;
        this.notifications = `${identifier} .notifications`;
        this.type = type;
    }

    ClearNotifications_()
    {
        $(this.notifications).html('');
    }

    CloseModal_()
    {
        $(this.identifier).modal('hide');
    }

    ResetForms_()
    {
        $(`${this.identifier} form`).each((i, form) => form.reset());
    }
}