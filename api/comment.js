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

    async post(comment) {
        if (!comment.text || !comment.user_id)
            throw new Error("You must specify comment text and a comment user to post a comment.");

        var c = null;

        if (!this.comment_id) {
            c = await this.api.schemas.Comments.model.create(comment);
            await c.update({ comment_id: { orig_id: c._id, from: 'EventFeeler' } });
        }
        else {
            c = await this.api.schemas.Comments.model.findByIdAndUpdate(this.comment_id, comment, {new: true});
        }

        return c;
    }
}

module.exports = (setAPI, setID) => new commentAPI(setAPI, setID);
