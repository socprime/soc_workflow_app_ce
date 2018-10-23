/**
 * @param scope
 * @param $http
 * @param $route
 * @param modal
 * @param spCF
 * @param spGetRangeFromPicker
 */
module.exports = function (scope, $http, $route, modal, spCF, spGetRangeFromPicker) {
    scope.sigmasList = {};

    let href = scope.currUrl ? scope.currUrl : null;

    /**
     * Load sigma list
     */
    $('.cd-main-content').waitAnimationStart();
    $http({
        method: "GET",
        url: href + '/sigmas-list',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).then(function successCallback(response) {
        response = response.data || {};
        if (response.success && response.success == true && typeof response.data == 'object') {
            scope.sigmasList = response.data;
        }

        // Add SIGMA
        scope.fields.push({
            name: 'SIGMA',
            slug: 'sigma-data',
            type: scope.fieldType.select,
            isMultiple: 'false',
            list: scope.sigmasList,
            current: [],
        });

        $('.cd-main-content').waitAnimationStop();
    }, function errorCallback(response) {
        $('.cd-main-content').waitAnimationStop();
        console.log('connection error');
    });

    /**
     *
     */
    scope.saveCaseData = function () {
        let href = scope.currUrl ? scope.currUrl : null;

        if (href && scope.currCaseId) {
            let reloadPage = {
                title: '',
                body: '',
                actions: [{
                    label: 'Close',
                    cssClass: 'btn btn-outline-danger waves-effect waves-light',
                    onClick: function (e) {
                        $route.reload();
                    }
                }],
                onHide: function () {
                    $route.reload();
                }
            };

            let data = {
                case_id: scope.currCaseId
            };

            // Get Choosen sigma
            data['choosen_sigma'] = [];
            scope.fields.forEach(function (oneField) {
                if (spCF.isString(oneField.slug) && oneField.slug == 'sigma-data') {
                    data['choosen_sigma'] = oneField.current || [];
                    data['choosen_sigma'] = spCF.isArray(data['choosen_sigma']) ? data['choosen_sigma'][0] : false;
                    data['choosen_sigma_name'] = scope.sigmasList[data['choosen_sigma']] || '';
                }
            });

            if (data['choosen_sigma']) {
                let dateRange = spGetRangeFromPicker(scope.datePickerId);
                data['daterangepicker_start'] = dateRange.from || 0;
                data['daterangepicker_end'] = dateRange.to || 0;

                $http({
                    method: "POST",
                    url: href + '/cases-enrich-by-sigma',
                    data: $.param(data),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).then(function successCallback(response) {
                    response = response.data || {};
                    if (response.success && response.success == true) {
                        modal.show(scope, Object.assign({}, reloadPage, {
                            title: 'Info',
                            body: response.message || 'Events from SIGMA enriched',
                        }));
                    } else {
                        modal.show(scope, Object.assign({}, reloadPage, {
                            title: 'Error',
                            body: 'Something went wrong',
                        }));
                    }
                }, function errorCallback(response) {
                    console.log('connection error');
                });
            }
        }
    };
};