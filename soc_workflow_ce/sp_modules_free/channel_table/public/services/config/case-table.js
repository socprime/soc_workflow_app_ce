const config = require('./../../../server/config/case-table');

require('ui/modules').get('app/soc_workflow_ce', []).service('spConfigCaseTable', [function () {
    return config;
}]);
