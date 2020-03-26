import chrome from 'ui/chrome';

let initHandlers = require('./handlers');
let initTableProcessing = require('./table-processing');
let initSelect2Processing = require('./select2-processing');
let initWatchers = require('./watchers');
require('jquery.cookie');

import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spChannelTable', [
    '$timeout',
    'spCF',
    'modal',
    function ($timeout, spCF, modal) {
        const preLink = function (scope, element, attributes, controller, transcludeFn) {
            scope.allowedFieldsCookieName = scope.tableId + '-allowed-fields';
            scope.tableStateCookieName = scope.tableId + '-table-state';
            scope.select2Id = scope.tableId + '-select-fields';
            scope.showColumnsSelector = scope.showColumnsSelector == 'false' ? false : true;
            scope.availableFields = {};
            scope.selectedFields = [];
            scope.showCreateCaseButton = scope.showCreateCaseButton == 'true';

            scope.basePath = chrome.getBasePath() || '/';
            scope.basePath = scope.basePath == '/' ? '' : scope.basePath;
        };

        let link = function (scope, element, attrs, controller, transcludeFn) {
            if (!Array.isArray(scope.selectedItem)) {
                scope.selectedItem = [];
            }

            initWatchers(scope, $timeout, spCF, '#' + scope.tableId);

            element.ready(() => {
                initTableProcessing(scope, element, $timeout, spCF, '#' + scope.tableId);
                initSelect2Processing(scope, element, '#' + scope.select2Id, scope.tableId, spCF);
                initHandlers(scope, $timeout, spCF, modal);
            });
        };

        return {
            compile: function (element, attributes) {
                return {
                    pre: preLink,
                    post: link
                }
            },
            scope: {
                'tableTitle': '@',
                'tableId': '@',
                'oneItemUrl': '@',
                'showColumnsSelector': '@',
                'showCreateCaseButton': '@',
                'currUrl': '=?',
                'userList': '=?',
                'allStages': '=?',
                'enabledFieldList': '=?',
                'savedSearches': '=?',
                'src': '=tableSrc',
                'allowedFields': '=tableAllowedFields',
                'selectedItem': '=',
                'tableRows': '=?',
            },
            template: directiveTemplate
        }
    }]);
