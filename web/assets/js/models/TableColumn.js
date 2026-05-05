export class TableColumn{
    async read(table_identifier, view_identifier){
        return await new wtools.Request(`/api/tables/columns/read?table-identifier=${table_identifier}&view-identifier=${view_identifier}`).Exec_();
    }
    async readByIdentifier(identifier, table_identifier){
        return await new wtools.Request(`/api/tables/columns/read/identifier?identifier=${identifier}&table-identifier=${table_identifier}`).Exec_();
    }
    async add(table_identifier, name, column_type, description, required, default_value, link_to){
        let data = new FormData();
        data.append("table-identifier", table_identifier);
        data.append("name", name);
        data.append("column_type", column_type);
        data.append("description", description);
        data.append("required", required);
        data.append("default_value", default_value);
        data.append("link_to", link_to);
        return await new wtools.Request("/api/tables/columns/add", "POST", data, false).Exec_();
    }
    async modify(identifier, table_identifier, name, column_type, description, required, default_value, link_to){
        let data = new FormData();
        data.append("identifier", identifier);
        data.append("table-identifier", table_identifier);
        data.append("name", name);
        data.append("column_type", column_type);
        data.append("description", description);
        data.append("required", required);
        data.append("default_value", default_value);
        data.append("link_to", link_to);
        return await new wtools.Request("/api/tables/columns/modify", "PUT", data, false).Exec_();
    }
    async modifyPosition(identifier, view_identifier, columnPrev, columnNext){
        let data = new FormData();
        data.append('identifier', identifier);
        data.append('view-identifier', view_identifier);
        if(columnPrev != undefined)
            data.append('columnPrev', columnPrev);
        if(columnNext != undefined)
            data.append('columnNext', columnNext);

        return await new wtools.Request("/api/tables/columns/position/modify", "PUT", data, false).Exec_();
    }
    async delete(identifier, table_identifier){
        return await new wtools.Request(`/api/tables/columns/delete?identifier=${identifier}&table-identifier=${table_identifier}`, "DEL").Exec_();
    }
}