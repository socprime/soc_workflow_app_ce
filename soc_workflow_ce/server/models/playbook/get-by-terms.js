let $cf = require('./../../common/function');

/*
inputTerms = {
    "term1": ["val1", "val2"],
    "term2": ["val1", "val2"]
}
*/

/**
 * @param server
 * @param req
 * @param inputTerms
 */
module.exports = function (server, req, inputTerms) {
    return new Promise((resolve, reject) => {
        if (typeof inputTerms != 'object') {
            resolve([]);
        }

        let should = [];
        for (let oneTerm in inputTerms) {
            if ($cf.isString(oneTerm) && $cf.isArray(inputTerms[oneTerm])) {
                let newTerm = {};
                newTerm["terms"] = {};
                newTerm["terms"][oneTerm] = inputTerms[oneTerm];

                should.push(newTerm);
            }
        }

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'search', {
            index: 'playbook',
            body: {
                "size": 10000,
                "query": {
                    "bool": {
                        "should": should
                    }
                }
            }
        }).then(function (responsePlaybook) {
            responsePlaybook = responsePlaybook['hits'] || [];
            responsePlaybook = responsePlaybook['hits'] || [];

            let tmp = [];
            responsePlaybook.forEach((docPlaybook) => {
                if (typeof docPlaybook['_id'] != "undefined") {
                    tmp.push({
                        "id": docPlaybook['_id'],
                        "@timestamp": docPlaybook['_source']['@timestamp'],
                        "name": (typeof docPlaybook['_source']['playbook_name'] != "undefined" ? docPlaybook['_source']['playbook_name'] : '')
                    });
                }
            });

            resolve(JSON.stringify(tmp));
        }).catch(function (e) {
            resolve("[]");
        });
    });
};