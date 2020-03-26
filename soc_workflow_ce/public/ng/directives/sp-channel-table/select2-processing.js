require('jquery.cookie');

/**
 * @param scope
 * @param element
 * @param select2Selector
 * @param tableId
 * @param spCF
 */
module.exports = function (scope, element, select2Selector, tableId, spCF) {
    $(select2Selector).on('change', function (event) {
        let selectedFields = spCF.isArray(scope.selectedFields) ? scope.selectedFields : [];
        scope.updateColumnsVisibility(scope.tableId, scope.availableFields, selectedFields);
        $.cookie(scope.allowedFieldsCookieName, JSON.stringify(selectedFields), {expires: 365, path: '/'});

        $(select2Selector).parents('[table-id=' + tableId + ']').trigger('select2-changed');
    });
};