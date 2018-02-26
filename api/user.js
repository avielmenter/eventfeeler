class userAPI {
    constructor(setAPI, setID) {
        this.api = setAPI;
        this.user_id = setID;
    }

    async get() {
        if (!this.user_id)
            throw new Error("You must specify a user ID.");

        this.api.connect();

        var u = await this.api.schemas.Users.model.findById(this.user_id);
        if (!u)
            throw new Error("No user found with the specified ID.");

        return u;
    }
}

module.exports = (setAPI, setID) => new userAPI(setAPI, setID);
