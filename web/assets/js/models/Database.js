export class Database{
    async current(){
        return new wtools.Request("/api/databases/read/id").Exec_();
    }
    async read(){
        return new wtools.Request("/api/databases/read").Exec_();
    }
    async change(database_id){
        const data = new FormData();
        data.append("id_database", database_id);

        return new wtools.Request("/api/databases/change", "POST", data).Exec_();
    }
}