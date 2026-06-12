export class Endpoint{
    async currentUser(){
        return await new wtools.Request("/api/general/permissions/current/read").Exec_();
    }
}