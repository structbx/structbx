export class Database{
    async current(){
        return await new wtools.Request("/api/databases/read/identifier").Exec_();
    }
    async read(){
        return await new wtools.Request("/api/databases/read").Exec_();
    }
    async change(database_id){
        const data = new FormData();
        data.append("id_database", database_id);

        return await new wtools.Request("/api/databases/change", "POST", data).Exec_();
    }
}