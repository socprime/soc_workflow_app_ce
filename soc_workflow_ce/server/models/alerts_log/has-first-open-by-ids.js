let $cf = require('./../../../server/common/function');

/**
 * @param server
 * @param req
 * @param index
 * @param ids
 */
module.exports = function (server, req, index, ids) {
    ids = !$cf.isArray(ids) && typeof ids == 'object' ? '' : ids;
    ids = !$cf.isArray(ids) && typeof ids != 'object' ? [ids] : ids;

    return new Promise((resolve, reject) => {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: index,
            body: {
                "size": 10000,
                "query": {
                    "bool": {
                        "must": [
                            {
                                "terms": {
                                    "event_id": ids
                                }
                            },
                            {
                                "match": {
                                    "comment": "Open first time"
                                }
                            }
                        ]
                    }
                },
                "sort": {
                    "@timestamp": {
                        "order": "desc"
                    }
                }
            }
        }).then(function (response) {
            response = response['hits'] || {};
            response = response['hits'] || [];

            resolve(response.length > 0);
        }).catch(function (e) {
            console.log(e);
            resolve([]);
        });
    });
};