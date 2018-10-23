import moment from 'moment';

let commonGetByBody = require('./../../models/common/get-by-body');

let emptyResult = {
    success: false,
};

/**
 * @param server
 * @param options
 * @returns {{index: function(*=, *)}}
 */
export default function (server, options) {
    const index = (req, reply) => {
        let id = null;
        if (typeof req.query.id == 'string') {
            id = req.query.id;
        }

        let body = {
            "size": 10000
        };

        if (id) {
            body['query'] = {
                "match": {
                    "_id": id
                }
            };
        }

        commonGetByBody(server, req, 'playbook', body).then(function (response) {
            response = response['hits'] || [];
            response = response['hits'] || [];
            let data = [];
            response.forEach(function (row) {
                if (typeof row['_source'] != 'undefined' && typeof row['_source']['playbook_name'] != 'undefined') {
                    data.push({
                        'id': (row['_id'] || ''),
                        'name': row['_source']['playbook_name'],
                        'body': (typeof row['_source']['playbook_body'] != 'undefined' ? row['_source']['playbook_body'] : '')
                    });
                }
            });

            if (id) {
                data = data[0] || [];
            }

            let baseReply = {
                success: true,
                data: data
            };

            if (data.name) {
                commonGetByBody(server, req, 'case_ecs*', {
                    "size": 10000,
                    "sort" : [
                        {"@timestamp": "desc"}
                    ],
                    "query": {
                        "match": {
                            "playbooks": data.name
                        }
                    }
                }).then(function (cases) {
                    cases = cases['hits'] || [];
                    cases = cases['hits'] || [];

                    let formattedCases = [];
                    cases.forEach(function (oneCase) {
                        if (oneCase['_id'] && oneCase['_source']) {
                            formattedCases.push({
                                'id': oneCase['_id'],
                                "name": oneCase['_source']['name'] || oneCase['_source']['message'] || '',
                                "event.labels": oneCase['_source']['event.labels'] || '',
                                "event.severity": oneCase['_source']['event.severity'] || '',
                                "priority_color": oneCase['_source']['priority_color'] || '#333',
                                "operator": oneCase['_source']['operator'] || '',
                                "timestamp": typeof oneCase['_source']['@timestamp'] != 'undefined' ? moment(oneCase['_source']['@timestamp']).format('HH:mm:ss MMM DD, YYYY') : ''
                            });
                        }
                    });
                    data['cases'] = formattedCases;

                    return reply({
                        success: true,
                        data: data
                    });
                }).catch(function (e) {
                    return reply(baseReply);
                });
            } else {
                return reply(baseReply);
            }
        }).catch(function (e) {
            return reply(emptyResult);
        });
    };

    return {
        index: index
    };
};
