const merge = require('deepmerge');

let $cf = require('./../../common/function');

const configFileList = [
    'external_lookup.json',
    'external_command.json'
];

const emptyTarget = value => Array.isArray(value) ? [] : {};
const clone = (value, options) => merge(emptyTarget(value), value, options);

function combineMerge(target, source, options) {
    const destination = target.slice();
    source.forEach(function (e, i) {
        if (typeof destination[i] === 'undefined') {
            const cloneRequested = options.clone !== false;
            const shouldClone = cloneRequested && options.isMergeableObject(e);
            destination[i] = shouldClone ? clone(e, options) : e;
        } else if (options.isMergeableObject(e)) {
            for (let field in e) {
                if ($cf.isArray(e[field]) && $cf.isSet(target[i][field])) {
                    e[field].unshift({});
                }
            }
            destination[i] = merge(target[i], e, options);
        } else if (target.indexOf(e) === -1) {
            destination.push(e);
        }
    });

    return destination;
}

const prepare = function () {
    // Actions
    let actions = [];

    configFileList.forEach(function (configFile) {
        let config = $cf.getConfigFile(configFile);
        if ($cf.isArray(config)) {
            actions = merge(actions, config, {
                arrayMerge: combineMerge
            });
        }
    });

    return actions;
};

module.exports = prepare;