let moduleFolder = require('./../../constant/module-folder');

let moment = require('moment-timezone');
let $cf = require('./../../common/function');
let caseEcsGetByIds = require('./../../models/case_ecs/get-by-ids');
let commonGetCurrentUser = require('./../../../' + moduleFolder + '/users_model/server/get-current-user');
let commonAddOrUpdate = require('./../../models/common/add-or-update');

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

                let clientTimezone = req.headers.client_timezone || "UTC";

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
                Promise.all([
                    caseEcsGetByIds(server, req, id, false),
                    commonGetCurrentUser(server, req)
                ]).then(values => {
                    let caseData = $cf.isArray(values[0]) ? values[0] : [];
                    let operatorAction = typeof values[1] == 'string' ? values[1] : '';

                    let allPromis = [];
                    caseData.forEach(function (oneCase) {
                        let indexDate = $cf.getDateInFormat(oneCase['@timestamp'], 'YYYY.MM.DD', moment().tz(clientTimezone).format('YYYY.MM.DD'), false, clientTimezone);
                        let caseIndex = oneCase['index'] || false;
                        let caseId = oneCase['id'] || false;

                        oneCase = $cf.makeFlatListFromObject('', oneCase, {});

                        // Add log
                        let logData = {
                            "event_id": caseId,
                            "@timestamp": parseInt(moment().format('x')),
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
