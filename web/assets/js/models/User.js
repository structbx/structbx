export class User{
    async current(){
        return new wtools.Request("/api/general/users/current/read").Exec_();
    }
}