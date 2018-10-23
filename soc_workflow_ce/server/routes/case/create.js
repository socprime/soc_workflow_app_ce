let moduleFolder = require('./../../constant/module_folder');

import moment from 'moment';

let $cf = require('./../../common/function');
let $hcc = require('./../../helpers/case/create');

let kibanaGetAllIndexPattern = require('./../../models/kibana/get-all-index-pattern');
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
    const index = (req, reply) => {
        let indexDate = moment().format('YYYY.MM.DD');
        let idType = (typeof req.payload['is_alerts'] != "undefined") && Boolean(req.payload['is_alerts']) ? 'alerts.id' : 'events.id';
        let data = $hcc.validateInput(req, idType);

        let promisList = [commonGetCurrentUser(server, req)];
        if (typeof data[idType] !== typeof undefined && typeof data[idType][0] !== typeof undefined) {
            promisList.push(kibanaGetAllIndexPattern(server, req));
        }

        Promise.all(promisList).then(function (value) {
            let operatorAction = value[0] || '';

            if ($cf.isArray(value[1])) {
                let indexPattern = $cf.identifyCurrentIndexPattern((value[1] || []), (data[idType][0] || ''));
                if (indexPattern.title.length > 0) {
                    for (let row in data[idType]) {
                        data[idType][row] = indexPattern.title + '/' + indexPattern.id + '/' + data[idType][row];
                    }
                }
            }

            commonAddOrUpdate(server, req, {
                'index': 'case_ecs-' + indexDate,
                'data': data
            }).then(function (newCase) {
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

                    if ($cf.isArray(data['alerts.id'])) {
                        promisList.push(commonUpdateValueByIds(server, req, 'alerts_ecs*', data['alerts.id'], 'event.labels', 'In Case'));
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
                    });
                } else {
                    return reply(emptyResult);
                }
            }).catch(function (e) {
                return reply(emptyResult);
            });
        }).catch(function (e) {
            return reply(emptyResult);
        });
    };

    return {
        index: index
    };
};
