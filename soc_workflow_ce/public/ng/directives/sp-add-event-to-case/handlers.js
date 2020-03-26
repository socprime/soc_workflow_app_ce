const initAjax = require('./ajax');

/**
 * @param scope
 * @param $http
 * @param $route
 * @param spCF
 */
module.exports = function (scope, $http, $route, spCF) {
    scope.$watch('fields', function (newVal, oldVal) {
        if (spCF.isArray(newVal) && spCF.isArray(oldVal)) {
            if (
                spCF.isObject(newVal[0]) && spCF.isArray(newVal[0].current) && spCF.isString(newVal[0].current[0]) &&
                spCF.isObject(oldVal[0]) && spCF.isArray(oldVal[0].current) && spCF.isString(oldVal[0].current[0]) &&
                newVal[0].current[0] != oldVal[0].current[0]
            ) {
                if (spCF.isObject(newVal[1]) && spCF.isString(newVal[1].slug) && newVal[1].slug == 'case') {
                    newVal[1].name = 'Case (for the last ' + newVal[0].current[0] + ')';
                }
                if (scope.currUrl) {
                    let localScope = scope;
                    initAjax(localScope, $http, spCF, newVal[0].current[0]);
                }
            }
        }
    }, true);

    scope.$watch('caseList', function () {
        scope.fields = scope.fields.map((el) => {
            if (spCF.isString(el.slug) && el.slug == 'case') {
                el.list = scope.caseList;
            }

            return el;
        });
    });

    scope.save = function () {
        let data = {};
        let formConfirmed = true;
        let submitBtn = $('.modal .create-case').find('.btn-submit');

        if (!submitBtn.hasClass('disabled')) {
            scope.fields.forEach(function (oneField) {
                scope.$apply(function () {
                    oneField.errors = false;
                });
                if (oneField.required && !((spCF.isString(oneField.current) || spCF.isArray(oneField.current)) && oneField.current.length > 0)) {
                    scope.$apply(function () {
                        oneField.errors = true;
                        formConfirmed = false;
                    });
                }

                oneField.slug = oneField.slug || false;
                oneField.current = oneField.current || '';
                oneField.type = oneField.type || false;
                if (oneField.slug && oneField.current.length > 0 && oneField.type) {
                    switch (oneField.type) {
                        case 'text':
                        case 'textarea':
                            data[oneField.slug] = oneField.current;
                            break;
                        case 'select':
                            oneField.isMultiple = oneField.isMultiple || false;
                            if (oneField.current.length > 0) {
                                data[oneField.slug] = oneField.isMultiple ? JSON.stringify(oneField.current) : oneField.current[0];
                            }
                            break;
                    }
                }

            });

            if (formConfirmed) {
                submitBtn.addClass('disabled');
                if (submitBtn.attr('data-saving')) {
                    submitBtn.text(submitBtn.attr('data-saving'));
                }

                // Reformat events
                if (spCF.isArray(scope.eventsId)) {
                    data['events-id'] = scope.eventsId.join("|");
                    data['is_alerts'] = scope.isAlerts;
                }

                // Form link
                let href = scope.currUrl ? scope.currUrl + '/update-case-events' : false;
                if (href) {
                    $('.cd-main-content').waitAnimationStart();
                    $http({
                        method: "POST",
                        url: href,
                        dataType: "json",
                        data: data
                    }).then(function successCallback(response) {
                        response = response.data || {};
                        submitBtn.removeClass('disabled');
                        submitBtn.text(submitBtn.attr('data-label'));

                        if (response.success && response.success == true) {
                            scope.savedSuccess = 'Case successfully created!';
                            scope.savedErrors = undefined;

                            setTimeout(function () {
                                $route.reload();
                                $('.cd-main-content').waitAnimationStop();
                            }, 1000);
                        } else {
                            scope.savedErrors = typeof response.message != "undefined" ? response.message : 'Something went wrong!';
                            scope.savedSuccess = undefined;
                            $('.cd-main-content').waitAnimationStop();
                        }
                    }, function errorCallback(response) {
                        scope.savedErrors = 'Something went wrong!';
                        scope.savedSuccess = undefined;

                        $('.cd-main-content').waitAnimationStop();

                        submitBtn.removeClass('disabled');
                        submitBtn.text(submitBtn.attr('data-label'));
                        console.log('connection error');
                    });
                }
            }
        }
    };
};