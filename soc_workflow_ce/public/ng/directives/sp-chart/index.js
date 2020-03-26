import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spChart', [
    'spCF',
    'spInitChartDonut',
    'spInitChartTimeline',
    function (spCF, spInitChartDonut, spInitChartTimeline) {
        let link = function (scope, element, attrs, controller, transcludeFn) {
            scope.legendId = scope.chartId + '-legend';
            scope.groupId = scope.groupId || '';
            scope.showLegend = false;
            scope.showChart = true;

            scope.$watch('src', function (newValue, oldValue) {
                if (typeof newValue != 'object') {
                    try {
                        newValue = JSON.parse(newValue);
                    } catch (e) {
                        newValue = {};
                    }
                }
                if (typeof scope.chartType == 'string' && scope.chartType == 'timeline') {
                    if (spCF.isSet(newValue['data'])) {
                        let dateFormat = null;
                        switch (newValue.interval) {
                            case '1h':
                                dateFormat = '%H:%M %b %d, %Y';
                                break;
                            case '1d':
                                dateFormat = '%Y %b %d';
                                break;
                        }

                        scope.obj = spInitChartTimeline('#' + scope.chartId, newValue, scope.obj, dateFormat, false);
                    }
                } else {
                    setTimeout(() => {
                        scope.obj = spInitChartDonut('#' + scope.chartId, '#' + scope.legendId, newValue, scope.obj);
                    }, 10);
                }
            });

            scope.collapseChart = function () {
                let selector = false;
                switch (scope.chartType) {
                    case 'donut':
                        selector = '.chart-card.chart-type-donut .chart-card__main';
                        break;
                    case 'timeline':
                        selector = '[chart-id=' + scope.chartId + '] .chart-card__main';
                        break;
                }

                if (selector) {
                    if (scope.showChart) {
                        $(selector).slideUp(300);
                    } else {
                        $(selector).slideDown(300);
                    }
                    scope.showChart = !scope.showChart;
                }
            };
        };

        return {
            link: link,
            scope: {
                'chartType': '@',
                'chartTitle': '@',
                'chartId': '@',
                'groupId': '@',
                'src': '=chartSrc',
                'obj': '=chartObj'
            },
            template: directiveTemplate
        }
    }]);
