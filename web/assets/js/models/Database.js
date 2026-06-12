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
    async add(name, description){
        const data = new FormData();
        data.append('name', name);
        data.append('description', description);

        return await new wtools.Request("/api/databases/add", "POST", data, false).Exec_();
    }
}
