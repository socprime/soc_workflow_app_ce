import chrome from 'ui/chrome';

const app = require('ui/modules').get('app/soc_workflow_ce', ['ngSanitize']).controller('RisksUsersController', [
    '$scope',
    '$http',
    '$location',
    '$timeout',
    'spCommonSwitchTheme',
    'spInitRisksUsersPage',
    'spInitRisksUsersAction',
    function ($scope, $http, $location, $timeout, spCommonSwitchTheme, spInitRisksUsersPage, spInitRisksUsersAction) {
        let currUrl = $location.$$absUrl;
        currUrl = currUrl.split('#');
        currUrl = currUrl[0];
        $scope.currUrl = currUrl;

        $scope.basePath = chrome.getBasePath() || '/';
        $scope.basePath = $scope.basePath == '/' ? '' : $scope.basePath;

        $scope.oneRisksUserUrl = currUrl + '#/risks-user';
        // spCommonSwitchTheme($scope);

        // Init vars
        $scope.dateRange = {
            from: 0,
            to: 0
        };

        $scope.chartsData = {
            usersCount: 0,
            alertsCount: 0,
            hostsCount: 0,
            maxRiskScore: 0,
            topUsers: [],
            topDepartment: [],
            topLocations: []
        };

        $scope.workflowTableId = 'soc-channel-table-risks-users';
        $scope.tableSrc = {};
        $scope.tableFields = [];

        $scope.rangeId = '#risks-users-reportrange';

        // Init section
        angular.element(document).ready(() => {
            spInitRisksUsersPage($scope);
            $timeout(() => {
                spInitRisksUsersAction($scope);
            });
        });

        $scope.collapseOneCard = function (event) {
            $(event.target).parent().toggleClass('is-open').parents('[data-card-wrap=data-card-wrap]').find('[data-card-body=data-card-body]').slideToggle(200);
        };
    }]);
