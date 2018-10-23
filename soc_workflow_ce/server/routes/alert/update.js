import moment from 'moment';

let moduleFolder = require('./../../constant/module_folder');
let $cf = require('./../../common/function');
let getStage = require('../../../' + moduleFolder + '/stage_model/server/get-stage');
let presetColorGlobalPriority = require('./../../constant/priority-colors');

let allStages = $cf.getAllStages();

let commonGetAllUsers = require('./../../../' + moduleFolder + '/users_model/server/get-all-users');
let kibanaGetAllSavedSearches = require('./../../models/kibana/get-all-saved-searches');
let ecsGetAggregatedByField = require('./../../models/ecs/get-aggregated-by-field');
let ecsGetAggregatedBySla = require('./../../models/ecs/get-aggregated-by-sla');
let ecsGetAggregatedByTimestamp = require('./../../models/ecs/get-aggregated-by-timestamp');

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *=)}}
 */
export default function (server, options) {
    const update = (req, reply) => {
        let dateFrom = moment().utc().subtract(29, 'days');
        if (typeof req.query.dateFrom != "undefined") {
            dateFrom = moment((req.query.dateFrom * 1000), 'x').startOf('day');
        }
        let dateTo = moment().utc();
        if (typeof req.query.dateTo != "undefined") {
            dateTo = moment((req.query.dateTo * 1000), 'x').endOf('day');
        }

        dateFrom = (dateFrom != 'Invalid date') ? dateFrom.format('x') : moment().subtract(29, 'days').startOf('day').format('x');
        dateTo = (dateTo != 'Invalid date') ? dateTo.format('x') : moment().endOf('day').format('x');

        Promise.all([
            commonGetAllUsers(server, req), // userList
            kibanaGetAllSavedSearches(server, req), // savedSearches
            ecsGetAggregatedByField(server, req, 'alerts_ecs-*', 'event.labels.keyword', dateFrom, dateTo, getStage.all), // donutByStage
            ecsGetAggregatedByField(server, req, 'alerts_ecs-*', 'event.severity', dateFrom, dateTo, presetColorGlobalPriority), // donutByPriority
            ecsGetAggregatedBySla(server, req, 'alerts_ecs-*', dateFrom, dateTo), // donutBySla
            ecsGetAggregatedByTimestamp(server, req, 'alerts_ecs-*', dateFrom, dateTo), // timeline
        ]).then(values => {
            return reply({
                allStages: allStages,
                userList: $cf.isArray(values[0]) ? values[0] : [],
                savedSearches: typeof values[1] == 'object' ? values[1] : {},
                donutByStage: typeof values[2] == 'object' ? values[2] : {},
                donutByPriority: typeof values[3] == 'object' ? values[3] : {},
                donutBySla: typeof values[4] == 'object' ? values[4] : {},
                timeline: typeof values[5] == 'object' ? values[5] : {},
                caseEnabledFieldList: $cf.getCaseEnabledFieldList(),
                success: true
            });
        }).catch(function (e) {
            return reply({
                success: false
            });
        });
    };

    return {
        index: update
    };
};
