class commentsAPI {
    constructor(setAPI, setQuery) {
        this.api = setAPI;
        this.query = setQuery;
    }

    async get() {
        return [];
    }
}

module.exports = (setAPI, setQ) => new commentsAPI(setAPI, setQ);
