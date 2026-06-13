export class Form{
    async readTableInfo(table_identifier){
        return await new wtools.Request(`/api/forms/tables/read/identifier?table-identifier=${table_identifier}`).Exec_();
    }
    async readColumns(table_identifier){
        return await new wtools.Request(`/api/forms/columns/read?table-identifier=${table_identifier}`).Exec_();
    }
    async addData(data){
        return await new wtools.Request("/api/forms/tables/data/add", "POST", data, false).Exec_();
    }
}
