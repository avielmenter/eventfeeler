var axios = require('axios');

var fbPaging = {};

fbPaging.next = obj => {
    return new Promise((resolve, reject) => {
        if (obj.paging === undefined || obj.paging.next === undefined)
        {
            resolve(null);
            return;
        }

        console.log("Getting next page: " + obj.paging.next);

        axios.get(
            obj.paging.next
        ).then(o => {
            resolve(o.data);
        }).catch(error => {
            reject(error);
        });
    });
}

module.exports = fbPaging;
