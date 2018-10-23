import directiveTemplate from './view.html'

const initActions = require('./actions');

require('ui/modules').get('app/soc_workflow', []).directive('spAlertFixedMenu', [
    'modal',
    function (modal) {
        let link = function (scope, element, attrs, controller, transcludeFn) {
            scope.showMenu = false;
            scope.switchMenuState = function () {
                scope.showMenu = !scope.showMenu;
            };

            initActions(scope, modal);
        };

        return {
            link: link,
            scope: {
                'selectedItem': '=',
                'currUrl': '=',
                'userList': '=',
                'allStages': '=',
                'caseEnabledFieldList': '=',
                'savedSearches': '=',
            },
            template: directiveTemplate
        }
    }]);
