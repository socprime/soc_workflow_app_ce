import moment from 'moment';

let config = [];
config['cases'] = require('./../config/case-table');
config['alerts'] = require('./../config/alert-table');

let $cf = require('./../../../../server/common/function');
let getSortedOrdered = require('./../../../../server/models/ecs/get-sorted-ordered');

let emptyResult = {
    "draw": 1,
    "recordsTotal": 0,
    "recordsFiltered": 0,
    "data": []
};

const allowedConfig = {
    "cases": {
        "index": "case_ecs-*",
        "template": "ecs_new"
    },
    "alerts": {
        "index": "alerts_ecs-*",
        "template": "ecs_new"
    }
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *)}}
 */
export default function (server, options) {
    const update = (req) => {
        return (async function () {
            return await new Promise(function (reply) {
                req.query = req.query || {};
                let currSource = '';

                if (!($cf.isString(req.query.source) && Object.keys(allowedConfig).indexOf(req.query.source) > -1)) {
                    return reply(emptyResult);
                }
                currSource = req.query.source;
                let fields = config[currSource]('');

                let dateFrom = moment().subtract(29, 'days');
                if (typeof req.payload['dateFrom'] != "undefined") {
                    dateFrom = moment((req.payload['dateFrom'] * 1000)).startOf('day');
                }

                let dateTo = moment();
                if (typeof req.payload['dateTo'] != "undefined") {
                    dateTo = moment((req.payload['dateTo'] * 1000)).endOf('day');
                }

                dateFrom = (dateFrom != 'Invalid date') ? dateFrom.format('x') : moment().subtract(29, 'days').startOf('day').format('x');
                dateTo = (dateTo != 'Invalid date') ? dateTo.format('x') : moment().endOf('day').format('x');

                let orderFieldDictionary = {};
                let searchFields = [];

                if ($cf.isArray(fields)) {
                    fields.forEach(function (el, key) {
                        if ($cf.isSet(el.data)) {
                            let field = $cf.isSet(el.searchable) ? el.searchable : $cf.isSet(el.field) ? el.field : el.data;

                            if (field != null) {
                                orderFieldDictionary[key] = field;
                            }

                            if ($cf.isString(el.searchable)) searchFields.push(el.searchable);
                        }
                    });
                } else {
                    return reply(emptyResult);
                }

                getSortedOrdered(server, req, allowedConfig[currSource]['index'], dateFrom, dateTo, {
                    size: typeof req.payload['length'] != "undefined" ? req.payload['length'] : 10,
                    from: typeof req.payload['start'] != "undefined" ? req.payload['start'] : 0,
                    orderField: typeof req.payload['order[0][column]'] != "undefined" && typeof orderFieldDictionary[req.payload['order[0][column]']] != "undefined" ? orderFieldDictionary[req.payload['order[0][column]']] : false,
                    orderDir: typeof req.payload['order[0][dir]'] != "undefined" && ['asc', 'desc'].indexOf(req.payload['order[0][dir]']) ? req.payload['order[0][dir]'] : 'asc',
                    searchValue: typeof req.payload['search[value]'] != "undefined" ? req.payload['search[value]'] : false,
                    orderFieldDictionary: orderFieldDictionary,
                    searchFields: searchFields
                }).then(function (response) {
                    // Prepare response
                    let result = [];
                    let total = response['hits']['total'];

                    response['hits']['hits'].forEach(function (doc) {
                        let resData = {};

                        doc['_source']['id'] = doc['_id'];
                        doc = doc['_source'];

                        doc = $cf.makeFlatListFromObject('', doc, {});
                        fields.forEach(function (el, key) {
                            let field = $cf.isSet(el.field) ? el.field : el.data;
                            if (field != null) {
                                resData[el.data] = $cf.isSet(doc[field]) ? doc[field] : '';
                                resData[el.data] = $cf.isFunction(el.validation) ? el.validation(resData[el.data] == '' ? doc : resData[el.data]) : resData[el.data];
                            }
                        });

                        result.push(resData);
                    });

                    return reply({
                        "recordsTotal": total,
                        "recordsFiltered": total,
                        "data": result
                    });
                }).catch(function (e) {
                    return reply(emptyResult);
                });
            });
        })();
    };

    return {
        index: update
    };
};
