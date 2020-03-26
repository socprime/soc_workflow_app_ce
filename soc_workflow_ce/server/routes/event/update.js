const moduleFolder = require('./../../constant/module-folder');

let $cf = require('./../../common/function');

let allStages = $cf.getAllStages();

let kibanaGetAllUsers = require(`./../../../${moduleFolder}/server/models/kibana/get-all-users`);
let kibanaGetAllSavedSearches = require('./../../models/kibana/get-all-saved-searches');

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *)}}
 */
export default function (server, options) {
    const update = (req) => {
        return (async function () {
            return await new Promise(function (reply) {
                Promise.all([
                    kibanaGetAllUsers(server, req), // userList
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
