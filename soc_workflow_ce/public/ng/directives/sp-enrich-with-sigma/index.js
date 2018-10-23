const formInit = require('./forms');

import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spEnrichWithSigma', [
    '$http',
    '$timeout',
    '$route',
    'modal',
    'spCF',
    'spInitCommonDateRangePicker',
    'spGetRangeFromPicker',
    function ($http, $timeout, $route, modal, spCF, spInitCommonDateRangePicker, spGetRangeFromPicker) {
        /**
         * @param scope
         * @param element
         * @param attributes
         * @param controller
         * @param transcludeFn
         */
        const preLink = function (scope, element, attributes, controller, transcludeFn) {
            scope.formId = 'form-' + parseInt(Math.random() * 1000);
            scope.fields = [];
            scope.fieldType = {
                text: 'text',
                select: 'select',
                textarea: 'textarea',
            };

            scope.datePickerId = '#' + scope.formClass + '-range-modal';

            formInit(scope, $http, $route, modal, spCF, spGetRangeFromPicker);
        };

        /**
         * @param scope
         * @param element
         * @param attrs
         * @param controller
         * @param transcludeFn
         */
        const link = function (scope, element, attrs, controller, transcludeFn) {
            $timeout(function () {
                spInitCommonDateRangePicker(scope.datePickerId, null, null, {
                    "parentEl": '#' + scope.formClass + '.modal',
                    "timePicker": true,
                    "locale": {
                        "format": 'HH:mm:ss MMM DD, YYYY'
                    }
                });
            });

            // Form submit processing
            $('body').on('sp.apply_form', '.modal .' + scope.formClass + ' form#' + scope.formId, function (event) {
                scope.saveCaseData();
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
                formClass: '@',
                currCaseId: '=',
                currUrl: '='
            },
            template: directiveTemplate
        }
    }]);