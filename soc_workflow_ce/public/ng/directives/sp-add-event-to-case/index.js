import directiveTemplate from './view.html'

const initAjax = require('./ajax');
const initHandlers = require('./handlers');
const initForms = require('./forms');

require('ui/modules').get('app/soc_workflow_ce', []).directive('spAddEventToCase', [
    '$http',
    '$timeout',
    '$route',
    'spCF',
    function ($http, $timeout, $route, spCF) {
        const preLink = function (scope, element, attributes, controller, transcludeFn) {
            scope.formId = 'form-' + parseInt(Math.random() * 1000);
            scope.fields = [];
            scope.fieldType = {
                text: 'text',
                select: 'select',
                textarea: 'textarea',
            };
            scope.caseList = {};

            scope.casePeriod = {
                '1d': '1d',
                '7d': '7d',
                '14d': '14d',
                '30d': '30d'
            };

            scope.eventsId = null;
            scope.isAlerts = false;
            scope.currentPage = scope.currentPage || '';
            switch (scope.currentPage) {
                case 'alerts':
                    scope.alertsList = spCF.isString(scope.alertsList) ? [scope.alertsList] : scope.alertsList;
                    scope.eventsId = spCF.isArray(scope.alertsList) ? scope.alertsList : [];
                    // If Alert opened
                    scope.isAlerts = true;
                    break;
                case 'events':
                    scope.eventsId = spCF.isArray(scope.eventsList) ? scope.eventsList : [];
                    break;
            }

            if (scope.currUrl) {
                let localScope = scope;
                initAjax(localScope, $http, spCF, Object.values(scope.casePeriod)[0]);
            }

            initHandlers(scope, $http, $route, spCF);
            initForms(scope, $http, $route, spCF);
        };

        const link = function (scope, element, attrs, controller, transcludeFn) {
            // Form submit processing
            $('body').on('sp.apply_form', '.modal .add-to-case form#' + scope.formId, function (event) {
                scope.save();
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
                currentPage: '@',
                currUrl: '=',
                alertsList: '=?',
                eventsList: '=?',
            },
            template: directiveTemplate
        }
    }]);
