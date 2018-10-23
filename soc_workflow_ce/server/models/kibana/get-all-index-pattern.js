/**
 * @param server
 * @param req
 */
module.exports = function (server, req) {
    return new Promise((resolve, reject) => {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: '.kibana',
            body: {
                "_source": {
                    "includes": ["_id", "index-pattern.title"]
                },
                "query": {
                    "term": {
                        "type": {
                            "value": "index-pattern"
                        }
                    }
                }
            }
        })
        .then(function (indexPatterns) {
            let result = [];
            indexPatterns = indexPatterns['hits']['hits'] || [];
            indexPatterns.forEach(function (onePattern) {
                let id = onePattern['_id'] || null;
                let title = onePattern['_source']['index-pattern']['title'] || null;

                if (id && title) {
                    id = id.replace('index-pattern:', '');

                    result.push({
                        id: id,
                        title: title
                    });
                }
            });

            resolve(result);
        })
        .catch(function (e) {
            resolve([]);
        });
    });
};