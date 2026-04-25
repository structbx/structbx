export class Table{
    async read(){
        return await new wtools.Request("/api/tables/read").Exec_();
    }
}