export class User{
    async readAll(){
        return await new wtools.Request("/api/general/users/read").Exec_();
    }
    async readByIdentifier(identifier){
        return await new wtools.Request(`/api/general/users/read/identifier?identifier=${identifier}`).Exec_();
    }
    async current(){
        return await new wtools.Request("/api/general/users/current/read").Exec_();
    }
}