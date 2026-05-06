export class ViewSort{
    async readAll(table_identifier, view_identifier){
        return await new wtools.Request(`/api/tables/sorts/read?table-identifier=${table_identifier}&view-identifier=${view_identifier}`).Exec_();
    }
    async add(table_identifier, view_identifier, column_identifier, sort, is_active){
        const data = new FormData();
        data.append('table-identifier', table_identifier);
        data.append('view-identifier', view_identifier);
        data.append('column-identifier', column_identifier);
        data.append('sort', sort);
        data.append('is-active', is_active ? 1 : 0);

        return await new wtools.Request("/api/tables/sorts/add", "POST", data, false).Exec_();
    }
    async modify(identifier, table_identifier, view_identifier, column_identifier, sort, is_active){
        const data = new FormData();
        data.append('identifier', identifier);
        data.append('table-identifier', table_identifier);
        data.append('view-identifier', view_identifier);
        data.append('column-identifier', column_identifier);
        data.append('sort', sort);
        data.append('is-active', is_active ? 1 : 0);

        return await new wtools.Request("/api/tables/sorts/modify", "PUT", data, false).Exec_();
    }
    async modifyVisible(identifier, view_identifier, is_active){
        const data = new FormData();
        data.append('identifier', identifier);
        data.append('view-identifier', view_identifier);
        data.append('is-active', is_active ? 1 : 0);

        return await new wtools.Request("/api/tables/sorts/visible/modify", "PUT", data, false).Exec_();
    }
    async modifyPosition(identifier, view_identifier, sortPrev, sortNext){
        const data = new FormData();
        data.append('identifier', identifier);
        data.append('view-identifier', view_identifier);
        if(sortPrev != undefined)
            data.append('sortPrev', sortPrev);
        if(sortNext != undefined)
            data.append('sortNext', sortNext);

        return await new wtools.Request("/api/tables/sorts/position/modify", "PUT", data, false).Exec_();
    }
    async delete(identifier, view_identifier){
        return await new wtools.Request(`/api/tables/sorts/delete?identifier=${identifier}&view-identifier=${view_identifier}`, 'DEL').Exec_();
    }
}