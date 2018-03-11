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

    async post(req) {
        var user = req.user;
        var comment = req.body;

        if (!comment.text || !user || !comment.event_id)
            throw new Error("You must specify comment text, a comment user, and an associated event to post a comment.");

        comment.user_id = user._id;
        comment.comment_time = new Date();

        var c = null;

        if (!this.comment_id) {
            c = await this.api.schemas.Comments.model.create(comment);
            if (!c || c.user_id != comment.user_id)
                throw new Error("No comment matching the specified ID was made by the specified user.");

            await c.update({ comment_id: { orig_id: c._id, from: 'EventFeeler' } });
        }
        else {
            c = await this.api.schemas.Comments.model.findByIdAndUpdate(this.comment_id, comment, {new: true});
        }

        var c = await this.api.schemas.Comments.calculateSentiment(c);
        var avg = await this.api.schemas.Comments.averageSentimentForEvent(c.event_id);
        await this.api.schemas.Events.model.findByIdAndUpdate(c.event_id, { $set: { sentiment: avg } });

        return c;
    }
}

module.exports = (setAPI, setID) => new commentAPI(setAPI, setID);
