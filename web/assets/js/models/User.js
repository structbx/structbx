export class User{
    async current(){
        return await new wtools.Request("/api/general/users/current/read").Exec_();
    }
}