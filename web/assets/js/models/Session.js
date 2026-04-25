export class Session{
    async login(username, password){
        // Data collection
        const data = new FormData();
        data.append('username', username);
        data.append('password', password);

        // Request
        return await new wtools.Request("/api/auth/login", "POST", data, false).Exec_();
    }
    async logout(){
        return await new wtools.Request("/api/auth/logout", "POST").Exec_();
    }
}