const formInit = require('./forms');

import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spProcessCase', [
    '$http',
    '$timeout',
    '$route',
    'spCF',
    function ($http, $timeout, $route, spCF) {
        /**
         * @param scope
         * @param element
         * @param attributes
         * @param controller
         * @param transcludeFn
         */
        const preLink = function (scope, element, attributes, controller, transcludeFn) {
            scope.selectedItemCount = spCF.isArray(scope.selectedItem) ? scope.selectedItem.length : 1;

            let href = scope.currUrl || false;
            scope.formId = 'form-' + parseInt(Math.random() * 1000);
            scope.fields = [];
            scope.fieldType = {
                text: 'text',
                select: 'select',
                textarea: 'textarea',
            };

            scope = formInit(scope, $http, $route, spCF);
        };

        /**
         * @param scope
         * @param element
         * @param attrs
         * @param controller
         * @param transcludeFn
         */
        const link = function (scope, element, attrs, controller, transcludeFn) {
            // Form submit processing
            $('body').on('sp.apply_form', '.modal .process-case form#' + scope.formId, function (event) {
                scope.processCase();
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
                currUrl: '=',
                selectedItem: '=',
                userList: '=',
                allStages: '='
            },
            template: directiveTemplate
        }
    }]);
