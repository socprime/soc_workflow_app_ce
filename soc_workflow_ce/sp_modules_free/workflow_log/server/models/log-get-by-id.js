let $cf = require('./../../../../server/common/function');

/**
 * @param server
 * @param req
 * @param index
 * @param id
 */
module.exports = function (server, req, index, id) {
    return new Promise((resolve, reject) => {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: index,
            body: {
                "size": 5,
                "query": {
                    "term": {
                        "event_id": id
                    }
                },
                "sort": {
                    "@timestamp": {
                        "order": "desc"
                    }
                }
            }
        }).then(function (response) {
            let stageLog = [];
            let dbData = response['hits']['hits'] || [];
            dbData.forEach(function (doc) {
                try {
                    doc['_source']['timestamp'] = $cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss', '');

                    if (typeof doc['_source']['comment'] != "undefined" && doc['_source']['comment'] != '') {
                        doc['_source']['comment'] = $cf.createTextLinks(doc['_source']['comment']);
                    }

                    stageLog.push(doc['_source']);
                } catch (e) {}
            });

            resolve(stageLog);
        }).catch(function (e) {
            resolve([]);
        });
    });
};