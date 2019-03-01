require('ui/modules').get('app/soc_workflow_ce', []).directive('spEditSlaSettings', [function () {
    return {
        compile: function (element, attributes) {
            return {
                pre: function (scope, element, attributes, controller, transcludeFn) {
                },
                post: function (scope, element, attrs, controller, transcludeFn) {
                }
            }
        },
        scope: {},
        template: ''
    }
}]);

