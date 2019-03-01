/**
 * @param scope
 * @param modal
 */
module.exports = function (scope, modal) {
    /**
     *
     */
    scope.createNewCase = function () {
        modal.show(scope, {
            title: 'Create Case',
            body: '<div sp-create-case current-page="alerts" alerts-list="selectedItem" curr-url="currUrl" user-list="userList" all-stages="allStages" enabled-field-list="caseEnabledFieldList" saved-searches="savedSearches"></div>',
            actions: [{
                label: 'Cancel',
                cssClass: 'btn btn-outline-danger',
                onClick: function (e) {
                    $(e.target).parents('.modal').modal('hide');
                }
            }, {
                label: 'Save',
                savingLabel: 'Saving...',
                cssClass: 'btn btn-submit btn-outline-danger',
                onClick: function (event) {
                    if (!$(event.target).hasClass('disabled')) {
                        $(event.target).parents('.modal').find('.create-case form').trigger('sp.apply_form');
                    }
                }
            }]
        });
    };

    /**
     *
     */
    scope.addToExistingCase = function () {
        modal.show(scope, {
            title: 'Add to existing Case',
            body: '<div sp-add-event-to-case current-page="alerts" alerts-list="selectedItem" curr-url="currUrl"></div>',
            actions: [{
                label: 'Cancel',
                cssClass: 'btn btn-outline-danger',
                onClick: function (e) {
                    $(e.target).parents('.modal').modal('hide');
                }
            }, {
                label: 'Save',
                savingLabel: 'Saving...',
                cssClass: 'btn btn-submit btn-outline-danger',
                onClick: function (event) {
                    if (!$(event.target).hasClass('disabled')) {
                        $(event.target).parents('.modal').find('.add-to-case form').trigger('sp.apply_form');
                    }
                }
            }]
        });
    };
};