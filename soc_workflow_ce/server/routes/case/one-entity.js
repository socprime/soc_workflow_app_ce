let moduleFolder = require('./../../constant/module-folder');
let $cf = require('./../../common/function');
let getStage = require('./../../../' + moduleFolder + '/stage_model/server/get-stage');
let helpersCommonPrepare = require('./../../helpers/common/prepare_data_actions');
let caseEcsGetByIds = require('./../../models/case_ecs/get-by-ids');
let playbookGetByTerms = require('./../../models/playbook/get-by-terms');
let commonGetByTerms = require('./../../models/common/get-by-terms');
let logsGetById = require('./../../../' + moduleFolder + '/workflow_log/server/models/log-get-by-id');
let commonGetAllUsers = require('./../../../' + moduleFolder + '/users_model/server/get-all-users');
let kibanaGetAllSavedSearches = require('./../../models/kibana/get-all-saved-searches');
let kibanaGetAllGraphWorkspace = require('./../../../' + moduleFolder + '/graph_integration/server/models/get-all-graph-workspace');
let allStages = $cf.getAllStages();

let emptyResult = {
    success: false,
    data: {},
    stageLog: [],
    availableStage: []
};

/**
 * @param entity
 * @param addIndex
 * @returns {{ids: Array, data: {}}}
 */
const prepareEventsAlerts = function (entity, addIndex) {
    addIndex = addIndex || false;
    entity = $cf.isArray(entity) ? entity : [];
    let convertedIds = [];
    let convertedData = {};

    entity.forEach(function (tmpId) {
        let index = tmpId.split('/');

        try {
            tmpId = index[(index.length - 1)];

            if (tmpId) {
                convertedIds.push(tmpId);

                convertedData[tmpId] = {};
                convertedData[tmpId]['id'] = tmpId;
                if (addIndex) {
                    convertedData[tmpId]['index'] = index.length > 3 ? (",index:'" + (index[1]) + "'") : '';
                }
            }
        } catch (e) {
            console.log(e);
        }
    });

    return {
        ids: convertedIds,
        data: convertedData
    };
};

/**
 * @param clientTimezone
 * @param data
 * @param enrichment
 * @return {*}
 */
const enrichEventsAlerts = function (clientTimezone, data, enrichment) {
    enrichment = ($cf.isArray(enrichment) ? enrichment : []);
    enrichment.forEach(function (doc) {
        if (typeof doc['_id'] != "undefined" && typeof data[doc['_id']] != "undefined") {
            data[doc['_id']]['name'] = typeof doc['_source']['message'] != "undefined" ? doc['_source']['message'] : doc['_id'];
            data[doc['_id']]['created'] = typeof doc['_source']['@timestamp'] != "undefined" ? $cf.getDateInFormat(doc['_source']['@timestamp'], 'YYYY-MM-DD HH:mm:ss', '', false, clientTimezone) : '';
        }
    });

    return data;
};

/**
 * @param server
 * @param req
 * @param id
 */
const getCaseWithEnrichment = function (server, req, id) {
    return new Promise((resolve, reject) => {
        caseEcsGetByIds(server, req, id).then(function (data) {
            data = typeof data[0] == 'object' ? data[0] : {};
            let playbooks = typeof data['playbooks'] == "object" ? data['playbooks'] : [];
            let events = prepareEventsAlerts(data['events_id'], true);
            let alerts = prepareEventsAlerts(data['alerts_id']);

            let clientTimezone = req.headers.client_timezone || "UTC";

            Promise.all([
                playbookGetByTerms(server, req, {"playbook_name.keyword": playbooks, "_id": playbooks}),
                commonGetByTerms(server, req, 'alerts_ecs-*', '_id', alerts.ids)
            ]).then(function (value) {
                // playbooks
                data['playbooks'] = typeof value[0] == 'string' ? value[0] : "[]";
                // events_id
                data['events_id'] = enrichEventsAlerts(clientTimezone, events.data, events.ids);
                // alerts_id
                data['alerts_id'] = enrichEventsAlerts(clientTimezone, alerts.data, value[1]);

                resolve(data);
            }).catch(function (e) {
                console.log(e);
                data['playbooks'] = "[]";
                data['events_id'] = {};
                data['alerts_id'] = {};

                resolve(data);
            });
        });
    });
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
                let id = null;
                if (typeof req.query.id != "undefined") {
                    id = req.query.id;
                } else {
                    return reply(emptyResult);
                }

                Promise.all([
                    getCaseWithEnrichment(server, req, id), // data, data->playbooks
                    logsGetById(server, req, 'case_logs-*', id),// stageLog
                    commonGetAllUsers(server, req), // userList
                    kibanaGetAllSavedSearches(server, req), // savedSearches
                    kibanaGetAllGraphWorkspace(server, req), // GraphWorkspace
                ]).then(function (value) {
                    let data = typeof value[0] == 'object' ? value[0] : {};
                    let stageLog = $cf.isArray(value[1]) ? value[1] : [];
                    let userList = $cf.isArray(value[2]) ? value[2] : [];
                    let savedSearches = typeof value[3] == 'object' ? value[3] : {};
                    let graphWorkspace = typeof value[4] == 'object' ? value[4] : {};
                    let availableStage = getStage.available((data['event.labels'] != "undefined" ? data['event.labels'] : ''));

                    return reply({
                        success: true,
                        data: data,
                        stageLog: stageLog,
                        availableStage: availableStage,
                        allStages: allStages,
                        dataAction: helpersCommonPrepare(),
                        userList: userList,
                        savedSearches: savedSearches,
                        graphWorkspace: graphWorkspace,
                        caseEnabledFieldList: $cf.getCaseEnabledFieldList(),
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