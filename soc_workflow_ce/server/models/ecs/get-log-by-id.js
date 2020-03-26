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
                    "terms": {
                        "event_id": ids
                    }
                },
                "sort": {
                    "@timestamp": {
                        "order": "desc"
                    }
                }
            }
        }).then(function (response) {
            let clientTimezone = req.headers.clienttimezone || "UTC";

            let stageLog = [];
            let dbData = response['hits']['hits'] || [];
            dbData.forEach(function (doc) {
                try {
                    doc['_source']['timestamp'] = $cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss', '', false, clientTimezone);

                    if (typeof doc['_source']['comment'] != "undefined" && doc['_source']['comment'] != '') {
                        doc['_source']['comment'] = $cf.createTextLinks(doc['_source']['comment']);
                    }

                    stageLog.push(doc['_source']);
                } catch (e) {
                    console.log(e);
                }
            });

            resolve(stageLog);
        }).catch(function (e) {
            console.log(e);
            resolve([]);
        });
    });
};