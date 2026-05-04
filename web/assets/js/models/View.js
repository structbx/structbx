export class View{
    async readAll(table_identifier){
        return await new wtools.Request(`/api/tables/views/read?table-identifier=${table_identifier}`).Exec_();
    }
    async readByIdentifier(view_identifier, table_identifier){
        return await new wtools.Request(`/api/tables/views/read/identifier?identifier=${view_identifier}&table-identifier=${table_identifier}`).Exec_();
    }
    async add(view_name, table_identifier){
        const data = new FormData();
        data.append('name', view_name);
        data.append('table-identifier', table_identifier);

        return await new wtools.Request("/api/tables/views/add", "POST", data, false).Exec_();
    }
    async modify(view_name, view_identifier){
        const data = new FormData();
        data.append('name', view_name);
        data.append('identifier', view_identifier);

        return await new wtools.Request("/api//tables/views/modify", "PUT", data, false).Exec_();
    }
    async delete(view_identifier){
        return await new wtools.Request(`/api/tables/views/delete?identifier=${view_identifier}`, "DEL").Exec_();
    }
}