import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow_ce', []).directive('spSelect2', [
    '$timeout',
    'spCF',
    function ($timeout, spCF) {
        /**
         * @param scope
         * @param element
         * @param attributes
         * @param controller
         * @param transcludeFn
         */
        const preLink = function (scope, element, attributes, controller, transcludeFn) {
            if (!spCF.isString(scope.isMultiple) || scope.isMultiple != 'true') {
                element.find('select').removeAttr('multiple');
            }
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
                let selectOptions = {
                    language: 'en',
                    placeholder: scope.placeholder || "Select item",
                    width: scope.width || '100%',
                    allowClear: true,
                    dropdownParent: $('#' + scope.selectId + '-wrap')
                };
                $(element).find('select').select2(selectOptions);
            });

            scope.$watch('selected', function (newVal, oldVal) {
                if (['[""]', "['']", '[]'].indexOf(JSON.stringify(newVal)) >= 0) {
                    scope.selected = undefined;
                }
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
                selectName: '@selectName',
                selectId: '@selectId',
                placeholder: '@',
                width: '@',
                isMultiple: '@',
                items: '=',
                selected: '=?'
            },
            template: directiveTemplate
        }
    }])
;