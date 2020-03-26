/**
 * @param nameDotted
 * @param content
 * @param fields
 * @returns [*]
 */
const checkLevels = function (nameDotted, content, fields) {
    if (typeof content['properties'] == 'object') {
        for (let propName in content['properties']) {
            fields = checkLevels((nameDotted == '' ? propName : nameDotted + '.' + propName), content['properties'][propName], fields);
        }
    } else {
        fields.push({
            data: (nameDotted.indexOf('.') >= 0 ? nameDotted.replace(/\./g, '--') : nameDotted),
            field: nameDotted,
            title: nameDotted,
            searchable: typeof content['type'] == 'string' && content['type'] == 'keyword' ? nameDotted + '.keyword' : nameDotted
        });
    }

    return fields;
};

/**
 * @param server
 * @param req
 * @param currIndex
 * @returns {Promise}
 */
module.exports = function (server, req, currIndex) {
    return new Promise(function (resolve) {
        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'transport.request', {
            method: 'GET',
            path: '_template/' + currIndex
        }).then(function (response) {
            let result = [];

            response = response[currIndex] || {};
            response = response['mappings'] || {};
            response = checkLevels('', response, []);

            resolve(response);
        }).catch(function (e) {
            console.log(e);
            resolve([]);
        });
    });
};