const config = require('./../../../server/config/alert-table');

require('ui/modules').get('app/soc_workflow_ce', []).service('spConfigAlertTable', [function (href) {
    return config;
}]);
