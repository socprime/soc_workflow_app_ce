require('jquery.cookie');

/**
 * @param scope
 * @param $timeout
 * @param spCF
 * @param modal
 */
module.exports = function (scope, $timeout, spCF, modal) {
    scope.initTable = function (table, tableObjOutter) {
        $(table).addClass('initiated');

        let tableState = $.cookie(scope.tableStateCookieName);
        try {
            tableState = JSON.parse(tableState);
        } catch (e) {
            tableState = {};
        }
        tableState = {
            'search': tableState.search || undefined,
            'sort': tableState.sort || undefined,
            'dir': tableState.dir || undefined,
            'size': tableState.size || undefined,
            'from': tableState.from || undefined
        };

        let tableObj = tableObjOutter || $(table).DataTable();
        // Set search
        if (tableState.search) {
            tableObj.search(tableState.search);
            $(table).closest('.chart-card').find('.chart-card__filter input[type="search"]').val(tableState.search);
        }
        // Set sort
        // Set dir
        if (tableState.sort) {
            tableObj.order([tableState.sort, (tableState.dir || 'desc')]);
        }
        // Set size
        if (tableState.size) {
            tableObj.page.len(tableState.size);
        }
        // Set from
        if (tableState.size && tableState.size != 0 && tableState.from) {
            let needPage = parseInt(tableState.from / tableState.size);
            tableObj.page(needPage).draw('page');
        }

        $timeout(function () {
            tableObj.draw();
        });

        return tableObj;
    };

    // Init Actions
    // Table search button processing
    scope.searchInTable = function (event) {
        $timeout(function () {
            scope.selectedItem = [];
            $('#' + scope.tableId).trigger('length.dt');
        });

        let _this = event.target;
        let targetTable = $(_this).closest('.chart-card').find('.table.dataTable');
        let searchString = $(_this).closest('.chart-card__filter').find('input[type="search"]').val();

        targetTable.DataTable().search(searchString).draw();
    };

    scope.updateColumnsVisibility = function (tableId, availableFields, selectedFields) {
        selectedFields = spCF.isArray(selectedFields) ? selectedFields : [];
        $("#" + tableId + " th, #" + tableId + " td").removeClass('hidden-column');
        for (let field in availableFields) {
            $("#" + tableId + " th").each(function (key, el) {
                if (field == $(el).text() && selectedFields.indexOf(field) < 0) {
                    $(el).addClass('hidden-column');
                    $("#" + tableId + " td:nth-child(" + (key + 1) + ")").addClass('hidden-column');
                }
            });
        }
    };

    scope.openSelect2 = function (select2Id) {
        if (!$('#' + select2Id).parents('.dropdown-menu.keep-open').hasClass('show')) {
            setTimeout(function () {
                $('#' + select2Id).select2('open');
            }, 200);
        }
    };

    scope.createNewCase = function () {
        modal.show(scope, {
            title: 'Create Case',
            body: '<div sp-create-case current-page="cases" curr-url="currUrl" user-list="userList" all-stages="allStages" enabled-field-list="enabledFieldList" saved-searches="savedSearches"></div>',
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

    scope.collapseOneCard = function (event) {
        $(event.target).parent().toggleClass('is-open').closest('[data-card-wrap=data-card-wrap]').find('[data-card-body=data-card-body]').slideToggle(200);
    };
};
