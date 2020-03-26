let moment = require('moment-timezone');

let config = {};
config['cases'] = require('./../../../../server/config/case-table');
config['alerts'] = require('./../../../../server/config/alert-table');

let $cf = require('./../../../../server/common/function');
let getSortedOrdered = require('./../../../../server/models/ecs/get-sorted-ordered');
let helpersKibanaGetFieldsFromTemplate = require('./../../../../server/helpers/kibana/get-fields-from-template');
let helpersKibanaGetFieldsFromMapping = require('./../../../../server/helpers/kibana/get-fields-from-mapping');

let emptyResult = {
    "draw": 1,
    "recordsTotal": 0,
    "recordsFiltered": 0,
    "data": []
};

const allowedConfig = {
    "cases": {
        "index": "case_ecs-*",
        "template": "ecs_new",
        "timeField": "@timestamp"
    },
    "alerts": {
        "index": "alerts_ecs-*",
        "template": "ecs_new",
        "timeField": "@timestamp"
    }
};

const ignoredfieldsFromTemplate = [
    'timestamp',
    'message',
    'priority_color',
];

const getCookie = function (cookie, cookiename) {
    let cookiestring = RegExp("" + cookiename + "[^;]+").exec(cookie);

    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
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
                let cookies = req.headers || {};
                cookies = req.headers.cookie || {};
                let currSource = '';

                if (!($cf.isString(req.query.source) && Object.keys(allowedConfig).indexOf(req.query.source) > -1)) {
                    return reply(emptyResult);
                }
                currSource = req.query.source;
                let fields = config[currSource]('');

                Promise.all([
                    helpersKibanaGetFieldsFromTemplate(server, req, allowedConfig[currSource]['template']), // tableFields
                    helpersKibanaGetFieldsFromMapping(server, req, allowedConfig[currSource]['index']) // tableFields
                ]).then(function (tableFieldsRaw) {
                    let tableFields = $cf.getArrayOrEmpty(tableFieldsRaw[0]).concat($cf.getArrayOrEmpty(tableFieldsRaw[1]));

                    if ($cf.isArray(tableFields)) {
                        tableFields.forEach(function (filed) {
                            if (ignoredfieldsFromTemplate.indexOf(filed.data) < 0) {
                                fields.push(filed);
                            }
                        });
                    }

                    let clientTimezone = "UTC";
                    if ($cf.isString(req.payload['clienttimezone'])) {
                        clientTimezone = req.payload['clienttimezone'];
                    }

                    let dateFrom = moment().tz(clientTimezone).subtract(29, 'days');
                    if ($cf.isSet(req.payload['dateFrom'])) {
                        dateFrom = moment((req.payload['dateFrom'] * 1000)).tz(clientTimezone).startOf('day');
                    }

                    let dateTo = moment().tz(clientTimezone);
                    if ($cf.isSet(req.payload['dateTo'])) {
                        dateTo = moment((req.payload['dateTo'] * 1000)).tz(clientTimezone).endOf('day');
                    }

                    dateFrom = (dateFrom != 'Invalid date') ? dateFrom.format('x') : moment().tz(clientTimezone).subtract(29, 'days').startOf('day').format('x');
                    dateTo = (dateTo != 'Invalid date') ? dateTo.format('x') : moment().tz(clientTimezone).endOf('day').format('x');

                    let searchFields = [];

                    let allowedFieldFromCookie = getCookie(cookies, 'soc-channel-table-' + currSource + '-allowed-fields');
                    try {
                        allowedFieldFromCookie = JSON.parse(allowedFieldFromCookie);
                        allowedFieldFromCookie = $cf.isArray(allowedFieldFromCookie) ? allowedFieldFromCookie : [];
                    } catch (e) {
                        allowedFieldFromCookie = [];
                    }


                    let orderFieldFrontName = $cf.isSet(req.payload['order[0][column]']) && $cf.isSet(req.payload['columns[' + req.payload['order[0][column]'] + '][data]']) ?
                        req.payload['columns[' + req.payload['order[0][column]'] + '][data]'] : false;
                    let orderField = false;

                    if ($cf.isArray(fields)) {
                        fields.forEach(function (el, key) {
                            if ($cf.isSet(el.data)) {
                                let field = $cf.isSet(el.data) ? el.data: el.field;
                                if (field == orderFieldFrontName && !orderField && ($cf.isString(el.searchable) || el.field)) {
                                    orderField = $cf.isString(el.orderable) ? el.orderable : (el.searchable || el.field);
                                }

                                if ($cf.isString(el.searchable)) {
                                    if (el.title) {
                                        if (allowedFieldFromCookie.indexOf(el.title) >= 0 || el.required) {
                                            searchFields.push(el.searchable);
                                            if (el.searchable.search(/\.keyword$/g) >= 0) {
                                                searchFields.push(el.searchable.replace(/\.keyword$/g, ''));
                                            }
                                        }
                                    } else {
                                        searchFields.push(el.searchable);
                                        if (el.searchable.search(/\.keyword$/g) >= 0) {
                                            searchFields.push(el.searchable.replace(/\.keyword$/g, ''));
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        return reply(emptyResult);
                    }

                    getSortedOrdered(server, req, allowedConfig[currSource]['index'], allowedConfig[currSource]['timeField'], dateFrom, dateTo, {
                        size: typeof req.payload['length'] != "undefined" ? req.payload['length'] : 10,
                        from: typeof req.payload['start'] != "undefined" ? req.payload['start'] : 0,
                        orderField: orderField,
                        orderDir: typeof req.payload['order[0][dir]'] != "undefined" && ['asc', 'desc'].indexOf(req.payload['order[0][dir]']) ? req.payload['order[0][dir]'] : 'asc',
                        searchValue: typeof req.payload['search[value]'] != "undefined" ? req.payload['search[value]'] : false,
                        searchFields: searchFields,
                        additionalTerms: allowedConfig[currSource]['additionalTerms'] || false
                    }).then(function (response) {
                        // Prepare response
                        let result = [];
                        let total = 0;
                        try {
                            total = response['hits']['total']['value'];
                        } catch (e) {}

                        response['hits']['hits'].forEach(function (doc) {
                            let resData = {};

                            doc['_source']['id'] = doc['_id'];
                            doc = doc['_source'];

                            doc = $cf.makeFlatListFromObject(doc);
                            fields.forEach(function (el, key) {
                                let field = $cf.isSet(el.field) ? el.field : el.data;
                                if (field != null) {
                                    resData[el.data] = $cf.isSet(doc[field]) ? doc[field] : '';
                                    resData[el.data] = $cf.isFunction(el.validation) ? el.validation(resData[el.data] == '' ? doc : resData[el.data]) : resData[el.data];
                                }
                            });

                            for (let oneFiled in resData) {
                                if ($cf.isArray(resData[oneFiled])) {
                                    resData[oneFiled] = resData[oneFiled].join(', ');
                                }
                            }

                            result.push(resData);
                        });

                        return reply({
                            "recordsTotal": total,
                            "recordsFiltered": total,
                            "data": result
                        });
                    }).catch(function (e) {
                        console.log(e);
                        return reply(emptyResult);
                    });
                });
            });
        })();
    };

    return {
        index: update
    };
};
