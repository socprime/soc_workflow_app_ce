import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spPeriodSwitch',
    function () {
        /**
         * @param scope
         * @param element
         * @param attrs
         * @param controller
         * @param transcludeFn
         */
        const link = function (scope, element, attrs, controller, transcludeFn) {
            scope.setNewPeriod = function (period) {
                scope.updatePeriod = period;
            }
        };

        return {
            link: link,
            scope: {
                'datepickerId': '@',
                'updatePeriod': '=updatePeriod',
                'periodsList': '=periodsList'
            },
            template: directiveTemplate
        }
    });
