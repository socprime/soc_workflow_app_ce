let $cf = require('./../../../../server/common/function');

require('ui/modules').get('app/soc_workflow', [])
    .service('spCF', [function () {
        return $cf;
    }]);
