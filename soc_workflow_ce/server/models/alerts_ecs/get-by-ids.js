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
            let clientTimezone = req.headers.client_timezone || "UTC";

            let alerts = [];
            response = response['hits'] || [];
            response = response['hits'] || [];

            response.forEach(function (doc) {
                try {
                    doc['_source']['id'] = $cf.isString(doc['_id']) ? doc['_id'] : '';
                    doc['_source']['index'] = $cf.isString(doc['_index']) ? doc['_index'] : '';
                    doc = doc['_source'];
                    doc = $cf.makeFlatListFromObject('', doc, {});

                    doc['event.timestamp'] = $cf.getDateInFormat(doc['@timestamp'], 'x', '', false, clientTimezone);
                    doc['timestamp'] = $cf.getDateInFormat(doc['@timestamp'], 'YYYY-MM-DD HH:mm.ss', '', false, clientTimezone);

                    for (let fieldKey in doc) {
                        if ($cf.isObject(doc[fieldKey])) {
                            doc[fieldKey] = $cf.isObject(doc[fieldKey]) && doc[fieldKey] != null
                                ? Object.values(doc[fieldKey]).join(', ') : ($cf.isString(doc[fieldKey]) ? doc[fieldKey] : '');
                        }
                    }

                    if ($cf.isSet(doc['event.severity'])) {
                        let availableEventSeverity = Object.keys(presetColorGlobalPriority);
                        if (availableEventSeverity.indexOf(doc['event.severity']) < 0) {
                            doc['event.severity'] = '';
                        }

                        if (presetColorGlobalPriority[doc['event.severity']]) {
                            doc['priority_color'] = presetColorGlobalPriority[doc['event.severity']]
                        } else {
                            doc['priority_color'] = 'transparent';
                        }
                    } else {
                        doc['priority_color'] = 'transparent';
                    }

                    if ($cf.isSet(doc['comment']) && doc['comment'] != '') {
                        doc['comment'] = $cf.createTextLinks(doc['comment']);
                    }

                    let orderedEventData = {};
                    Object.keys(doc).sort().forEach(function (key) {
                        orderedEventData[key] = doc[key];
                    });

                    alerts.push(orderedEventData);
                } catch (e) {
                    console.log(e);
                }
            });

            resolve(alerts);
        }).catch(function (e) {
            console.log(e);
            resolve([]);
        });
    });
};