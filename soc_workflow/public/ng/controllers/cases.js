const app = require('ui/modules').get('app/soc_workflow', ['ui.select', 'ngSanitize']).controller('CasesController', [
    '$scope',
    '$http',
    '$location',
    'spCommonSwitchTheme',
    'spConfigPeriod',
    'spInitCasesAction',
    'spInitCasesPage',
    function ($scope, $http, $location, spCommonSwitchTheme, spConfigPeriod, spInitCasesAction, spInitCasesPage) {
        let currUrl = $location.$$absUrl;
        currUrl = currUrl.split('#');
        currUrl = currUrl[0];

        $scope.currUrl = currUrl;
        $scope.oneCaseUrl = currUrl + '#/cases';
        spCommonSwitchTheme($scope);

        // Init vars
        $scope.dateRange = {
            from: 0,
            to: 0
        };

        $scope.selectedCase = [];

        let emptyChart = {"data": [], "names": {}, "colors": [], "total": 0};
        $scope.chartsSrc = {
            byStage: emptyChart,
            byPriority: emptyChart,
            bySla: emptyChart,
            timeline: []
        };
        $scope.charts = {
            byStage: null,
            byPriority: null,
            bySla: null,
            timeline: null
        };

        $scope.tableSrc = {};

        $scope.caseEnabledFieldList = [];
        $scope.savedSearches = {};
        $scope.allStages = {};
        $scope.userList = {};

        $scope.configPeriod = spConfigPeriod.getAll();
        $scope.updatePeriod = spConfigPeriod.getFirst();

        // Init section
        angular.element(document).ready(() => {
            spInitCasesPage($scope);

            spInitCasesAction($scope)
        });
    }]);
