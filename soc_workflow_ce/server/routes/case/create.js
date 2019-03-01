let moduleFolder = require('./../../constant/module-folder');

let moment = require('moment-timezone');

let $cf = require('./../../common/function');
let $hcc = require('./../../helpers/case/create');

let commonGetCurrentUser = require('./../../../' + moduleFolder + '/users_model/server/get-current-user');
let commonAddOrUpdate = require('./../../models/common/add-or-update');
let commonUpdateValueByIds = require('./../../models/common/update-value-by-ids');

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
                let clientTimezone = req.headers.client_timezone || "UTC";
                let indexDate = moment().tz(clientTimezone).format('YYYY.MM.DD');
                let idType = (typeof req.payload['is_alerts'] != "undefined") && Boolean(req.payload['is_alerts']) ? 'alerts_id' : 'events_id';
                let data = $hcc.validateInput(req, idType);

                Promise.all([
                    commonGetCurrentUser(server, req),
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

                        if ($cf.isArray(data['alerts_id'])) {
                            promisList.push(commonUpdateValueByIds(server, req, 'alerts_ecs*', data['alerts_id'], 'event.labels', 'In Case', true));
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
            });
        })();
    };

    return {
        index: index
    };
};
