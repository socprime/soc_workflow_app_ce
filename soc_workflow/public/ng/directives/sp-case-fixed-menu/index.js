import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow', []).directive('spCaseFixedMenu', [
    'modal',
    function (modal) {
        let link = function (scope, element, attrs, controller, transcludeFn) {
            scope.showMenu = false;
            scope.switchMenuState = function () {
                scope.showMenu = !scope.showMenu;
            };

            // Init Actions
            scope.processCases = function () {
                modal.show(scope, {
                    title: 'Edit event workflow',
                    body: '<div sp-process-case selected-item="selectedItem" curr-url="currUrl" user-list="userList" all-stages="allStages"></div>',
                    actions: [{
                        label: 'Cancel',
                        cssClass: 'btn btn-outline-danger waves-effect waves-light',
                        onClick: function (e) {
                            $(e.target).parents('.modal').modal('hide');
                        }
                    }, {
                        label: 'Save',
                        savingLabel: 'Saving...',
                        cssClass: 'btn btn-submit btn-outline-danger waves-effect waves-light',
                        onClick: function (event) {
                            if (!$(event.target).hasClass('disabled')) {
                                $(event.target).parents('.modal').find('.process-case form').trigger('sp.apply_form');
                            }
                        }
                    }]
                });
            };
        };

        return {
            link: link,
            scope: {
                'selectedItem': '=',
                'currUrl': '=',
                'userList': '=',
                'allStages': '=',
            },
            template: directiveTemplate
        }
    }]);
