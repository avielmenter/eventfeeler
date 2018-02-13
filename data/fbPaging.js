var axios = require('axios');

var fbPaging = {};

fbPaging.next = async function(obj) {
    if (obj.paging === undefined || obj.paging.next === undefined)
        return null;

    try {
        var response = await axios.get(obj.paging.next);
        return response.data;
    } catch (e) {
        throw e;
    } 
}

module.exports = fbPaging;
