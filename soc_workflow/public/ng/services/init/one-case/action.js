require('ui/modules').get('app/soc_workflow', []).service('spInitOneCaseAction', [
    '$http',
    'modal',
    'spCF',
    'spGraphIntegrationEdit',
    'spSavedSearchIntegrationEdit',
    function ($http, modal, spCF, spGraphIntegrationEdit, spSavedSearchIntegrationEdit) {
        return function ($scope) {
            $scope.isFunction = spCF.isFunction;

            /**
             *
             */
            $scope.processCase = function () {
                modal.show($scope, {
                    title: 'Edit event workflow',
                    body: '<div sp-process-case selected-item="currCaseId" curr-url="currUrl" user-list="userList" all-stages="caseAvailableStage"></div>',
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

            /**
             * Edit Saved Search
             */
            $scope.editCaseSavedSearch = false;
            if (spCF.isFunction(spSavedSearchIntegrationEdit)) {
                $scope.editCaseSavedSearch = function () {
                    spSavedSearchIntegrationEdit($scope)
                };
            }

            /**
             * Edit Graph
             */
            $scope.editCaseGraphWorkspace = false;
            if (spCF.isFunction(spGraphIntegrationEdit)) {
                $scope.editCaseGraphWorkspace = function () {
                    spGraphIntegrationEdit($scope)
                };
            }

            /**
             *
             */
            $scope.enrichWithSigma = function () {
                let enrichWithSigma = 'enrich-with-sigma';
                modal.show($scope, {
                    title: 'Enrich with SIGMA',
                    body: '<div sp-enrich-with-sigma curr-url="currUrl" form-class="' + enrichWithSigma + '" curr-case-id="currCaseId"></div>',
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
                                $(event.target).parents('.modal').find('.' + enrichWithSigma + ' form').trigger('sp.apply_form');
                            }
                        }
                    }]
                });
            };

            /**
             *
             */
            $scope.copyCase = function () {
                modal.show($scope, {
                    title: 'Create Case',
                    body: '<div sp-create-case current-page="cases" case-id="currCaseId" curr-url="currUrl" user-list="userList" all-stages="allStages" enabled-field-list="caseEnabledFieldList" saved-searches="savedSearches"></div>',
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
