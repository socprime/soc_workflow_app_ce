let moduleFolder = require('./../../constant/module_folder');

import moment from 'moment';
let $cf = require('./../../common/function');
let $hcc = require('./../../helpers/case/create');

let caseEcsGetByIds = require('./../../models/case_ecs/get-by-ids');
let kibanaGetAllIndexPattern = require('./../../models/kibana/get-all-index-pattern');
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
    const index = (req, reply) => {
        let idType = 'events.id';
        if ((typeof req.payload['is_alerts'] != "undefined") && Boolean(req.payload['is_alerts'])) {
            idType = 'alerts.id';
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
            kibanaGetAllIndexPattern(server, req),
            commonGetCurrentUser(server, req)
        ]).then(function (value) {
            // Process case data
            let caseData = value[0][0] || null;
            let operatorAction = value[2] || '';

            if (caseData == null) {
                throw 'No such case in database';
            }

            let oldIds = caseData[idType] || [];
            data[idType] = $cf.arrayUnique(oldIds.concat(data[idType]));

            let eventsIdDiff = [];
            try {
                eventsIdDiff = data[idType].filter(function(i) {return oldIds.indexOf(i) < 0;});
            } catch (e) {}

            data = Object.assign({}, caseData, data);

            let indexPattern = $cf.identifyCurrentIndexPattern((value[1] || []), (data[idType][0] || ''));

            if (indexPattern.title.length > 0) {
                for (let row in data[idType]) {
                    data[idType][row] = indexPattern.title + '/' + indexPattern.id + '/' + data[idType][row];
                }
            }

            let saveResultPromise = [commonAddOrUpdate(server, req, {
                'index': caseIndex,
                'id': caseId,
                'data': data
            })];

            // Logging about updating events
            let indexDate = caseIndex.split('-');
            indexDate = indexDate[1] || moment().format('YYYY.MM.DD');
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
            if ($cf.isArray(data['alerts.id']) && data['alerts.id'].length > 0) {
                saveResultPromise.push(commonUpdateValueByIds(server, req, 'alerts_ecs*', data['alerts.id'], 'event.labels', 'In Case'));
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
            return reply(emptyResult);
        });
    };

    return {
        index: index
    };
};
