export class ViewFilter{
    async readAll(table_identifier, view_identifier){
        return await new wtools.Request(`/api/tables/filters/read?table-identifier=${table_identifier}&view-identifier=${view_identifier}`).Exec_();
    }
    async add(table_identifier, view_identifier, column_identifier, op, value, is_active){
        const data = new FormData();
        data.append('table-identifier', table_identifier);
        data.append('view-identifier', view_identifier);
        data.append('column-identifier', column_identifier);
        data.append('op', op);
        data.append('value', value);
        data.append('is-active', is_active ? 1 : 0);

        return await new wtools.Request("/api/tables/filters/add", "POST", data, false).Exec_();
    }
    async modify(identifier, table_identifier, view_identifier, column_identifier, op, value, is_active){
        const data = new FormData();
        data.append('identifier', identifier);
        data.append('table-identifier', table_identifier);
        data.append('view-identifier', view_identifier);
        data.append('column-identifier', column_identifier);
        data.append('op', op);
        data.append('value', value);
        data.append('is-active', is_active ? 1 : 0);

        return await new wtools.Request("/api/tables/filters/modify", "PUT", data, false).Exec_();
    }
    async modifyPosition(identifier, view_identifier, filterPrev, filterNext){
        const data = new FormData();
        data.append('identifier', identifier);
        data.append('view-identifier', view_identifier);
        if(filterPrev != undefined)
            data.append('filterPrev', filterPrev);
        if(filterNext != undefined)
            data.append('filterNext', filterNext);

        return await new wtools.Request("/api/tables/filters/position/modify", "PUT", data, false).Exec_();
    }
    async delete(identifier, view_identifier){
        return await new wtools.Request(`/api/tables/filters/delete?identifier=${identifier}&view-identifier=${view_identifier}`, 'DEL').Exec_();
    }
}