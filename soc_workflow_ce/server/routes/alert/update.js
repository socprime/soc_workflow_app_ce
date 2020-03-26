const moment = require('moment-timezone');

const moduleFolder = require('./../../constant/module-folder');
let $cf = require('./../../common/function');
const getStage = require(`../../../${moduleFolder}/server/models/stage/get`);
let presetColorGlobalPriority = require('./../../constant/priority-colors');

let allStages = $cf.getAllStages();

let kibanaGetAllUsers = require(`./../../../${moduleFolder}/server/models/kibana/get-all-users`);
let kibanaGetAllSavedSearches = require('./../../models/kibana/get-all-saved-searches');
let ecsGetAggregatedByField = require('./../../models/ecs/get-aggregated-by-field');
let ecsGetAggregatedBySla = require(`./../../../${moduleFolder}/server/models/sla_settings/get-aggregated-by-sla`);
let ecsGetAggregatedByTimestamp = require('./../../models/ecs/get-aggregated-by-timestamp');
let helpersKibanaGetFieldsFromTemplate = require('./../../../server/helpers/kibana/get-fields-from-template');
let helpersKibanaGetFieldsFromMapping = require('./../../../server/helpers/kibana/get-fields-from-mapping');

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
 */
export default function (server, options) {
    const update = (req) => {
        return (async function () {
            return await new Promise(function (reply) {
                let dateFrom = moment().subtract(29, 'days');
                if (typeof req.query.dateFrom != "undefined") {
                    dateFrom = moment((req.query.dateFrom * 1000), 'x');
                }
                let dateTo = moment();
                if (typeof req.query.dateTo != "undefined") {
                    dateTo = moment((req.query.dateTo * 1000), 'x');
                }

                let clientTimezone = req.headers.clienttimezone || 0;

                dateFrom = (dateFrom != 'Invalid date') ? dateFrom.format('x') : moment().tz(clientTimezone).subtract(29, 'days').startOf('day').format('x');
                dateTo = (dateTo != 'Invalid date') ? dateTo.format('x') : moment().tz(clientTimezone).endOf('day').format('x');

                Promise.all([
                    kibanaGetAllUsers(server, req), // userList
                    kibanaGetAllSavedSearches(server, req), // savedSearches
                    ecsGetAggregatedByField(server, req, 'alerts_ecs-*', 'event.labels.keyword', dateFrom, dateTo, getStage.all, getStage.firstForAlert), // donutByStage
                    ecsGetAggregatedByField(server, req, 'alerts_ecs-*', 'event.severity.keyword', dateFrom, dateTo, presetColorGlobalPriority, '1'), // donutByPriority
                    ecsGetAggregatedBySla(server, req, 'alerts_ecs-*', dateFrom, dateTo), // donutBySla
                    ecsGetAggregatedByTimestamp(server, req, 'alerts_ecs-*', dateFrom, dateTo, getStage.firstForAlert), // timeline
                    helpersKibanaGetFieldsFromTemplate(server, req, 'ecs_new'), // tableFields
                    helpersKibanaGetFieldsFromMapping(server, req, 'alerts_ecs-*'), // tableFields
                ]).then(values => {
                    let tableFields = {};
                    $cf.getArrayOrEmpty(values[6]).forEach((field) => {
                        if ($cf.isString(field.data) && !$cf.isSet(tableFields[field.data])) {
                            tableFields[field.data] = field;
                        }
                    });
                    $cf.getArrayOrEmpty(values[7]).forEach((field) => {
                        if ($cf.isString(field.data) && !$cf.isSet(tableFields[field.data])) {
                            tableFields[field.data] = field;
                        }
                    });

                    tableFields = Object.values(tableFields);

                    return reply({
                        allStages: allStages,
                        userList: $cf.isArray(values[0]) ? values[0] : [],
                        savedSearches: $cf.isObject(values[1]) ? values[1] : {},
                        donutByStage: $cf.isObject(values[2]) ? values[2] : {},
                        donutByPriority: $cf.isObject(values[3]) ? values[3] : {},
                        donutBySla: $cf.isObject(values[4]) ? values[4] : {},
                        timeline: $cf.isObject(values[5]) ? values[5] : {},
                        caseEnabledFieldList: $cf.getCaseEnabledFieldList(),
                        tableFields: tableFields,
                        success: true
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
        index: update
    };
};
