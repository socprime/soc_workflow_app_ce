let $cf = require('./../../../server/common/function');

/**
 * @param nameDotted
 * @param content
 * @param fields
 * @returns {*}
 */
const checkLevels = function (nameDotted, content, fields) {
    if (typeof content['properties'] == 'object') {
        for (let propName in content['properties']) {
            fields = checkLevels((nameDotted == '' ? propName : nameDotted + '.' + propName), content['properties'][propName], fields);
        }
    } else {
        let searchable = nameDotted;
        if ($cf.isString(content['type'])) {
            if (content['type'] == 'text' && $cf.isObject(content['fields']) && $cf.isObject(content['fields']['keyword'])) {
                searchable = searchable + '.keyword';
            }
        }

        fields.push({
            data: (nameDotted.indexOf('.') >= 0 ? nameDotted.replace(/\./g, '--') : nameDotted),
            field: nameDotted,
            title: nameDotted,
            searchable: searchable
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
    currIndex = $cf.isString(currIndex) ? currIndex : null;

    return new Promise(function (resolve) {
        if (!currIndex) {
            resolve([]);
        }

        server.plugins.elasticsearch.getCluster('data').callWithRequest(req, 'transport.request', {
            method: 'GET',
            path: currIndex + '/_mapping'
        }).then(function (response) {
            let mappings = [];

            for (let oneIndex in response) {
                response[oneIndex]['mappings'] = response[oneIndex]['mappings'] || {};
                mappings.push(checkLevels('', response[oneIndex]['mappings'], []));
            }

            let result = {};
            mappings.forEach((index) => {
                $cf.getArrayOrEmpty(index).forEach((field) => {
                    if ($cf.isString(field.data) && !$cf.isSet(result[field.data])) {
                        result[field.data] = field;
                    }
                });
            });

            result = Object.values(result);

            resolve(result);
        }).catch(function (e) {
            console.log(e);
            resolve([]);
        });
    });
};