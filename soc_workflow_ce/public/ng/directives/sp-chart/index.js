import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spChart', [
    'spInitChartDonut',
    'spInitChartTimeline',
    function (spInitChartDonut, spInitChartTimeline) {
        let link = function (scope, element, attrs, controller, transcludeFn) {
            scope.legendId = scope.chartId + '-legend';
            scope.groupId = scope.groupId || '';

            scope.$watch('src', function (newValue, oldValue) {
                if (typeof newValue != 'object') {
                    try {
                        newValue = JSON.parse(newValue);
                    } catch (e) {
                        newValue = {};
                    }
                }
                if (typeof scope.chartType == 'string' && scope.chartType == 'timeline') {
                    if (typeof newValue['data'] != 'undefined') {
                        scope.obj = spInitChartTimeline('#' + scope.chartId, newValue, scope.obj);
                    }
                } else {
                    scope.obj = spInitChartDonut('#' + scope.chartId, '#' + scope.legendId, newValue, scope.obj);
                }

            });
        };

        return {
            link: link,
            scope: {
                chartType: '@',
                'chartTitle': '@',
                'chartId': '@',
                'groupId': '@',
                'src': '=chartSrc',
                'obj': '=chartObj'
            },
            template: directiveTemplate
        }
    }]);
