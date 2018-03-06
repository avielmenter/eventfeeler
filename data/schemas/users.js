var mongoose = require('mongoose');

var PROFILE_PROVIDERS = ['twitter', 'facebook'];

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
                image_url : String      // URL of the user's profile image
            },
            facebook : {
                facebook_id : {
                    type: String,
                    trim: true,
                    unique: true,
                    sparse: true
                },
                display_name : String
            },
            attending : [String]        // list of IDs of events the user is attending
        });

        this.model = mongoose.model('users', this.schema);
    }

    hasProvider(u, provider) {
        return u && u[provider] && u[provider][provider + '_id'] && u[provider][provider + '_id'].trim() != '';
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

    fromFacebook(profile) {
        if (profile.provider !== 'facebook')
            return null;

        var u = {
            facebook: {
                facebook_id: profile.id,
                display_name: profile.displayName
            }
        };

        return u;
    }

    fromProfile(profile) {
        var u = {};
        switch (profile.provider) {
            case 'twitter':     u = this.fromTwitter(profile); break;
            case 'facebook':    u = this.fromFacebook(profile); break;
            default:            throw Error("Profile must be from Twitter or Facebook.");
        }

        return u;
    }

    async save(profile) {
        var provider = profile.provider;

        if (provider !== 'twitter' && provider !== 'facebook')
            throw Error("Profile is from unrecognized provider '" + provider + "'");

        var u = this.fromProfile(profile);

        var query = {};
        query[provider + '.' + provider + '_id'] = profile.id;

        var newObj = {};
        newObj[provider] = u[provider];

        return await this.model.findOneAndUpdate(
            query,
            { $set: newObj },
            { upsert: true, new: true }
        );
    }

    async load(id) {
        return await this.model.findById(id);
    }

    async merge(old, profile) {
        if (old[profile.provider] && old[profile.provider][profile.provider + '_id'])
            throw new Error("You cannot merge a " + profile.provider + " profile into this user, as this user already has one defined.");

        var profileID = profile.provider + '.' + profile.provider + '_id';

        var u = {};
        u.primary_profile = profile.provider;
        u[profile.provider] = this.fromProfile(profile)[profile.provider];

        var query = {};
        query[profileID] = profile.id;

        var existing = await this.model.findOne(query);

        for (let provider of PROFILE_PROVIDERS) {
            if (this.hasProvider(old, provider) && this.hasProvider(existing, provider) && old[provider][provider + '_id'] != existing[provider][provider + '_id'])
                throw new Error("There is already another user with this " + profile.provider + " profile.");
            else if (this.hasProvider(old, provider) && provider != profile.provider)
                u[provider] = old.toObject()[provider];
            else if (this.hasProvider(existing, provider) && provider != profile.provider)
                u[provider] = e.toObject()[provider];
        }

        var existingUpdate = {};
        existingUpdate[profileID] = 'delme_' + profile.id;
        await this.model.findByIdAndUpdate(existing._id, { $set: existingUpdate });

        try {
            var newUser = await this.model.findByIdAndUpdate(old._id, u, { new: true });

            var comments = require('./comments');
            await comments.model.update(
                { user_id:  existing._id },
                { $set: { user_id: newUser._id } }
            );
        } catch (err) {
            existingUpdate[profileID] = profile.id;
            await this.model.findByIdAndUpdate(existing._id, { $set: existingUpdate });
            
            throw err;
        }

        await existing.remove();

        return newUser;
    }
}

module.exports = new Users();
