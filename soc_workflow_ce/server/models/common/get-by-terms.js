let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param index
 * @param field
 * @param value
 * @param size
 */
module.exports = function (server, req, index, field, value, size) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : '*';
        field = typeof field == 'string' ? field : '';
        value = typeof value != 'object' ? [value] : value;
        value = !$cf.isArray(value) && typeof value == 'object' ? [] : value;
        size = typeof size == 'number' ? size : 100;

        let terms = {};
        terms[field] = value;

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: index,
            body: {
                "size": size,
                "query": {
                    "terms": terms
                }
            }
        }).then(function (response) {
            response = response['hits'] || [];
            response = response['hits'] || [];

            resolve(response);
        }).catch(function (e) {
            resolve([]);
        });
    });
};