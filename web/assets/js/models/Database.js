export class Database{
    async current(){
        return new wtools.Request("/api/databases/read/id").Exec_();
    }
}