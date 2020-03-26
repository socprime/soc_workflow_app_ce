/**
 * @param scope
 * @param $timeout
 * @param spCF
 * @param tableSelector
 */
module.exports = function (scope, $timeout, spCF, tableSelector) {
    scope.$watch('src', function (newValue) {
        if (Object.keys(newValue).length > 0) {
            if (typeof newValue == 'object') {
                if ($.fn.DataTable.isDataTable(tableSelector)) {
                    $(tableSelector).DataTable().destroy();
                    $(tableSelector).html('');
                }

                try {
                    $(tableSelector).DataTable(newValue);
                } catch (e) {
                    console.log(e);
                }
            } else {
                try {
                    if ($.fn.DataTable.isDataTable(tableSelector)) {
                        $(tableSelector).DataTable().draw();
                    }
                } catch (e) {
                    console.log(e);
                }
            }
        }
    });

    scope.$watch('allowedFields', function (newValue, oldValue) {
        if (spCF.isArray(newValue) && newValue != oldValue) {
            scope.availableFields = {};
            scope.selectedFields = [];

            let result = $.cookie(scope.allowedFieldsCookieName);
            try {
                result = JSON.parse(result);
            } catch (e) {
                result = [];
            }
            let allowedFieldsFromCookie = spCF.isArray(result) ? result : [];

            newValue.forEach(function (oneField) {
                scope.availableFields[oneField] = oneField;
                if (allowedFieldsFromCookie.indexOf(oneField) >= 0) {
                    scope.selectedFields.push(oneField);
                }
            });

            $timeout(function () {
                scope.updateColumnsVisibility(scope.tableId, scope.availableFields, scope.selectedFields);
            });
        }
    });

    if (spCF.isArray(scope.tableRows)) {
        scope.$watch('tableRows', function (newValue, oldValue) {
            if (spCF.isArray(newValue) && newValue != oldValue) {
                if ($.fn.DataTable.isDataTable(tableSelector)) {
                    $(tableSelector).DataTable().destroy();
                    $(tableSelector).html('');
                }

                try {
                    let tableObj = $(tableSelector).DataTable(scope.src);
                    tableObj.rows.add(newValue).draw();
                } catch (e) {
                    console.log(e);
                }
            }
        });
    }
};