/**
 * @param scope
 * @param $http
 * @param $route
 * @param spCF
 */
module.exports = function (scope, $http, $route, spCF) {
    scope.formattedAllStages = {};
    if (spCF.isArray(scope.allStages)) {
        scope.allStages.forEach(function (field) {
            if (spCF.isString(field)) {
                scope.formattedAllStages[field] = field;
            }
        });
    }

    /**
     *
     */
    scope.processCase = function () {
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
                data['event_id'] = spCF.isArray(scope.selectedItem) ?
                    scope.selectedItem.join('|') : spCF.isString(scope.selectedItem) ?
                        scope.selectedItem : '';

                submitBtn.addClass('disabled');
                if (submitBtn.attr('data-saving')) {
                    submitBtn.text(submitBtn.attr('data-saving'));
                }

                // Form link
                let href = scope.currUrl ? scope.currUrl + '/cases-log-stage' : false;
                if (href) {
                    $http({
                        method: "POST",
                        url: href,
                        data: $.param(data),
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    }).then(function successCallback(response) {
                        response = response.data || {};
                        submitBtn.removeClass('disabled');
                        submitBtn.text(submitBtn.attr('data-label'));

                        if (response.success && response.success == true) {
                            scope.savedSuccess = 'Case successfully created!';
                            scope.savedErrors = undefined;

                            setTimeout(function () {
                                $route.reload();
                            }, 1000);
                        } else {
                            scope.savedErrors = typeof response.message != "undefined" ? response.message : 'Something went wrong!';
                            scope.savedSuccess = undefined;
                        }
                    }, function errorCallback(response) {
                        scope.savedErrors = 'Something went wrong!';
                        scope.savedSuccess = undefined;

                        submitBtn.removeClass('disabled');
                        submitBtn.text(submitBtn.attr('data-label'));
                        console.log('connection error');
                    });
                }
            }
        }
    };

    // Set current operator
    //let currentOperatorName = $.trim($('[ng-controller="securityNavController"] .global-nav-link:first-child .global-nav-link__title').text());
    scope.userList = scope.userList || [];
    let tmpUserList = {};
    scope.userList.forEach(function (el) {
        tmpUserList[el] = el;
    });

    scope.fields.push({
        name: 'Operator',
        slug: 'operator',
        type: scope.fieldType.select,
        required: true,
        //current: (currentOperatorName.length > 0 && spCF.isString(tmpUserList[currentOperatorName])) ? currentOperatorName : '',
        list: tmpUserList
    });

    // Set available stage
    scope.fields.push({
        name: 'Stage',
        slug: 'available-stage',
        type: scope.fieldType.select,
        list: scope.formattedAllStages,
        required: true
    });

    // Set comments
    scope.fields.push({
        name: 'Comment',
        slug: 'comment',
        type: scope.fieldType.textarea,
        required: true,
    });
};