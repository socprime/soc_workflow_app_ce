let moment = require('moment-timezone');
let $cf = require('./../../common/function');

let ecsGetByPeriod = require('./../../models/ecs/get-by-period');

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *)}}
 */
export default function (server, options) {
    const index = (req) => {
        return (async function () {
            return await new Promise(function (reply) {
                let clientTimezone = req.headers.client_timezone || "UTC";

                let dateFrom = moment().tz(clientTimezone).subtract(6, 'days').startOf('day');
                let dateTo = moment().tz(clientTimezone).endOf('day');

                ecsGetByPeriod(server, req, 'case_ecs-*', dateFrom, dateTo).then(function (cases) {
                    let data = [];
                    cases.forEach(function (oneCase) {
                        let rowIndex = oneCase['index'] || '';
                        let rowId = oneCase['id'] || '';
                        let rowName = oneCase['name'] || '';
                        let ts = oneCase['@timestamp'] || '';

                        if (ts) {
                            ts = $cf.getDateInFormat(ts, 'DD/MM/YYYY HH:mm', '', false, clientTimezone);
                        }

                        if (rowName) {
                            data.push({
                                'id': [rowIndex, rowId].join('/'),
                                'name': [rowName, ts].join('-'),
                            });
                        }
                    });

                    return reply({
                        data: data,
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
        index: index
    };
};
