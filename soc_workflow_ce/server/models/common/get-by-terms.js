let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param index
 * @param field
 * @param value
 * @param size
 * @param source
 * @returns {Promise}
 */
module.exports = function (server, req, index, field, value, size, source) {
    return new Promise((resolve, reject) => {
        index = typeof index == 'string' ? index : '*';
        field = typeof field == 'string' ? field : '';
        value = typeof value != 'object' ? [value] : value;
        value = !$cf.isArray(value) && typeof value == 'object' ? [] : value;
        size = typeof size == 'number' ? size : 100;

        if (JSON.stringify(value) == '[]') {
            resolve([]);
            return false;
        }

        let terms = {};
        terms[field] = value;

        let requestBody = {
            "size": size,
            "query": {
                "terms": terms
            }
        };

        if ($cf.isArray(source)) {
            requestBody['_source'] = source;
        }

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: index,
            body: requestBody
        }).then(function (response) {
            response = response['hits'] || [];
            response = response['hits'] || [];

            resolve(response);
        }).catch(function (e) {
            console.log(e);
            resolve([]);
        });
    });
};