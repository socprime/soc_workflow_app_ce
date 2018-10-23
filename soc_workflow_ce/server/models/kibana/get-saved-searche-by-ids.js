let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param ids
 */
module.exports = function (server, req, ids) {
    return new Promise((resolve, reject) => {
        ids = $cf.isArray(ids) ? ids : (typeof ids != 'object' ? [ids] : []);

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: '.kibana',
            body: {
                "size": 10000,
                "query": {
                    "terms": {
                        "_id": ids
                    }
                }
            }
        }).then(function (response) {
            response = response['hits']['hits'] || [];

            let tmp = [];
            response.forEach(function (oneSearch) {
                if (typeof oneSearch['_source'] == 'object') {
                    oneSearch['_source']['index'] = oneSearch['_index'] || '';
                    oneSearch['_source']['id'] = oneSearch['_id'] || '';

                    tmp.push(oneSearch['_source']);
                }
            });

            resolve(tmp);
        }).catch(function (e) {
            resolve(false);
        });
    });
};