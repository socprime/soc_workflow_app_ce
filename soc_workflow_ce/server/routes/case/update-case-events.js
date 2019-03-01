let moduleFolder = require('./../../constant/module-folder');

let moment = require('moment-timezone');
let $cf = require('./../../common/function');

let caseEcsGetByIds = require('./../../models/case_ecs/get-by-ids');
let commonUpdateValueByIds = require('./../../models/common/update-value-by-ids');
let commonAddOrUpdate = require('./../../models/common/add-or-update');
let commonGetCurrentUser = require('./../../../' + moduleFolder + '/users_model/server/get-current-user');

let emptyResult = {
    success: false
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
                let clientTimezone = req.headers.client_timezone || "UTC";

                let idType = 'events_id';
                if ((typeof req.payload['is_alerts'] != "undefined") && Boolean(req.payload['is_alerts'])) {
                    idType = 'alerts_id';
                }

                // Add custom field to data
                let data = {};
                data[idType] = (typeof req.payload['events-id'] != "undefined") ? req.payload['events-id'] : '';
                data[idType] = (data[idType].indexOf("|")) ? data[idType].split("|") : [data[idType]];

                let caseIdData = req.payload['case'] || '';
                caseIdData = req.payload['case'].indexOf("/") ? req.payload['case'].split("/") : [];
                let caseIndex = caseIdData[0] || false;
                let caseId = caseIdData[1] || false;
                if (caseIdData.length != 2 || caseIndex == false || caseId == false) {
                    return reply(emptyResult);
                }

                Promise.all([
                    caseEcsGetByIds(server, req, caseId, false),
                    commonGetCurrentUser(server, req)
                ]).then(function (value) {
                    // Process case data
                    let caseData = value[0][0] || null;
                    let operatorAction = value[1] || '';

                    if (caseData == null) {
                        throw 'No such case in database';
                    }

                    let oldIds = caseData[idType] || [];
                    data[idType] = $cf.arrayUnique(oldIds.concat(data[idType]));

                    let eventsIdDiff = [];
                    try {
                        eventsIdDiff = data[idType].filter(function (i) {
                            return oldIds.indexOf(i) < 0;
                        });
                    } catch (e) {
                        console.log(e);
                    }

                    data = Object.assign({}, caseData, data);

                    data = $cf.makeBulkObjectFromList(data);

                    let saveResultPromise = [commonAddOrUpdate(server, req, {
                        'index': caseIndex,
                        'id': caseId,
                        'data': data
                    })];

                    // Logging about updating events
                    let indexDate = caseIndex.split('-');
                    indexDate = indexDate[1] || moment().tz(clientTimezone).format('YYYY.MM.DD');
                    saveResultPromise.push(commonAddOrUpdate(server, req, {
                        'index': 'case_logs-' + indexDate,
                        'data': {
                            "event_id": caseId,
                            "@timestamp": parseInt(moment().format('x')),
                            "operator.now": '',
                            "operator.prev": '',
                            "operator.action": operatorAction || '',
                            "stage.now": '',
                            "stage.prev": '',
                            "comment": 'Added ' + (eventsIdDiff.length) + ' ' + idType + ': ' + eventsIdDiff.join(', ')
                        }
                    }));

                    // Change alerts Stage
                    if ($cf.isArray(data['alerts_id']) && data['alerts_id'].length > 0) {
                        saveResultPromise.push(commonUpdateValueByIds(server, req, 'alerts_ecs*', data['alerts_id'], 'event.labels', 'In Case', true));
                    }

                    // Execute requests
                    Promise.all(saveResultPromise).then(function (value) {
                        return reply({
                            success: true,
                        });
                    }).catch(function (e) {
                        throw e;
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
