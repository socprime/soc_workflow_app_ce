let $cf = require('./../../common/function');

let caseEcsGetByIds = require('./../../models/case_ecs/get-by-ids');

let emptyResult = {
    success: false,
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
                let caseId = req.query.case_id || false;
                if (caseId === false) {
                    return reply(emptyResult);
                }

                caseEcsGetByIds(server, req, caseId).then(function (response) {
                    let caseData = response[0] || false;
                    if (caseData === false) {
                        throw 'No such case in database';
                    }

                    caseData['saved-search'] = typeof caseData['saved-search'] == 'string' && caseData['saved-search'].length > 0 ? caseData['saved-search'] : false;

                    let data = [];
                    if ($cf.isString(caseData['saved-search'])) {
                        try {
                            data = JSON.parse(caseData['saved-search']);
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    return reply({
                        data: data,
                        success: true
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