const initAjax = require('./ajax');
const initHandler = require('./handlers');
const initForm = require('./forms');

import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow', []).directive('spCreateCase', [
    '$http',
    '$timeout',
    '$route',
    'spCF',
    'spInitCommonDateRangePicker',
    'spSavedSearchIntegrationSave',
    function ($http, $timeout, $route, spCF, spInitCommonDateRangePicker, spSavedSearchIntegrationSave) {
        /**
         * @param scope
         * @param element
         * @param attributes
         * @param controller
         * @param transcludeFn
         */
        const preLink = function (scope, element, attributes, controller, transcludeFn) {
            let href = scope.currUrl || false;
            scope.formId = 'form-' + parseInt(Math.random() * 1000);
            scope.additionalFields = '';
            scope.playbooks = {};
            scope.fields = [];
            scope.fieldType = {
                text: 'text',
                select: 'select',
                textarea: 'textarea',
            };
            scope.addSavedSearch = false;

            scope.eventsId = null;
            scope.currentPage = scope.currentPage || '';

            switch (scope.currentPage) {
                case 'alerts':
                    scope.alertsList = spCF.isString(scope.alertsList) ? [scope.alertsList] : scope.alertsList;
                    scope.eventsId = spCF.isArray(scope.alertsList) ? scope.alertsList : [];
                    break;
                case 'events':
                    scope.eventsId = spCF.isArray(scope.eventsList) ? scope.eventsList : [];
                    break;
            }

            initForm(scope, spCF);

            let localScope = scope;
            if (href) {
                initAjax(href, localScope, $http, spCF);
            }

            initHandler(scope, $http, $route, spCF, spSavedSearchIntegrationSave);
        };

        /**
         * @param scope
         * @param element
         * @param attrs
         * @param controller
         * @param transcludeFn
         */
        const link = function (scope, element, attrs, controller, transcludeFn) {
            // Init new-case-range-modal
            $timeout(function () {
                spInitCommonDateRangePicker('#new-case-range-modal', null, null, {
                    "parentEl": '.modal.show',
                    "drops": "up",
                    "timePicker": true,
                    "locale": {
                        "format": 'HH:mm:ss MMM DD, YYYY'
                    }
                });

                $(element).on('click', 'button', function (event) {
                    event.preventDefault();
                });
            });

            // Form submit processing
            $('body').on('sp.apply_form', '.modal .create-case form#' + scope.formId, function (event) {
                scope.saveCase();
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
                userList: '=',
                allStages: '=',
                enabledFieldList: '=',
                savedSearches: '=',
                alertsList: '=?',
                eventsList: '=?',
                caseId: '=?',
            },
            template: directiveTemplate
        }
    }]);
