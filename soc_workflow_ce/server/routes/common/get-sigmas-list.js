let $cf = require('./../../common/function');

let commonGetByBody = require('./../../models/common/get-by-body');

let emptyResult = {
    success: false,
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
 */
export default function (server, options) {
    const index = (req) => {
        return (async function () {
            return await new Promise(function (reply) {
                commonGetByBody(server, req, 'sigma_doc', {"size": 10000}).then(function (response) {
                    response = response['hits'] || [];
                    response = response['hits'] || [];
                    let data = {};
                    response.forEach(function (row) {
                        if (typeof row['_source'] != 'undefined' && $cf.isString(row['_source']['title'])) {
                            data[row['_id']] = row['_source']['title'];
                        }
                    });

                    return reply({
                        data: data,
                        success: true
                    });
                }).catch(function (e) {
                    console.log(e);
                    return reply(emptyResult);
                });
            });
        })();
    };

    return {
        index: index
    };
};
