require('ui/modules').get('app/soc_workflow_ce', []).directive('spCompile', [
    '$compile',
    function ($compile) {
        return function (scope, element, attrs) {
            scope.$watch(
                function (scope) {
                    return scope.$eval(attrs.spCompile);
                },
                function (value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                }
            )
        };
    }]);