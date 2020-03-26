const moduleFolder = require('./../../constant/module-folder');

let moment = require('moment-timezone');
let $cf = require('./../../common/function');
let alertsEcsGetByIds = require('./../../models/alerts_ecs/get-by-ids');
let kibanaGetCurrentUser = require(`./../../../${moduleFolder}/server/models/kibana/get-current-user`);
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
                    alertsEcsGetByIds(server, req, id),
                    kibanaGetCurrentUser(server, req)
                ]).then(values => {
                    let clientTimezone = req.headers.clienttimezone || "UTC";

                    let alertsData = $cf.isArray(values[0]) ? values[0] : [];
                    let operatorAction = typeof values[1] == 'string' ? values[1] : '';

                    let allPromis = [];
                    alertsData.forEach(function (oneAlert) {
                        let indexDate = $cf.getDateInFormat(oneAlert['@timestamp'], 'YYYY.MM', moment().tz(clientTimezone).format('YYYY.MM'), false, clientTimezone);
                        let alertIndex = oneAlert['index'] || false;
                        let alertId = oneAlert['id'] || false;

                        oneAlert = $cf.makeFlatListFromObject(oneAlert);

                        // Add log
                        let logData = {
                            "event_id": alertId,
                            "@timestamp": parseInt(moment().format('x')),
                            "operator.now": req.payload['operator'] || '',
                            "operator.prev": oneAlert['operator'] || '',
                            "operator.action": operatorAction || '',
                            "stage.now": req.payload['available-stage'] || '',
                            "stage.prev": oneAlert['event.labels'] || '',
                            "comment": req.payload['comment'] || ''
                        };

                        allPromis.push(commonAddOrUpdate(server, req, {
                            'index': 'alerts_logs-' + indexDate,
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

                        // Modify alert
                        oneAlert['event.labels'] = logData['stage.now'];
                        oneAlert['operator'] = logData['operator.now'];
                        oneAlert['comment'] = logData['comment'];

                        oneAlert = $cf.makeBulkObjectFromList(oneAlert);

                        allPromis.push(commonAddOrUpdate(server, req, {
                            'index': alertIndex,
                            'id': alertId,
                            'data': oneAlert
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
                        return reply({
                            success: false
                        });
                    });
                }).catch(function (e) {
                    console.log(e);
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
