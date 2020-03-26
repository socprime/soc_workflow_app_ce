const moduleFolder = require('./../../constant/module-folder');

let moment = require('moment-timezone');
let $cf = require('./../../common/function');
let caseEcsGetByIds = require('./../../models/case_ecs/get-by-ids');
let kibanaGetCurrentUser = require(`./../../../${moduleFolder}/server/models/kibana/get-current-user`);
let helperRisksUsersGetCasesAlerts = require(`./../../../${moduleFolder}/server/helper/risks-users/get-cases-alerts`);
let helperRisksUsersGetCasesRiskScore = require(`./../../../${moduleFolder}/server/helper/risks-users/get-cases-risk-score`);
let commonAddOrUpdate = require('./../../models/common/add-or-update');
let commonUpdateByQueryBody = require('./../../models/common/update-by-query-body');

let requiredFields = [
    'operator',
    'available-stage',
    'comment',
];

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
 */
export default function (server, options) {
    const index = (req) => {
        return (async function () {
            return await new Promise(function (reply) {
                let id = null;
                if (typeof req.payload['event_id'] != "undefined") {
                    id = req.payload['event_id'];
                    id = (id.indexOf("|")) ? id.split("|") : [id];
                }

                let clientTimezone = req.headers.clienttimezone || "UTC";

                let fieldsConfirmed = true;
                requiredFields.forEach(function (field) {
                    if (!(typeof req.payload[field] == "string" && req.payload[field].length > 0)) {
                        fieldsConfirmed = false;
                    }
                });

                if (fieldsConfirmed == false || id == null) {
                    reply(false);
                }

                // Receive need data
                let valuesPromise = [
                    caseEcsGetByIds(server, req, id), // caseData
                    kibanaGetCurrentUser(server, req) // operatorAction
                ];

                if ($cf.isString(req.payload['available-stage']) && $cf.getCaseClosedStage().indexOf(req.payload['available-stage']) >= 0) {
                    valuesPromise.push(helperRisksUsersGetCasesAlerts(server, req, id));
                    valuesPromise.push(helperRisksUsersGetCasesRiskScore(server, req, id));
                }
                Promise.all(valuesPromise).then(values => {
                    let caseData = $cf.isArray(values[0]) ? values[0] : [];
                    let operatorAction = typeof values[1] == 'string' ? values[1] : '';
                    values[2] = $cf.isArray(values[2]) ? values[2] : [];
                    let casesRiskScore = $cf.isObject(values[3]) ? values[3] : {};

                    let casesAlerts = {};
                    values[2].forEach((oneCase) => {
                        if ($cf.isString(oneCase['id']) && $cf.isArray(oneCase['alerts'])) {
                            casesAlerts[oneCase['id']] = oneCase['alerts'];
                        }
                    });


                    let allPromis = [];
                    caseData.forEach(function (oneCase) {
                        let indexDate = $cf.getDateInFormat(oneCase['@timestamp'], 'YYYY.MM', moment().tz(clientTimezone).format('YYYY.MM'), false, clientTimezone);
                        let caseIndex = oneCase['index'] || false;
                        let caseId = oneCase['id'] || false;

                        oneCase = $cf.makeFlatListFromObject(oneCase);

                        if ($cf.isSet(casesAlerts[oneCase['id']])) {
                            oneCase['alerts_id'] = casesAlerts[oneCase['id']];
                        }

                        // Add log
                        let logData = {
                            "event_id": caseId,
                            "@timestamp": parseInt(moment().tz(clientTimezone).format('x')),
                            "operator.now": req.payload['operator'] || '',
                            "operator.prev": oneCase['operator'] || '',
                            "operator.action": operatorAction || '',
                            "stage.now": req.payload['available-stage'] || '',
                            "stage.prev": oneCase['event.labels'] || '',
                            "comment": req.payload['comment'] || ''
                        };

                        allPromis.push(commonAddOrUpdate(server, req, {
                            'index': 'case_logs-' + indexDate,
                            'data': logData,
                            'schema': {
                                "event_id": '',
                                "@timestamp": 0,
                                "operator.now": '',
                                "operator.prev": '',
                                "operator.action": '',
                                "stage.now": '',
                                "stage.prev": '',
                                "comment": ''
                            },
                            'required': ['event_id', '@timestamp']
                        }));

                        // Modify case
                        oneCase['event.labels'] = logData['stage.now'];
                        oneCase['operator'] = logData['operator.now'];
                        oneCase['comment'] = logData['comment'];

                        if ($cf.getCaseClosedStage().indexOf(oneCase['event.labels']) >= 0 && $cf.isString(oneCase["cv_risk_score_info.user_id"])) {
                            oneCase['cv_risk_score_info.closed_timestamp'] = moment().tz(clientTimezone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z";
                            oneCase['cv_risk_score_info.case_status'] = "closed";

                            if ($cf.isSet(casesRiskScore[oneCase['id']])) {
                                oneCase['cv_risk_score_info.risk_score'] = casesRiskScore[oneCase['id']];
                            }

                            allPromis.push(commonUpdateByQueryBody(server, req, 'cv_risk_score', {
                                "query": {
                                    "term": {
                                        "user_id": {
                                            "value": oneCase["cv_risk_score_info.user_id"]
                                        }
                                    }
                                },
                                "script": {
                                    "source": "ctx._source['close_case_timestamp'] = '" + (moment().tz(clientTimezone).format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z") + "'; ctx._source['case_status'] = 'closed';"
                                }
                            }));
                        }

                        if ($cf.isString(oneCase['saved-search'])) {
                            try {
                                oneCase['saved-search'] = JSON.parse(oneCase['saved-search']);
                                oneCase['saved-search'] = $cf.getArrayOrEmpty(oneCase['saved-search']).map((row) => {
                                    row['date-from'] = $cf.isString(row['date-from']) ? (new Date(row['date-from'])).getTime() : row['date-from'];
                                    row['date-to'] = $cf.isString(row['date-to']) ? (new Date(row['date-to'])).getTime() : row['date-to'];

                                    row['date-from'] = (row['date-from'] != 'Invalid date') ? row['date-from'] : (new Date()).getTime();
                                    row['date-to'] = (row['date-to'] != 'Invalid date') ? row['date-to'] : (new Date()).getTime();

                                    return row;
                                });
                            } catch (e) {
                            }
                        }

                        oneCase = $cf.makeBulkObjectFromList(oneCase);

                        allPromis.push(commonAddOrUpdate(server, req, {
                            'index': caseIndex,
                            'id': caseId,
                            'data': oneCase
                        }));
                    });

                    // Log data data
                    Promise.all(allPromis).then(function (resp) {
                        if ($cf.isArray(resp)) {
                            let result = true;
                            resp.forEach(function (oneResp) {
                                result = result && Boolean(oneResp);
                            });

                            reply({
                                success: result
                            });
                        } else {
                            reply({
                                success: false
                            });
                        }
                    }).catch(function (e) {
                        console.log(e);
                        server.log(['error'], e);

                        return reply({
                            success: false
                        });
                    });
                }).catch(function (e) {
                    console.log(e);
                    server.log(['error'], e);

                    return reply({
                        success: false
                    });
                });
            });
        })();
    };

    return {
        index: index
    };
};
