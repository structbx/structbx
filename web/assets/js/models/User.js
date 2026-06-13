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
    async add(username, password, id_group){
        const data = new FormData();
        data.append('username', username);
        data.append('password', password);
        data.append('id_group', id_group);

        return await new wtools.Request("/api/general/users/add", "POST", data, false).Exec_();
    }
    async modify(identifier, username, status, id_group, password = ''){
        const data = new FormData();
        data.append('identifier', identifier);
        data.append('username', username);
        data.append('status', status);
        data.append('id_group', id_group);
        data.append('password', password);

        return await new wtools.Request("/api/general/users/modify", "PUT", data, false).Exec_();
    }
    async delete(identifier){
        return await new wtools.Request(`/api/general/users/delete?identifier=${identifier}`, "DEL").Exec_();
    }
    async modifyCurrentUsername(username){
        const data = new FormData();
        data.append('username', username);

        return await new wtools.Request("/api/general/users/current/username/modify", "PUT", data, false).Exec_();
    }
    async changePassword(current_password, new_password, new_password2){
        const data = new FormData();
        data.append('current_password', current_password);
        data.append('new_password', new_password);
        data.append('new_password2', new_password2);

        return await new wtools.Request("/api/general/users/current/password/modify", "PUT", data, false).Exec_();
    }
}
