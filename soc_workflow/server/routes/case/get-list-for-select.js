import moment from 'moment';
let $cf = require('./../../common/function');

let ecsGetByPeriod = require('./../../models/ecs/get-by-period');

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *)}}
 */
export default function (server, options) {
    const index = (req, reply) => {
        let dateFrom = moment().utc().subtract(6, 'days').startOf('day');
        let dateTo = moment().utc().endOf('day');

        ecsGetByPeriod(server, req, 'case_ecs-*', dateFrom, dateTo).then(function (cases) {
            let data = [];
            cases.forEach(function (oneCase) {
                let rowIndex = oneCase['index'] || '';
                let rowId = oneCase['id'] || '';
                let rowName = oneCase['name'] || '';
                let ts = oneCase['@timestamp'] || '';

                if (ts) {
                    ts = $cf.getDateInFormat(ts, 'DD/MM/YYYY HH:mm', '');
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
            return reply({
                success: false
            });
        });
    };

    return {
        index: index
    };
};
