import chrome from 'ui/chrome';

const app = require('ui/modules').get('app/soc_workflow_ce', ['ngSanitize']).controller('RisksHostsController', [
    '$scope',
    '$http',
    '$location',
    '$timeout',
    'spCommonSwitchTheme',
    'spInitRisksHostsPage',
    'spInitRisksHostsAction',
    function ($scope, $http, $location, $timeout, spCommonSwitchTheme, spInitRisksHostsPage, spInitRisksHostsAction) {
        let currUrl = $location.$$absUrl;
        currUrl = currUrl.split('#');
        currUrl = currUrl[0];
        $scope.currUrl = currUrl;

        $scope.basePath = chrome.getBasePath() || '/';
        $scope.basePath = $scope.basePath == '/' ? '' : $scope.basePath;

        $scope.oneRisksHostUrl = currUrl + '#/risks-host';
        // spCommonSwitchTheme($scope);

        // Init vars
        $scope.dateRange = {
            from: 0,
            to: 0
        };

        $scope.chartsData = {
            hostsCount: 0,
            alertsCount: 0,
            usersCount: 0,
            maxRiskScore: 0,
            topHosts: [],
            topDepartment: [],
            topLocations: []
        };

        $scope.workflowTableId = 'soc-channel-table-risks-hosts';
        $scope.tableSrc = {};
        $scope.tableFields = [];

        $scope.rangeId = '#risks-hosts-reportrange';

        // Init section
        angular.element(document).ready(() => {
            spInitRisksHostsPage($scope);
            $timeout(() => {
                spInitRisksHostsAction($scope);
            });
        });

        $scope.collapseOneCard = function (event) {
            $(event.target).parent().toggleClass('is-open').parents('[data-card-wrap=data-card-wrap]').find('[data-card-body=data-card-body]').slideToggle(200);
        };
    }]);
