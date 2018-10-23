let presetColorGlobalPriority = require('./../../constant/priority-colors');
let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param id
 */
module.exports = function (server, req, id) {
    id = !$cf.isArray(id) && typeof id == 'object' ? '' : id;
    id = !$cf.isArray(id) && typeof id != 'object' ? [id] : id;

    return new Promise((resolve, reject) => {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: 'alerts_ecs-*',
            body: {
                "size": 10000,
                "query": {
                    "terms": {
                        "_id": id
                    }
                }
            }
        }).then(function (response) {
            let alerts = [];
            response = response['hits'] || [];
            response = response['hits'] || [];

            response.forEach(function (doc) {
                try {
                    doc['_source']['event.timestamp'] = $cf.getDateInFormat(doc['_source']['timestamp'], 'x', '');
                    doc['_source']['timestamp'] = $cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm.ss', '');

                    for (let fieldKey in doc['_source']) {
                        if (typeof doc['_source'][fieldKey] == "object") {
                            doc['_source'][fieldKey] = typeof doc['_source'][fieldKey] != "undefined" && typeof doc['_source'][fieldKey] == "object" && doc['_source'][fieldKey] != null
                                ? Object.values(doc['_source'][fieldKey]).join(', ') : (typeof doc['_source'][fieldKey] == "string" ? doc['_source'][fieldKey] : '');
                        }
                    }

                    if (typeof doc['_source']['event.severity'] != "undefined") {
                        let availableEventSeverity = Object.keys(presetColorGlobalPriority);
                        if (availableEventSeverity.indexOf(doc['_source']['event.severity']) < 0) {
                            doc['_source']['event.severity'] = '';
                        }

                        if (presetColorGlobalPriority[doc['_source']['event.severity']]) {
                            doc['_source']['priority_color'] = presetColorGlobalPriority[doc['_source']['event.severity']]
                        } else {
                            doc['_source']['priority_color'] = 'transparent';
                        }
                    } else {
                        doc['_source']['priority_color'] = 'transparent';
                    }

                    if (typeof doc['_source']['comment'] != "undefined" && doc['_source']['comment'] != '') {
                        doc['_source']['comment'] = $cf.createTextLinks(doc['_source']['comment']);
                    }

                    doc['_source']['id'] = typeof doc['_id'] == 'string' ? doc['_id'] : '';
                    doc['_source']['index'] = typeof doc['_index'] == 'string' ? doc['_index'] : '';

                    let orderedEventData = {};
                    Object.keys(doc['_source']).sort().forEach(function (key) {
                        orderedEventData[key] = doc['_source'][key];
                    });

                    alerts.push(orderedEventData);
                } catch (e) {
                }
            });

            resolve(alerts);
        }).catch(function (e) {
            resolve([]);
        });
    });
};