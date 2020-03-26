/**
 * @param scope
 * @param $http
 * @param $route
 * @param spCF
 * @param spSavedSearchIntegrationSave
 */
module.exports = function (scope, $http, $route, spCF, spSavedSearchIntegrationSave) {
    /**
     *
     */
    scope.addAdditionalFields = function () {
        if (spCF.isArray(scope.additionalFields) && spCF.isString(scope.additionalFields[0])) {
            scope.fields.push({
                name: scope.additionalFields[0],
                slug: scope.additionalFields[0],
                removable: true,
                type: scope.fieldType.text,
            });

            delete scope.formattedEnabledFieldList[scope.additionalFields];
        }
    };

    /**
     * @param currField
     */
    scope.removeCurrentFields = function (currField) {
        if (spCF.isString(currField.name)) {
            let fieldName = false;
            let fieldSlug = false;
            let fieldId = -1;
            scope.fields.forEach(function (field) {
                if (spCF.isString(field.name) && spCF.isString(field.slug) && field.name == currField.name) {
                    fieldName = field.name;
                    fieldSlug = field.slug;
                    fieldId = scope.fields.indexOf(field);
                }
            });

            if (fieldName && fieldSlug && fieldId > -1) {
                scope.fields.splice(fieldId, 1);
                scope.formattedEnabledFieldList[fieldSlug] = fieldName;
            }
        }
    };

    /**
     *
     */
    scope.saveCase = function () {
        let data = {};
        let formConfirmed = true;
        let submitBtn = $('.modal .modal-footer').find('.btn-submit');

        if (!submitBtn.hasClass('disabled')) {
            submitBtn.addClass('disabled');
            if (submitBtn.attr('data-saving')) {
                submitBtn.text(submitBtn.attr('data-saving'));
            }
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
                // Add saved search
                spSavedSearchIntegrationSave(scope, data);

                // Reformat events
                if (spCF.isArray(scope.eventsId)) {
                    data['events-id'] = scope.eventsId.join("|");
                    data['is_alerts'] = spCF.isArray(scope.alertsList) && scope.alertsList.length > 0;
                }

                // Form link
                let href = scope.currUrl ? scope.currUrl + '/create-case' : false;
                if (href) {
                    $('.cd-main-content').waitAnimationStart();
                    $http({
                        method: "POST",
                        url: href,
                        dataType: "json",
                        data: data
                    }).then(function successCallback(response) {
                        response = response.data || {};

                        if (response.success && response.success == true) {
                            scope.savedSuccess = 'Case successfully created!';
                            scope.savedErrors = undefined;

                            setTimeout(function () {
                                $route.reload();
                                $('.cd-main-content').waitAnimationStop();
                            }, 1000);
                        } else {
                            $('.cd-main-content').waitAnimationStop();
                            scope.savedErrors = typeof response.message != "undefined" ? response.message : 'Something went wrong!';
                            scope.savedSuccess = undefined;
                        }
                    }, function errorCallback(response) {
                        scope.savedErrors = 'Something went wrong!';
                        scope.savedSuccess = undefined;

                        submitBtn.removeClass('disabled');
                        submitBtn.text(submitBtn.attr('data-label'));
                        console.log('connection error');

                        $('.cd-main-content').waitAnimationStop();
                    });
                }
            } else {
                submitBtn.removeClass('disabled');
                if (submitBtn.attr('data-label')) {
                    submitBtn.text(submitBtn.attr('data-label'));
                }
            }
        }
    };
};