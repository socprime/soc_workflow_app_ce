const app = require('ui/modules').get('app/soc_workflow_ce', ['ui.select', 'ngSanitize']).controller('EventsController', [
    '$scope',
    '$location',
    'spCommonSwitchTheme',
    'spInitEventsAction',
    'spInitEventsAjax',
    'spInitEventsPage',
    function ($scope, $location, spCommonSwitchTheme, spInitEventsAction, spInitEventsAjax, spInitEventsPage) {
        let currUrl = $location.$$absUrl;
        currUrl = currUrl.split('#');
        currUrl = currUrl[0];
        $scope.currUrl = currUrl;

        spCommonSwitchTheme($scope);

        $scope.dateRangePickerId = 'reportrange-raw';
        $scope.selectedEvents = [];
        $scope.tableSrc = {};
        $scope.caseEnabledFieldList = [];
        $scope.savedSearches = {};
        $scope.allStages = [];
        $scope.userList = [];

        $scope.eventsData = [];

        spInitEventsAction($scope);

        // Init section
        angular.element(document).ready(() => {
            spInitEventsPage($scope);

            spInitEventsAjax($scope);
        });
    }]);
