export class TablePermission{
    async read(table_identifier){
        return await new wtools.Request(`/api/tables/permissions/read?table-identifier=${table_identifier}`).Exec_();
    }
    async readCurrent(){
        return await new wtools.Request(`/api/tables/permissions/current/read`).Exec_();
    }
    async readByIdentifier(identifier, table_identifier){
        return await new wtools.Request(`/api/tables/permissions/read/identifier?identifier=${identifier}&table-identifier=${table_identifier}`).Exec_();
    }
    async readUsersOut(table_identifier){
        return await new wtools.Request(`/api/tables/permissions/users/out/read?table-identifier=${table_identifier}`).Exec_();
    }
    async add(data){
        return await new wtools.Request("/api/tables/permissions/add", "POST", data, false).Exec_();
    }
    async modify(data){
        return await new wtools.Request("/api/tables/permissions/modify", "PUT", data, false).Exec_();
    }
    async delete(identifier, table_identifier){
        return await new wtools.Request(`/api/tables/permissions/delete?identifier=${identifier}&table-identifier=${table_identifier}`, "DEL").Exec_();
    }
}