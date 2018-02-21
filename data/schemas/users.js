var mongoose = require('mongoose');

class Users {
    constructor() {
        this.schema = new mongoose.Schema({
            primary_profile : String,   // social media profile determining user's appearance on EventFeeler
            twitter : {                 // information about this user's twitter profile
                twitter_id : {          // User's ID on Twitter
                    type: String,
                    trim: true,
                    unique: true,
                    sparse: true
                },
                username : String,      // User's username on Twitter
                display_name : String,  // User's display name on Twitter
                image_url : String,     // URL of the user's profile image
            }
        });

        this.model = mongoose.model('users', this.schema);
    }

    fromTwitter(profile) {
        if (profile.provider !== 'twitter')
            return null;

        var u = {
            twitter: {
                twitter_id: profile.id,
                username: profile.username,
                display_name: profile.displayName,
                image_url: profile.photos.length > 0 ? profile.photos[0].value : undefined
            }
        };

        return u;
    }

    async save(profile) {
        if (profile.provider == 'twitter')
            return await this.saveFromTwitter(profile);
        throw Error("Profile is from unrecognized provider '" + profile.provider + "'");
    }

    async load(id) {
        return await this.model.findById(id);
    }

    async saveFromTwitter(profile) {
        if (profile.provider !== 'twitter')
            throw Error("You can only call saveFromTwitter on a twitter profile object.");

        var u = this.fromTwitter(profile);

        return await this.model.findOneAndUpdate(
            { 'twitter.twitter_id': profile.id },
            u,
            { upsert: true, new: true }
        );
    }

    async loadFromTwitter(twitter_id) {
        return await this.model.findOne({ twitter: { twitter_id: twitter_id } });
    }
}

module.exports = new Users();
