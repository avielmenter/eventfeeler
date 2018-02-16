class tweets {
    constructor(setAPI) {
        this.api = setAPI;
        this.lat = 33.6459816;      // coordinates for the center of Aldritch park
        this.long = -117.8427147;
        this.distance = 1000;

        this.since = new Date('2000-01-01');
        this.until = new Date('2000-01-02');
    }

    getURL() {
        var url = this.api.TWITTER_API + "1.1/search/tweets.json?q=";
        url += "&since=" + this.since + "&until=" + this.until;
        url += "&geocode=" + this.lat + "," + this.long + "," + this.distance;

        return url;
    }

    async get() {
        var url = this.getURL();
        var response = await axios.get(url);

        return response.data;
    }
}

module.exports = (setAPI) => new tweets(setAPI);
