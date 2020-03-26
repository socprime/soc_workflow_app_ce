const moduleFolder = require('./../../constant/module-folder');
let $cf = require('./../../common/function');
let moment = require('moment-timezone');
const getStage = require(`./../../../${moduleFolder}/server/models/stage/get`);
let helpersCommonPrepare = require('./../../helpers/common/prepare_data_actions');
let alertsEcsGetByIds = require('./../../models/alerts_ecs/get-by-ids');
let alertsEcsGetRelatedCaseById = require('./../../models/alerts_ecs/get-related-case-by-id');
let playbookGetByTerms = require('./../../models/playbook/get-by-terms');
let ecsGetLogById = require('./../../../server/models/ecs/get-log-by-id');
let kibanaGetAllUsers = require(`./../../../${moduleFolder}/server/models/kibana/get-all-users`);
let kibanaGetCurrentUser = require(`./../../../${moduleFolder}/server/models/kibana/get-current-user`);
let kibanaGetAllSavedSearches = require('./../../models/kibana/get-all-saved-searches');
let kibanaGetAllIndexPattern = require('./../../models/kibana/get-all-index-pattern');
let alertsLogHasFirstOpenByIds = require('./../../models/alerts_log/has-first-open-by-ids');
let commonAddOrUpdate = require('./../../models/common/add-or-update');
let allStages = $cf.getAllStages();

let emptyResult = {
    success: false,
    data: {},
    stageLog: [],
    availableStage: []
};

/**
 * @param server
 * @param req
 * @param id
 */
const getAlertWithPlaybook = function (server, req, id) {
    return new Promise((resolve, reject) => {
        alertsEcsGetByIds(server, req, id).then(function (data) {
            data = typeof data[0] == 'object' ? data[0] : {};
            let alertName = (data['message'] != "undefined" ? data['message'] : '');
            let playbooks = alertName ? $cf.getAvailablePlaybooksNameByAlertNames(server, [alertName]) : [];

            playbookGetByTerms(server, req, {"playbook_name.keyword": playbooks}).then(function (result) {
                data['playbooks'] = result;
                resolve(data);
            }).catch(function (e) {
                console.log(e);
                server.log(['info'], ['server/route/alert/playbookGetByTerms', e]);
                resolve(data);
            });
        }).catch(function (e) {
            console.log(e);
            server.log(['info'], ['server/routes/alert/alertsEcsGetByIds', e]);
            resolve({});
        });
    });
};


/**
 * @param server
 * @param req
 * @param id
 */
const logFirstAlertOpen = function (server, req, id) {
    return new Promise((resolve, reject) => {
        let clientTimezone = req.headers.clienttimezone || "UTC";

        Promise.all([
            kibanaGetCurrentUser(server, req),
            alertsLogHasFirstOpenByIds(server, req, 'alerts_logs*', id)
        ]).then(values => {
            let operatorAction = values[0] || '';
            let hasFirstOpenLog = values[1] || false;
            if (!hasFirstOpenLog) {
                let logData = {
                    "event_id": id,
                    "@timestamp": parseInt(moment().format('x')),
                    "operator.now": '',
                    "operator.prev": '',
                    "operator.action": operatorAction,
                    "stage.now": '',
                    "stage.prev": '',
                    "comment": "Open first time"
                };

                let indexDate = moment().tz(clientTimezone).format('YYYY.MM');
                let needIndex = 'alerts_logs-' + indexDate;
                commonAddOrUpdate(server, req, {
                    'index': needIndex,
                    'data': logData
                }).then(function (response) {
                    return resolve(true);
                }).catch(function (e) {
                    return resolve(false);
                });
            } else {
                return resolve(false);
            }
        }).catch(function (e) {
            return resolve(false);
        });
    });
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *)}}
 */
export default function (server, options) {
    const index = (req) => {
        return (async function () {
            return await new Promise(function (reply) {
                if (typeof req.query.id != "undefined") {
                    let id = req.query.id;

                    logFirstAlertOpen(server, req, id).then(function () {
                        Promise.all([
                            ecsGetLogById(server, req, 'alerts_logs*', id),
                            getAlertWithPlaybook(server, req, [id]), // eventData, playbooks
                            alertsEcsGetRelatedCaseById(server, req, id), // cases
                            kibanaGetAllUsers(server, req), // userList
                            kibanaGetAllSavedSearches(server, req), // savedSearches
                            kibanaGetAllIndexPattern(server, req) // all index pattern
                        ]).then(value => {
                            let stageLog = $cf.isArray(value[0]) ? value[0] : [];
                            let eventData = typeof value[1] == 'object' ? value[1] : {};
                            eventData['cases'] = $cf.isArray(value[2]) ? value[2] : [];
                            let userList = $cf.isArray(value[3]) ? value[3] : [];
                            let savedSearches = typeof value[4] == 'object' ? value[4] : {};
                            let allIndexPattern = typeof value[5] == 'object' ? value[5] : {};

                            let availableStage = getStage.available((eventData['event.labels'] != "undefined" ? eventData['event.labels'] : ''));

                            return reply({
                                success: true,
                                data: eventData,
                                stageLog: stageLog,
                                availableStage: availableStage,
                                dataAction: helpersCommonPrepare(),
                                allStages: allStages,
                                userList: userList,
                                savedSearches: savedSearches,
                                allIndexPattern: allIndexPattern,
                                caseEnabledFieldList: $cf.getCaseEnabledFieldList(),
                            });
                        }).catch(function (e) {
                            console.log(e);
                            return reply(emptyResult);
                        });
                    });
                } else {
                    reply(emptyResult);
                }
            });
        })();
    };

    return {
        index: index
    };
};
