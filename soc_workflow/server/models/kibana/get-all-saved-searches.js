/**
 * @param server
 * @param req
 */
module.exports = function (server, req) {
    return new Promise((resolve, reject) => {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: '.kibana*',
            body: {
                "size": 10000,
                "query": {
                    "terms": {
                        "type": [
                            "search"
                        ]
                    }
                }
            }
        }).then(function (response) {
            let savedSearches = {};

            response['hits']['hits'].forEach(function (doc) {
                try {
                    savedSearches[doc['_id']] = (doc['_source']['search']['title']);
                } catch (e) {
                }
            });

            resolve(savedSearches);
        }).catch(function (e) {
            resolve({});
        });
    });
};