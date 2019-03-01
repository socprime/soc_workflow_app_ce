const emptyChart = {"data": [], "names": {}, "colors": [], "total": 0};

const app = require('ui/modules').get('app/soc_workflow_ce', ['ui.select', 'ngSanitize']).controller('AlertsController', [
    '$scope',
    '$location',
    'spCommonSwitchTheme',
    'spConfigPeriod',
    'spInitAlertsPage',
    function ($scope, $location, spCommonSwitchTheme, spConfigPeriod, spInitAlertsPage) {
        let currUrl = $location.$$absUrl;
        currUrl = currUrl.split('#');
        currUrl = currUrl[0];
        $scope.currUrl = currUrl;
        $scope.oneAlertUrl = currUrl + '#/alerts';

        spCommonSwitchTheme($scope);

        // Init vars
        $scope.dateRange = {
            from: 0,
            to: 0
        };

        $scope.selectedAlert = [];

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

        $scope.workflowTableId = 'soc-channel-table-alerts';
        $scope.tableSrc = {};
        $scope.tableFields = [];

        $scope.caseEnabledFieldList = [];
        $scope.savedSearches = {};
        $scope.allStages = [];
        $scope.userList = [];

        $scope.configPeriod = spConfigPeriod.getAll();
        $scope.updatePeriod = spConfigPeriod.getFirst();
        $scope.periodEntity = undefined;

        $scope.rangeId = '#alerts-reportrange';

        // Init section
        angular.element(document).ready(() => {
            spInitAlertsPage($scope);
        });
    }]);
