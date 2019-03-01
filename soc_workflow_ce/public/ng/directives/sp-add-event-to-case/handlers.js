/**
 * @param scope
 * @param $http
 * @param $route
 * @param spCF
 */
module.exports = function (scope, $http, $route, spCF) {
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