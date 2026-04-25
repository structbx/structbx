export class TablePermission{
    async read(){
        return await new wtools.Request("/api/tables/permissions/tables/read").Exec_();
    }
}