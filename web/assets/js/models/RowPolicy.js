export class RowPolicy{
    async read(table_identifier){
        return await new wtools.Request(`/api/tables/row-policy/read?table-identifier=${table_identifier}`).Exec_();
    }
    async readByIdentifier(identifier){
        return await new wtools.Request(`/api/tables/row-policy/read/identifier?identifier=${identifier}`).Exec_();
    }
    async add(data){
        return await new wtools.Request("/api/tables/row-policy/add", "POST", data, false).Exec_();
    }
    async modify(data){
        return await new wtools.Request("/api/tables/row-policy/modify", "PUT", data, false).Exec_();
    }
    async delete(identifier, table_identifier){
        return await new wtools.Request(`/api/tables/row-policy/delete?identifier=${identifier}&table-identifier=${table_identifier}`, "DEL").Exec_();
    }
}
