class commentAPI {
    constructor(setAPI, setID) {
        this.api = setAPI;
        this.comment_id = setID;
    }

    async get() {
        if (!this.comment_id)
            throw new Error("You must specify a comment ID.");

        this.api.connect();

        var c = await this.api.schemas.Comments.model.findById(this.comment_id);
        if (!c)
            throw new Error("No comment found with the specified ID.");

        return c;
    }
}

module.exports = (setAPI, setID) => new commentAPI(setAPI, setID);
