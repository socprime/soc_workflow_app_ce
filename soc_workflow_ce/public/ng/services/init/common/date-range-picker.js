import moment from 'moment';

require('daterangepicker');
require('jquery.cookie');

const defaultRange = {
    'Today': [moment().startOf('day'), moment().endOf('day')],
    'Yesterday': [moment().startOf('day').subtract(1, 'days'), moment().endOf('day').subtract(1, 'days')],
    'Last 7 Days': [moment().startOf('day').subtract(6, 'days'), moment().endOf('day')],
    'Last 30 Days': [moment().startOf('day').subtract(29, 'days'), moment().endOf('day')],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
};

const defaultRangeKibanaRanges = Object.assign({}, defaultRange, {
    'Last 7 Days': [moment().subtract(7, 'days'), moment()],
    'Last 30 Days': [moment().subtract(30, 'days'), moment()]
});

/**
 * @param cookieFrom
 * @param cookieTo
 * @param format
 * @returns {{from: moment.Moment, to: *|moment.Moment}}
 */
const getPeriodByCookiesName = function (cookieFrom, cookieTo, format, currentRange) {
    format = format || 'X';

    let range = {
        from: moment().subtract(29, 'days'),
        to: moment()
    };

    if (typeof cookieFrom == "string" && typeof cookieTo == "string") {
        let rangeFrom = $.cookie(cookieFrom);
        let rangeTo = $.cookie(cookieTo);

        if (rangeFrom && rangeTo) {
            let defaultRangeList = Object.keys(currentRange);
            if (defaultRangeList.includes(rangeFrom) && Array.isArray(currentRange[rangeFrom])) {
                range.from = currentRange[rangeFrom][0] || range.from;
                range.to = currentRange[rangeFrom][1] || range.to;
                range.name = rangeFrom;
            } else {
                range.from = moment(rangeFrom, format);
                range.to = moment(rangeTo, format);
            }
        }
    }

    return range;
};

/**
 * @param selector
 * @param start
 * @param end
 * @param title
 * @param dateFormat
 */
const updatePickerTitle = function (selector, start, end, title, dateFormat, currentRange) {
    let titleSpan = '';
    if (Object.keys(currentRange).includes(title)) {
        titleSpan = title;
    } else {
        titleSpan = start.format(dateFormat) + ' - ' + end.format(dateFormat);
    }

    if (typeof selector == 'string' && selector.length > 0) {
        $(selector + ' span').html(titleSpan);
    }
};

require('ui/modules').get('app/soc_workflow_ce', []).service('spInitCommonDateRangePicker', [
    '$http',
    'spGetRangeFromPicker',
    function ($http, spGetRangeFromPicker) {
        return function (selector, cookieFrom, cookieTo, options) {
            selector = selector || '';
            cookieFrom = cookieFrom || false;
            cookieTo = cookieTo || false;
            options = options || {};

            let useKibanaDateRanges = options.useKibanaDateRanges || false;
            let currentRange = useKibanaDateRanges ? defaultRangeKibanaRanges : defaultRange;
            let range = getPeriodByCookiesName(cookieFrom, cookieTo, (options.cookieFormat || undefined), currentRange);

            let defaultOptions = {
                "opens": "left",
                startDate: range.from,
                endDate: range.to,
                applyClass: 'btn btn-sm btn-secondary',
                cancelClass: 'btn btn-sm btn-secondary',
                ranges: currentRange
            };

            if (typeof options == "object") {
                defaultOptions = $.extend({}, defaultOptions, options);
            }

            let dateFormat = 'MMMM D, YYYY';
            try {
                dateFormat = defaultOptions.locale.format;
            } catch (e) {
            }

            try {
                updatePickerTitle(selector, defaultOptions.startDate, defaultOptions.endDate, (range.name || null), dateFormat, currentRange);
            } catch (e) {
            }
            try {
                $(selector).daterangepicker(defaultOptions, function (rangeFrom, rangeTo, rangeTitle) {
                    updatePickerTitle(selector, rangeFrom, rangeTo, rangeTitle, dateFormat, currentRange);
                });
            } catch (e) {
            }

            $(selector).on('apply.daterangepicker', function (ev, picker) {
                let dateRange = {
                    from: 0,
                    to: 0
                };

                let defaultRangeList = Object.keys(currentRange);
                let currRange = $(selector).data('daterangepicker').chosenLabel;

                if (defaultRangeList.includes(currRange) && Array.isArray(currentRange[currRange])) {
                    dateRange.from = currRange;
                    dateRange.to = currRange;
                } else {
                    dateRange = spGetRangeFromPicker(selector, (typeof options.cookieFormat == 'string' && options.cookieFormat == 'x'));
                }

                if (cookieFrom && cookieTo) {
                    $.cookie(cookieFrom, dateRange.from, {expires: 365, path: '/'});
                    $.cookie(cookieTo, dateRange.to, {expires: 365, path: '/'});
                }
            });
        };
    }]);
