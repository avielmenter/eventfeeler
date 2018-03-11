class categoriesAPI {
	constructor(setAPI, setQuery) {
		this.api = setAPI;
		this.query = setQuery;
	}

	async get() {
		this.api.connect();

		var categories = await this.api.schemas.Events.model.find({}).distinct('categories');
		categories.sort();

		return categories;
	}
}

module.exports = (setAPI, setQuery) => new categoriesAPI(setAPI, setQuery);