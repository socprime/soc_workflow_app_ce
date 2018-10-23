let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param id
 */
module.exports = function (server, req, id) {
    return new Promise((resolve, reject) => {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: 'case_ecs*',
            body: {
                "_source": {
                    "includes": [
                        "_id", "name", "@timestamp"
                    ]
                },
                "query": {
                    "term": {
                        "alerts.id.keyword": id
                    }
                }
            }
        }).then(function (response) {
            let cases = [];
            response = response['hits']['hits'] || [];
            response.forEach(function (oneCase) {
                let clearedCase = {};
                if (typeof oneCase['_id'] == "string") {
                    clearedCase.id = oneCase['_id'];
                }
                if (typeof oneCase['_source'] == "object") {
                    if (typeof oneCase['_source']['name'] == "string") {
                        clearedCase.name = oneCase['_source']['name'];
                    }
                    if (typeof oneCase['_source']['@timestamp'] != "undefined") {
                        clearedCase.timestamp = $cf.getDateInFormat(oneCase['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss', '');
                    }
                }

                cases.push(clearedCase);
            });

            resolve(cases);
        }).catch(function (e) {
            resolve([]);
        });
    });
};