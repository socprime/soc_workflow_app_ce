const merge = require('deepmerge');

let $cf = require('./../../common/function');

const configFileList = [
    'data_actions.json'
];

const prepare = function () {
    // Actions
    let actions = [];

    configFileList.forEach(function (configFile) {
        let config = $cf.getConfigFile(configFile);
        if ($cf.isArray(config)) {
            actions = actions.concat(config);
        }
    });

    return actions;
};

module.exports = prepare;