import moment from 'moment';

let $cf = require('./../../../../server/common/function');
let kibanaGetSavedSearcheByIds = require('./../../../../server/models/kibana/get-saved-searche-by-ids');
let commonGetByBody = require('./../../../../server/models/common/get-by-body');

let emptyResult = {
    'success': false,
    'data': []
};

/**
 * @param object
 * @returns {string}
 */
const objectToString = function (object) {
    let string = [];
    for (let index in object) {
        string.push('<b>' + index + '</b>: ' + (JSON.stringify(object[index])));
    }

    return string.join('; ');
};

/**
 * @param filter
 * @returns {Array}
 */
const prepareQueryFilter = function (filter) {
    let result = [];

    // Processing of IN filter
    if (Array.isArray(filter)) {
        filter.forEach(function (oneFilter) {
            let oneFilterQueryMatch = typeof oneFilter['query'] != "undefined" && typeof oneFilter['query']['match'] == "object" ? oneFilter['query']['match'] : false;
            if (oneFilterQueryMatch !== false) {
                let searchFieldName = Object.keys(oneFilterQueryMatch);
                searchFieldName = searchFieldName[0] || false;
                if (searchFieldName && oneFilterQueryMatch[searchFieldName] != "undefined" && oneFilterQueryMatch[searchFieldName]['query'] != "undefined") {
                    let searchFieldVal = oneFilter['query']['match'][searchFieldName]['query'];
                    let oneFilterObject = {'match': {}};
                    oneFilterObject['match'][searchFieldName] = {
                        'query': searchFieldVal
                    };

                    result.push(oneFilterObject);
                }
            }
        });
    }

    return result;
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
                let id = null;
                if (typeof req.query.id != "undefined") {
                    id = req.query.id;
                } else {
                    return reply(emptyResult);
                }

                let source = null;
                if (
                    typeof req.query.source != "undefined" &&
                    ['saved-search'].indexOf(req.query.source) >= 0
                ) {
                    source = req.query.source;
                } else {
                    return reply(emptyResult);
                }

                let dateFrom = req.query.dateFrom;
                dateFrom = typeof dateFrom != 'undefined' ? dateFrom * 1000 : false;
                dateFrom = dateFrom !== false ? moment(dateFrom, 'x').utc() : moment().subtract(29, 'days').utc().format('x');
                let dateTo = req.query.dateTo;
                dateTo = typeof dateTo != 'undefined' ? dateTo * 1000 : false;
                dateTo = dateTo !== false ? moment(dateTo, 'x').utc() : moment().utc().format('x');

                let getSearchSource = new Promise(function (resolve, reject) {
                    let savedSearchBody = false;
                    if (source == 'saved-search') {
                        kibanaGetSavedSearcheByIds(server, req, id).then(function (savedSearch) {
                            savedSearch = savedSearch[0] || false;
                            if (savedSearch === false) {
                                throw 'No such saved search in database';
                            }

                            try {
                                savedSearchBody = JSON.parse(savedSearch['search']['kibanaSavedObjectMeta']['searchSourceJSON']);
                            } catch (e) {
                            }

                            resolve(savedSearchBody);
                        }).catch(function (e) {
                            resolve(false);
                        });
                    }
                });

                getSearchSource.then(savedSearchBody => {
                    if (savedSearchBody === false) {
                        return reply(emptyResult);
                    }

                    let filtersQuery = prepareQueryFilter((savedSearchBody['filter'] || false));
                    let indexPattern = savedSearchBody['index'] || false;
                    savedSearchBody = savedSearchBody['query'] || [];
                    savedSearchBody = savedSearchBody['query'] || false;

                    kibanaGetSavedSearcheByIds(server, req, 'index-pattern:' + indexPattern).then(function (dbIndexPattern) {
                        let searchIndex = false;
                        let timeFieldName = false;

                        try {
                            searchIndex = dbIndexPattern[0]['index-pattern']['title'];
                        } catch (e) {
                        }
                        try {
                            timeFieldName = dbIndexPattern[0]['index-pattern']['timeFieldName'];
                        } catch (e) {
                            console.log(e);
                        }

                        searchIndex = searchIndex ? searchIndex : '*';

                        let mustCondition = [];
                        if (timeFieldName) {
                            let range = {};
                            range[timeFieldName] = {
                                gte: dateFrom.format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z",
                                lt: dateTo.format('YYYY-MM-DDTHH:mm:ss.SSS') + "Z"
                            };
                            mustCondition.push({
                                "range": range
                            });
                        }

                        let filterCondition = filtersQuery ? filtersQuery : [];

                        commonGetByBody(server, req, searchIndex, {
                            "size": 100,
                            "query": {
                                "bool": {
                                    "must": mustCondition,
                                    "filter": filterCondition
                                }
                            }
                        }).then(function (response) {
                            let searchResult = [];
                            response = response['hits'] || [];
                            response = response['hits'] || [];

                            response.forEach(function (doc) {
                                try {
                                    doc['_source'] = $cf.makeFlatListFromObject('', doc['_source'], {});

                                    searchResult.push({
                                        'content': objectToString((doc['_source'] || {})),
                                        '_id': doc['_id'] || '',
                                        '_index': doc['_index'] || '',
                                        '_type': doc['_type'] || ''
                                    });
                                } catch (e) {
                                }
                            });

                            return reply({
                                success: true,
                                data: searchResult
                            });
                        }).catch(function (e) {
                            throw e;
                        });

                    }).catch(function (e) {
                        throw e;
                    });
                },
                e => {
                    return reply(emptyResult);
                });
            });
        })();
    };

    return {
        index: index
    };
};
