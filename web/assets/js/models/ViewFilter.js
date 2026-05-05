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
}