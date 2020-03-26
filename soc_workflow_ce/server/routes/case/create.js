const moduleFolder = require('./../../constant/module-folder');

let moment = require('moment-timezone');

let $cf = require('./../../common/function');
let $hcc = require('./../../helpers/case/create');

let kibanaGetCurrentUser = require(`./../../../${moduleFolder}/server/models/kibana/get-current-user`);
let commonGetByBody = require('./../../models/common/get-by-body');
let commonAddOrUpdate = require('./../../models/common/add-or-update');
let commonUpdateByQuery = require('./../../models/common/update-by-query');

let emptyResult = {
    success: false,
    message: "Something wrong with data that you provided"
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
 */
export default function (server, options) {
    const index = (req) => {
        return (async function () {
            return await new Promise(function (reply) {
                let clientTimezone = req.headers.clienttimezone || "UTC";
                let indexDate = moment().tz(clientTimezone).format('YYYY.MM');
                let idType = (typeof req.payload['is_alerts'] != "undefined") && Boolean(req.payload['is_alerts']) ? 'alerts_id' : 'events_id';
                let data = $hcc.validateInput(req, idType);

                let preliminaryPromise = [];
                if (idType == 'alerts_id' && data['alerts_id'].length > 0) {
                    preliminaryPromise.push(commonGetByBody(server, req, 'alerts_ecs-*', {
                        "size": 10000,
                        "_source": [
                            '_id', "@timestamp", "message"
                        ],
                        "query": {
                            "terms": {
                                "_id": data['alerts_id']
                            }
                        },
                        "sort": [
                            {
                                "@timestamp": {
                                    "order": "asc"
                                }
                            }
                        ]
                    }));
                }

                Promise.all(preliminaryPromise).then(function (preliminaryData) {
                    let alertsAdditionalData = $cf.isSet(preliminaryData[0]) ? $cf.extractArrayFromSource($cf.getHitsHits(preliminaryData[0])) : [];
                    if (alertsAdditionalData.length > 0) {
                        data['first_alert'] = alertsAdditionalData[0];
                        data['alert_data'] = alertsAdditionalData;
                        data['alerts_count'] = alertsAdditionalData.length;
                    }

                    if ($cf.isObject(data['first_alert'])) {
                        let firstAlertTimestampDate = (new Date(data['first_alert']['@timestamp'])).getTime();
                        let caseTimestampDate = (new Date(data['@timestamp'])).getTime();

                        firstAlertTimestampDate = !isNaN(firstAlertTimestampDate) && firstAlertTimestampDate > 0 ? firstAlertTimestampDate : false;
                        caseTimestampDate = !isNaN(caseTimestampDate) && caseTimestampDate > 0 ? caseTimestampDate : false;

                        if (firstAlertTimestampDate && caseTimestampDate) {
                            data['time_to_detect'] = caseTimestampDate - firstAlertTimestampDate;
                        }
                    }

                    Promise.all([
                        kibanaGetCurrentUser(server, req),
                        commonAddOrUpdate(server, req, {
                            'index': 'case_ecs-' + indexDate,
                            'data': data
                        }, true)
                    ]).then(function (value) {
                        let operatorAction = value[0] || '';
                        let newCase = value[1] || [];

                        if (typeof newCase['_id'] != 'undefined') {
                            let logData = {
                                "event_id": newCase['_id'],
                                "@timestamp": parseInt(moment().format('x')),
                                "operator.now": data['operator'] || '',
                                "operator.prev": '',
                                "operator.action": operatorAction || '',
                                "stage.now": data['event.labels'] || '',
                                "stage.prev": '',
                                "comment": data['comment'] || ''
                            };

                            let promisList = [commonAddOrUpdate(server, req, {
                                'index': 'case_logs-' + indexDate,
                                'data': logData
                            })];

                            if ($cf.isArray(data['events_id'])) {
                                promisList.push(commonAddOrUpdate(server, req, {
                                    'index': 'case_logs-' + indexDate,
                                    'data': {
                                        "event_id": newCase['_id'],
                                        "@timestamp": parseInt(moment().format('x')),
                                        "operator.now": '',
                                        "operator.prev": '',
                                        "operator.action": operatorAction || '',
                                        "stage.now": '',
                                        "stage.prev": '',
                                        "comment": 'Added ' + (data['events_id'].length) + ' events'
                                    }
                                }));
                            }

                            if ($cf.isArray(data['alerts_id'])) {
                                promisList.push(commonAddOrUpdate(server, req, {
                                    'index': 'case_logs-' + indexDate,
                                    'data': {
                                        "event_id": newCase['_id'],
                                        "@timestamp": parseInt(moment().format('x')),
                                        "operator.now": '',
                                        "operator.prev": '',
                                        "operator.action": operatorAction || '',
                                        "stage.now": '',
                                        "stage.prev": '',
                                        "comment": 'Added ' + (data['alerts_id'].length) + ' alerts: ' + data['alerts_id'].join(', ')
                                    }
                                }));

                                promisList.push(commonUpdateByQuery(server, req, 'alerts_ecs*', data['alerts_id'],
                                    "ctx._source['event']['labels'] = 'In Case'; " +
                                    "if (ctx._source['event']['processed_time'] == null) { " +
                                    "  ctx._source['event']['processed_time'] = '" + moment().tz(clientTimezone).format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z' + "' " +
                                    "}"
                                ));
                            }

                            Promise.all(promisList).then(function (result) {
                                let resp = true;
                                result.forEach(function (onePromise) {
                                    resp = resp && Boolean(onePromise);
                                });

                                return reply({
                                    success: resp
                                });
                            }).catch(function (e) {
                                console.log(e);
                            });
                        } else {
                            return reply(emptyResult);
                        }
                    }).catch(function (e) {
                        console.log(e);
                        return reply(emptyResult);
                    });
                }).catch(function (e) {
                    console.log(e);
                    return reply(emptyResult);
                });
            });
        })();
    };

    return {
        index: index
    };
};
