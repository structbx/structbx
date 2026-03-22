class TableElements
{
    constructor(element_type, data, table_identifier)
    {
        this.element_type = element_type;
        this.data = data;
        this.table_identifier = table_identifier;
    }
    Get_()
    {
        let return_element;
        switch(this.element_type)
        {
            case "text":
            {
                return_element = this.Text_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.length, "")
                    ,wtools.IFUndefined(this.data.required, "")
                    ,wtools.IFUndefined(this.data.value, "")
                );
                break;
            }
            case "long-text":
            {
                return_element = this.LongText_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.length, "")
                    ,wtools.IFUndefined(this.data.required, "")
                    ,wtools.IFUndefined(this.data.value, "")
                );
                break;
            }
            case "int-number":
            {
                return_element = this.IntNumber_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.length, "")
                    ,wtools.IFUndefined(this.data.required, "")
                    ,wtools.IFUndefined(this.data.value, "")
                );
                break;
            }
            case "decimal-number":
            {
                return_element = this.DecimalNumber_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.length, "")
                    ,wtools.IFUndefined(this.data.required, "")
                    ,wtools.IFUndefined(this.data.value, "")
                );
                break;
            }
            case "date":
            {
                return_element = this.Date_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.required, "")
                    ,wtools.IFUndefined(this.data.value, "")
                );
                break;
            }
            case "time":
            {
                return_element = this.Time_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.required, "")
                    ,wtools.IFUndefined(this.data.value, "")
                );
                break;
            }
            case "file":
            {
                return_element = this.File_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.required, "")
                    ,wtools.IFUndefined(this.data.value, "")
                );
                break;
            }
            case "image":
            {
                return_element = this.Image_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.required, "")
                    ,wtools.IFUndefined(this.data.value, "")
                );
                break;
            }
            case "selection":
            {
                return_element = this.Selection_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.required, "")
                );
                break;
            }
            case "user":
            {
                return_element = this.User_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.required, "")
                );
                break;
            }
            default:
            {
                return_element = this.Text_
                (
                    wtools.IFUndefined(this.data.identifier, "")
                    ,wtools.IFUndefined(this.data.length, "")
                    ,wtools.IFUndefined(this.data.required, "")
                    ,wtools.IFUndefined(this.data.value, "")
                );
                break;
            }
        }

        return return_element;
    }
    GetIcon_(white = false)
    {
        let return_element;
        switch(this.element_type)
        {
            case "text":
            {
                return_element = '<i class="fas fa-font';
                break;
            }
            case "long-text":
            {
                return_element = '<i class="fas fa-text-height';
                break;
            }
            case "int-number":
            {
                return_element = '<i class="fas fa-sort-numeric-up';
                break;
            }
            case "decimal-number":
            {
                return_element = '<i class="fas fa-sort-numeric-up';
                break;
            }
            case "date":
            {
                return_element = '<i class="fas fa-calendar-alt';
                break;
            }
            case "time":
            {
                return_element = '<i class="fas fa-clock';
                break;
            }
            case "file":
            {
                return_element = '<i class="fas fa-file';
                break;
            }
            case "image":
            {
                return_element = '<i class="fas fa-image';
                break;
            }
            case "selection":
            {
                return_element = '<i class="fas fa-hand-pointer';
                break;
            }
            case "user":
            {
                return_element = '<i class="fas fa-users';
                break;
            }
            default:
            {
                return_element = '<i class="fas fa-font';
                break;
            }
        }
        if(white)
            return_element += ' me-4 text-white"></i>';
        else
            return_element += ' me-4 text-secondary"></i>';

        return return_element;
    }
    Text_(identifier, length, required, value)
    {
        return `
            <td scope="row">
                <input class="form-control" type="text" name="${identifier}" maxlength="${length}" 
                ${required == '1' ? 'required' : ''} value="${value}"/>
            </td>
        `;
    }
    LongText_(identifier, length, required, value)
    {
        return `
            <td scope="row">
                <textarea class="form-control" name="${identifier}" maxlength="${length}" 
                ${required == '1' ? 'required' : ''}>${value}</textarea>
            </td>
        `;
    }
    IntNumber_(identifier, length, required, value)
    {
        return `
            <td scope="row">
                <input class="form-control" type="number" name="${identifier}" maxlength="${length}"
                ${required == '1' ? 'required' : ''} value="${value}"/>
            </td>
        `;
    }
    DecimalNumber_(identifier, length, required, value)
    {
        let length_array = length.split(',');
        let maxlength = "";
        let step_l = 1;
        let step = "0.1";
        if(length_array[0] != undefined)
            maxlength = length_array[0];

        if(length_array[1] != undefined)
            step_l = length_array[1];

        try
        {
            let p = Math.pow(10, step_l);
            step = 1/p;
        }
        catch(error)
        {
            step = "0.1";
        }

        return `
            <td scope="row">
                <input class="form-control" type="number" name="${identifier}" maxlength="${maxlength}" 
                ${required == '1' ? 'required' : ''} value="${value}" step="${step}"/>
            </td>
        `;
    }
    Date_(identifier, required, value)
    {
        if(value != undefined || value != "")
        {
            let date = new Date(value);
            let day = ("0" + date.getDate()).slice(-2);
            let month = ("0" + (date.getMonth() + 1)).slice(-2);
            let today = date.getFullYear() + "-" + (month) + "-" + (day) ;
            
            value = today;
        }

        return `
            <td scope="row">
                <input class="form-control" type="date" name="${identifier}" 
                ${required == '1' ? 'required' : ''} value="${value}"/>
            </td>
        `;
    }
    Time_(identifier, required, value)
    {
        return `
            <td scope="row">
                <input class="form-control" type="time" name="${identifier}" 
                ${required == '1' ? 'required' : ''} value="${value}"/>
            </td>
        `;
    }
    File_(identifier, required, value)
    {
        let result = `
            <td scope="row">
                <input class="form-control" type="file" name="${identifier}" 
                ${required == '1' ? 'required' : ''}/>
        `;
        if(value != undefined && value != '')
        {
            result += `
                <a class="link mt-2" target="_blank" href="/api/tables/data/file/read?filepath=${value}&table-identifier=${this.table_identifier}">Ver</a>
                <td>
            `;
        }
        else
            result += '</td>';

        return result;
    }
    Image_(identifier, required, value)
    {
        let result = `
            <td scope="row">
                <input class="form-control" type="file" name="${identifier}" 
                    ${required == '1' ? 'required' : ''}/>
        `;
        if(value != undefined && value != '')
        {
            result += `
                    <a class="link mt-2" target="_blank" href="/api/tables/data/file/read?filepath=${value}&table-identifier=${this.table_identifier}">
                        <img class="" src="/api/tables/data/file/read?filepath=${value}&table-identifier=${this.table_identifier}" alt="${value}" width="100px">
                    </a>
                </td>`;
        }
        else
            result += '</td>';

        return result;
    }
    Selection_(identifier, required)
    {
        return `
            <td scope="row">
                <select class="form-select" name="${identifier}" ${required == '1' ? 'required' : ''}>
                </select>
            </td>
        `;
    }
    User_(identifier, required)
    {
        return `
            <td scope="row">
                <select class="form-select" name="${identifier}" ${required == '1' ? 'required' : ''}>
                </select>
            </td>
        `;
    }
}