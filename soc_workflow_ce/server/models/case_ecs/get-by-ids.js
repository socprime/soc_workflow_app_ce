import moment from 'moment';

let presetColorGlobalPriority = require('./../../constant/priority-colors');
let $cf = require('./../../common/function');

let caseStringifyException = ['playbooks', 'comment', 'alerts.id', 'events.id', 'graph-workspace'];

/**
 * @param server
 * @param req
 * @param ids
 */
module.exports = function (server, req, ids, stringifySavedSearch) {
    ids = !$cf.isArray(ids) && typeof ids == 'object' ? '' : ids;
    ids = !$cf.isArray(ids) && typeof ids != 'object' ? [ids] : ids;
    stringifySavedSearch = typeof stringifySavedSearch == 'boolean' && stringifySavedSearch === false ? false : true;

    return new Promise((resolve, reject) => {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: 'case_ecs-*',
            body: {
                "size": 10000,
                "query": {
                    "terms": {
                        "_id": ids
                    }
                }
            }
        }).then(function (response) {
            response = response['hits'] || [];
            response = response['hits'] || [];
            let cases = [];

            response.forEach(function (doc) {
                try {
                    doc['_source']['timestamp'] = $cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss', '');

                    if (
                        stringifySavedSearch &&
                        typeof doc['_source']['saved-search'] != "undefined" &&
                        doc['_source']['saved-search'] != ""
                    ) {
                        if ($cf.isArray(doc['_source']['saved-search'])) {
                            let preparedSearch = [];
                            doc['_source']['saved-search'].forEach(function (row) {

                                if (typeof row['id'] != "undefined" && typeof row['name'] != "undefined" && typeof row['date-from'] != "undefined" && typeof row['date-to'] != "undefined") {
                                    let dateFormat = (parseInt(row['date-from']) > 9999999999) ? 'x' : 'X';

                                    preparedSearch.push({
                                        id: (row['id'] || ''),
                                        name: (row['name'] || ''),
                                        'date-from': (moment(row['date-from'], dateFormat).format('YYYY-MM-DD HH:mm:ss.SSS') || moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss.SSS')),
                                        'date-to': (moment(row['date-to'], dateFormat).format('YYYY-MM-DD HH:mm:ss.SSS') || moment().format('YYYY-MM-DD HH:mm:ss.SSS'))
                                    });
                                }
                            });

                            doc['_source']['saved-search'] = JSON.stringify(preparedSearch);
                        }
                    }

                    if (stringifySavedSearch === false) {
                        caseStringifyException.push('saved-search');
                    }

                    for (let fieldKey in doc['_source']) {
                        if (typeof doc['_source'][fieldKey] == "object" && !caseStringifyException.includes(fieldKey)) {
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

                    cases.push(orderedEventData);
                } catch (e) {
                }
            });

            resolve(cases);
        }).catch(function (e) {
            resolve([]);
        });
    });
};