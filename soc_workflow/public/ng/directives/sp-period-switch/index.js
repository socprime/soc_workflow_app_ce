import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow', []).directive('spPeriodSwitch',
    function () {
        /**
         * @param scope
         * @param element
         * @param attrs
         * @param controller
         * @param transcludeFn
         */
        let link = function (scope, element, attrs, controller, transcludeFn) {
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
