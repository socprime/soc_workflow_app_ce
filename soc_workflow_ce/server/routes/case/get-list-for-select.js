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
                let clientTimezone = req.headers.clienttimezone || "UTC";

                req.query = req.query || {};
                let casePeriod = $cf.isString(req.query.casePeriod) ? req.query.casePeriod : false;
                let daysCount = 0;
                switch (casePeriod) {
                    case '1d':
                        daysCount = 0;
                        break;
                    case '7d':
                        daysCount = 6;
                        break;
                    case '14d':
                        daysCount = 13;
                        break;
                    case '30d':
                        daysCount = 29;
                        break;
                }

                let dateFrom = moment().tz(clientTimezone).subtract(daysCount, 'days').startOf('day');
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
