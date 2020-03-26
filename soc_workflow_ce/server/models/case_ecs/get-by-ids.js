let moment = require('moment-timezone');

let presetColorGlobalPriority = require('./../../constant/priority-colors');
let $cf = require('./../../common/function');

/**
 * @param server
 * @param req
 * @param ids
 * @param source
 * @returns {Promise}
 */
module.exports = function (server, req, ids, source) {
    ids = !$cf.isArray(ids) && typeof ids == 'object' ? '' : ids;
    ids = !$cf.isArray(ids) && typeof ids != 'object' ? [ids] : ids;
    source = $cf.isArray(source) && source.length > 0 ? source : null;

    let casesRequestBody = {
        "size": 10000,
        "query": {
            "terms": {
                "_id": ids
            }
        },
        "sort": [
            {
                "@timestamp": {
                    "order": "desc"
                }
            }
        ]
    };

    if (source) {
        casesRequestBody['_source'] = source;
    }

    return new Promise((resolve, reject) => {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: 'case_ecs-*',
            body: casesRequestBody
        }).then(function (response) {
            let clientTimezone = req.headers.clienttimezone || "UTC";

            response = response['hits'] || [];
            response = response['hits'] || [];
            let cases = [];

            response.forEach(function (doc) {
                try {
                    doc['_source']['id'] = typeof doc['_id'] == 'string' ? doc['_id'] : '';
                    doc['_source']['index'] = typeof doc['_index'] == 'string' ? doc['_index'] : '';
                    doc = doc['_source'];
                    doc = $cf.makeFlatListFromObject(doc);

                    doc['timestamp'] = $cf.getDateInFormat(doc['@timestamp'], 'YYYY-MM-DD HH:mm:ss', '', false, clientTimezone);

                    if (
                        typeof doc['saved-search'] != "undefined" &&
                        doc['saved-search'] != ""
                    ) {
                        if ($cf.isArray(doc['saved-search'])) {
                            let preparedSearch = [];
                            doc['saved-search'].forEach(function (row) {

                                if (typeof row['id'] != "undefined" && typeof row['name'] != "undefined" && typeof row['date-from'] != "undefined" && typeof row['date-to'] != "undefined") {
                                    let dateFormat = (parseInt(row['date-from']) > 9999999999) ? 'x' : 'X';

                                    preparedSearch.push({
                                        id: (row['id'] || ''),
                                        name: (row['name'] || ''),
                                        'date-from': (moment(row['date-from'], dateFormat).tz(clientTimezone).format('YYYY-MM-DD HH:mm:ss.SSS') || moment().tz(clientTimezone).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss.SSS')),
                                        'date-to': (moment(row['date-to'], dateFormat).tz(clientTimezone).format('YYYY-MM-DD HH:mm:ss.SSS') || moment().tz(clientTimezone).format('YYYY-MM-DD HH:mm:ss.SSS'))
                                    });
                                }
                            });

                            doc['saved-search'] = JSON.stringify(preparedSearch);
                        }
                    }

                    if (typeof doc['event.severity'] != "undefined") {
                        let availableEventSeverity = Object.keys(presetColorGlobalPriority);
                        doc['event.severity'] = '' + doc['event.severity'];
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

                    if (typeof doc['comment'] != "undefined" && doc['comment'] != '') {
                        doc['comment'] = $cf.createTextLinks(doc['comment']);
                    }

                    let orderedEventData = {};
                    Object.keys(doc).sort().forEach(function (key) {
                        orderedEventData[key] = doc[key];
                    });

                    cases.push(orderedEventData);
                } catch (e) {
                    console.log(e);
                }
            });

            resolve(cases);
        }).catch(function (e) {
            console.log(e);
            resolve([]);
        });
    });
};