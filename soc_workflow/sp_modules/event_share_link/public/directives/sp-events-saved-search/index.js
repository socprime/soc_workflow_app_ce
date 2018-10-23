import directiveTemplate from './view.html'

require('ui/modules').get('app/soc_workflow', []).directive('spEventsSavedSearch', [
    '$http',
    'spInitCommonDateRangePicker',
    'spGetRangeFromPicker',
    'spCF',
    function ($http, spInitCommonDateRangePicker, spGetRangeFromPicker, spCF) {
        let link = function (scope, element, attrs, controller, transcludeFn) {
            scope.selectedSavedSearches = '';

            // Init date range pickers
            angular.element(document).ready(function () {
                spInitCommonDateRangePicker('#' + scope.datepickerId, 'events_date_range_picker_from', 'events_date_range_picker_to', {
                    timePicker: true,
                    locale: {
                        format: 'HH:mm:ss MMM DD, YYYY'
                    },
                    cookieFormat: 'x'
                });
            });

            scope.rawLogSearch = function () {
                let href = scope.currUrl ? scope.currUrl + '/saved-search' : false;

                let activeSource = false;
                let idVal = '';
                if ($("#raw-events-source .nav-link.active").attr('id') == 'btn-from-saved-search') {
                    activeSource = 'saved-search';
                    idVal = scope.selectedSavedSearches[0];
                }

                if (
                    activeSource &&
                    href &&
                    spCF.isString(scope.selectedSavedSearches[0])
                ) {
                    let dateRange = spGetRangeFromPicker('#' + scope.datepickerId);
                    dateRange.from = dateRange.from || 0;
                    dateRange.to = dateRange.to || 0;

                    $('.cd-main-content').waitAnimationStart();
                    $http({
                        method: "GET",
                        url: href,
                        dataType: "json",
                        params: {
                            id: idVal,
                            source: activeSource,
                            dateFrom: dateRange.from,
                            dateTo: dateRange.to
                        }
                    }).then(function successCallback(response) {
                        $('.cd-main-content').waitAnimationStop();
                        response = response.data || {};
                        if (response.success && response.success == true && spCF.isArray(response.data)) {
                            scope.eventsData = response.data;
                        }
                    }, function errorCallback(response) {
                        $('.cd-main-content').waitAnimationStop();
                        console.log('connection error');
                    });
                }
            };
        };

        return {
            link: link,
            scope: {
                'currUrl': '=',
                'datepickerId': '@',
                'eventsData': '=',
                'savedSearches': '=',
            },
            template: directiveTemplate
        }
    }]);
