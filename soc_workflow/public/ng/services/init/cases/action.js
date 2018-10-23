require('ui/modules').get('app/soc_workflow', [])
    .service('spInitCasesAction', ['modal', function (modal) {
        return function ($scope) {
            $scope.createNewCase = function () {
                modal.show($scope, {
                    title: 'Create Case',
                    body: '<div sp-create-case current-page="cases" curr-url="currUrl" user-list="userList" all-stages="allStages" enabled-field-list="caseEnabledFieldList" saved-searches="savedSearches"></div>',
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
                                $(event.target).parents('.modal').find('.create-case form').trigger('sp.apply_form');
                            }
                        }
                    }]
                });
            };
        }
    }]);
