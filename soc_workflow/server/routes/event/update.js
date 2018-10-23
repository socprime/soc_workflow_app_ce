let moduleFolder = require('./../../constant/module_folder');

let $cf = require('./../../common/function');

let allStages = $cf.getAllStages();

let commonGetAllUsers = require('./../../../' + moduleFolder + '/users_model/server/get-all-users');
let kibanaGetAllSavedSearches = require('./../../models/kibana/get-all-saved-searches');

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *)}}
 */
export default function (server, options) {
    const update = (req, reply) => {
        Promise.all([
            commonGetAllUsers(server, req), // userList
            kibanaGetAllSavedSearches(server, req), // savedSearches
        ]).then(values => {
            return reply({
                allStages: allStages,
                userList: $cf.isArray(values[0]) ? values[0] : [],
                savedSearches: typeof values[1] == 'object' ? values[1] : {},
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
