require('jquery.cookie');

/**
 * @param isLight
 */
const switchTheme = function (isLight) {
    if (isLight === true) {
        $.cookie('theme', 'light', {expires: 365, path: '/'});
    } else if (isLight === false) {
        $.cookie('theme', 'dark', {expires: 365, path: '/'});
    }
    let currTheme = $.cookie('theme');
    currTheme = typeof currTheme == 'string' ? currTheme : 'dark';

    if (currTheme == 'dark') {
        $('body, .app-container').removeClass('light-body');
    } else if (currTheme == 'light') {
        $('body, .app-container').addClass('light-body');
    }
};

require('ui/modules').get('app/soc_workflow', [])
    .service('spCommonSwitchTheme', [function () {
        return function ($scope) {
            $scope.themeCookie = $.cookie('theme');
            switchTheme();
            $scope.$watch('isLightThemeChecked', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    switchTheme(newValue);
                }
            });
        };
    }]);
