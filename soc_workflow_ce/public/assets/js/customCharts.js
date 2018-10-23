(function ($) {
    $.fn.createChart = function (params) {
        params = params || {};
        params.selector = params.selector || undefined;
        params.regions = params.regions || [];
        params.dataRows = params.dataRows || {};
        params.dataGroups = params.dataGroups || [];
        params.dataRegions = params.dataRegions || {};
        params.dataType = params.dataType || 'bar';
        params.dataAxes = params.dataAxes || {};
        params.dataClasses = params.dataClasses || {};
        params.noData = params.noData || "No Data";
        params.axisXType = params.axisXType || "indexed";
        params.axisXTickFormat = params.axisXTickFormat || undefined;
        params.axisXTickFit = params.axisXTickFit || true;
        params.axisXTickCount = params.axisXTickCount || undefined;
        params.axisYLabel = params.axisYLabel || undefined;
        params.axisYNegative = params.axisYNegative || false;
        params.axisYMin = params.axisYMin || (params.axisYNegative ? undefined : 0);
        params.axisYMax = params.axisYMax || undefined;
        params.axisYTickValues = params.axisYTickValues || undefined;
        params.axisYTickOnlyInteger = params.hasOwnProperty('axisYTickOnlyInteger') ? params.axisYTickOnlyInteger : false;
        params.axisY2Show = params.axisY2Show || false;
        params.axisY2Label = params.axisY2Label || undefined;
        params.dataHide = params.dataHide || [];
        params.dataX = params.dataX || undefined;
        params.dataXFormat = params.dataXFormat || '%Y-%m-%d';
        params.dataNames = params.dataNames || {};
        params.dataOnClick = params.dataOnClick || function () {
        };
        params.sizeHeight = params.sizeHeight || 100;
        params.colorPattern = params.colorPattern || [];
        params.legendShow = params.legendShow || false;
        params.legendHide = params.legendHide || false;
        params.legendItemOnClick = params.legendItemOnClick || undefined;
        params.pointR = params.pointR || 2.5;
        params.paddingLeft = params.paddingLeft || 50;
        params.paddingRight = params.paddingRight || 5;
        params.paddingTop = params.paddingTop || 0;
        params.paddingBottom = params.paddingBottom || 0;
        params.divideAxisYHundredValue = params.divideAxisYHundredValue || false;

        params.inlineCustomTooltip = params.inlineCustomTooltip || false;

        var chart = window.c3.generate({
            bindto: params.selector,
            data: {
                x: params.dataX,
                xFormat: params.dataXFormat,
                rows: params.dataRows,
                type: params.dataType,
                groups: params.dataGroups,
                regions: params.dataRegions,
                onclick: params.dataOnClick,
                order: 'null',
                empty: {
                    label: {
                        text: params.noData
                    }
                },
                names: params.dataNames,
                hide: params.dataHide,
                selection: {
                    enabled: true,
                    multiple: false
                },
                axes: params.dataAxes,
                classes: params.dataClasses
            },
            regions: params.regions,
            size: {
                height: params.sizeHeight
            },
            axis: {
                x: {
                    type: params.axisXType,
                    tick: {
                        count: params.axisXTickCount,
                        format: params.axisXTickFormat,
                        fit: params.axisXTickFit
                    }
                },
                y: {
                    default: [0, 10],
                    padding: 0,
                    min: params.axisYMin,
                    max: params.axisYMax,
                    label: params.axisYLabel,
                    tick: {
                        values: params.axisYTickValues,
                        format: function (d) {
                            var result = params.axisYTickOnlyInteger ? '' : d;

                            if (Number.isInteger(d)) {
                                if (params.divideAxisYHundredValue) {
                                    var chunks = [];
                                    var chunkSize = 3;

                                    d = d.toString().split("").reverse().join("");

                                    while (d) {
                                        if (d.length < chunkSize) {
                                            chunks.push(d);
                                            break;
                                        }
                                        else {
                                            chunks.push(d.substr(0, chunkSize));
                                            d = d.substr(chunkSize);
                                        }
                                    }

                                    result = chunks.join(" ");

                                    result = result.toString().split("").reverse().join("");
                                } else {
                                    result = d;
                                }
                            }

                            return result;
                        }
                    }
                },
                y2: {
                    show: params.axisY2Show,
                    default: [0, 10],
                    padding: 0,
                    label: params.axisY2Label,
                    tick: {
                        format: function (d) {
                            return (Number.isInteger(d) ? d : "");
                        }
                    }
                }
            },
            legend: {
                show: params.legendShow,
                hide: params.legendHide,
                item: {
                    onclick: params.legendItemOnClick
                }
            },
            padding: {
                left: params.paddingLeft,
                right: params.paddingRight,
                top: params.paddingTop,
                bottom: params.paddingBottom
            },
            grid: {
                x: {
                    show: true
                },
                y: {
                    show: true
                }
            },
            color: {
                pattern: params.colorPattern
            },
            point: {
                r: params.pointR
            },
            /*zoom: {
             enabled: true
             },*/
            tooltip: {
                contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                    var userParams = params;
                    userParams.inlineCustomTooltip = userParams.inlineCustomTooltip || false;

                    if (userParams.inlineCustomTooltip) {
                        userParams.tooltipCategoryValueAppendText = userParams.tooltipCategoryValueAppendText || '';
                        userParams.inlineCustomTooltipCategoryShow = true;
                        userParams.inlineCustomTooltipValueShow = true;

                        userParams.categoryValue = d[0].value + (userParams.tooltipCategoryValueAppendText ? ' ' + userParams.tooltipCategoryValueAppendText : '');


                        return customTooltipContentInline(this, d, defaultTitleFormat, defaultValueFormat, color, userParams);
                    } else {
                        return customTooltipContentTable(this, d, defaultTitleFormat, defaultValueFormat, color, userParams);
                    }
                },
                position: function (dataToShow, tWidth, tHeight, element) {
                    return customTooltipPosition(this, dataToShow, tWidth, tHeight, element);
                }
            }
        });

        return chart;
    };

    $.fn.createC3DonutPieChart = function (params) {
        params = params || {};
        params.selector = params.selector || undefined;
        params.dataColumns = params.dataColumns || {};
        params.dataType = params.dataType || 'donut';
        params.dataNames = params.dataNames || {};
        params.dataOrder = params.hasOwnProperty('dataOrder') ? params.dataOrder : 'desc';
        params.dataOnClick = params.dataOnClick || function () {
        };
        params.sizeHeight = params.sizeHeight || 250;
        params.colorPattern = params.colorPattern || undefined;
        params.legendShow = params.hasOwnProperty('legendShow') ? params.legendShow : true;
        params.legendItemOnClick = params.legendItemOnClick || undefined;
        params.legendPosition = params.legendPosition || 'bottom';
        params.tooltipFormatValue = params.tooltipFormatValue || undefined;
        params.donutTitle = params.donutTitle || '';
        params.donutWidth = params.donutWidth || 'auto';
        params.donutLabelShow = params.donutLabelShow || false;
        params.paddingLeft = params.paddingLeft || undefined;
        params.paddingRight = params.paddingRight || undefined;
        params.paddingTop = params.paddingTop || undefined;
        params.paddingBottom = params.paddingBottom || undefined;
        params.inlineCustomTooltipValueBold = params.hasOwnProperty('inlineCustomTooltipValueBold') ? params.inlineCustomTooltipValueBold : true;

        var chart = window.c3.generate({
            bindto: params.selector,
            data: {
                columns: params.dataColumns,
                type: params.dataType,
                names: params.dataNames,
                order: params.dataOrder,
                onclick: params.dataOnClick
            },
            size: {
                height: params.sizeHeight
            },
            legend: {
                show: params.legendShow,
                item: {
                    onclick: params.legendItemOnClick
                },
                position: params.legendPosition
            },
            donut: {
                title: params.donutTitle,
                width: params.donutWidth,
                expand: false,
                label: {
                    show: params.donutLabelShow
                }
            },
            padding: {
                left: params.paddingLeft,
                right: params.paddingRight,
                top: params.paddingTop,
                bottom: params.paddingBottom
            },
            color: {
                pattern: params.colorPattern
            },
            tooltip: {
                format: {
                    value: params.tooltipFormatValue
                },
                contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                    var userParams = params;
                    userParams.tooltipCategoryValueAppendText = userParams.tooltipCategoryValueAppendText || '';
                    userParams.inlineCustomTooltipCategoryShow = true;
                    userParams.inlineCustomTooltipValueShow = true;
                    userParams.inlineCustomTooltipForPie = true;

                    userParams.categoryValue = d[0].value + (userParams.tooltipCategoryValueAppendText ? ' ' + userParams.tooltipCategoryValueAppendText : '');

                    return customTooltipContentInline(this, d, defaultTitleFormat, defaultValueFormat, color, userParams);
                },
                position: function (dataToShow, tWidth, tHeight, element) {
                    return customTooltipPosition(this, dataToShow, tWidth, tHeight, element);
                }
            }
        });

        $(window).on('resize', function () {
            chart.resize();
        });

        return chart;
    };

    var customTooltipPosition = function (thisObj, dataToShow, tWidth, tHeight, element) {
        var $$ = thisObj, config = $$.config, d3 = $$.d3;
        var svgLeft, tooltipLeft, tooltipRight, tooltipTop, chartRight;
        var forArc = $$.hasArcType(),
            mouse = d3.mouse(element);

        // Determin tooltip position
        if (forArc) {
            tooltipLeft = (($$.width - ($$.isLegendRight ? $$.getLegendWidth() : 0)) / 2) + mouse[0];
            tooltipTop = ($$.height / 2) + mouse[1] + 20;
        } else {
            svgLeft = $$.getSvgLeft(true);
            if (config.axis_rotated) {
                tooltipLeft = svgLeft + mouse[0] + 100;
                tooltipRight = tooltipLeft + tWidth;
                chartRight = $$.currentWidth - $$.getCurrentPaddingRight();
                tooltipTop = $$.x(dataToShow[0].x) - 10;
            } else {
                tooltipLeft = svgLeft + $$.getCurrentPaddingLeft(true) + $$.x(dataToShow[0].x) + 8;
                tooltipRight = tooltipLeft + tWidth;
                chartRight = svgLeft + $$.currentWidth - $$.getCurrentPaddingRight();
                tooltipTop = mouse[1] - 10;
            }

            if (tooltipRight > chartRight) {
                // 20 is needed for Firefox to keep tooltip width
                tooltipLeft -= tooltipRight - chartRight + 8;
            }

            tooltipTop -= tHeight - 5;
        }

        if (tooltipTop < 0) {
            tooltipTop = 0;
        }

        return {top: tooltipTop, left: tooltipLeft};
    };

    var customTooltipContentInline = function (thisObj, d, defaultTitleFormat, defaultValueFormat, color, userParams) {
        userParams.categoryValue = userParams.categoryValue || '';
        userParams.inlineCustomTooltipForPie = userParams.hasOwnProperty('inlineCustomTooltipForPie') ? userParams.inlineCustomTooltipForPie : false;
        userParams.inlineCustomTooltipCategoryShow = userParams.hasOwnProperty('inlineCustomTooltipCategoryShow') ? userParams.inlineCustomTooltipCategoryShow : true;
        userParams.inlineCustomTooltipValueShow = userParams.hasOwnProperty('inlineCustomTooltipValueShow') ? userParams.inlineCustomTooltipValueShow : true;
        userParams.inlineCustomTooltipValueBold = userParams.hasOwnProperty('inlineCustomTooltipValueBold') ? userParams.inlineCustomTooltipValueBold : true;

        var sanitise = function (str) {
            return typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str;
        };

        var $$ = thisObj, config = $$.config,
            titleFormat = config.tooltip_format_title || defaultTitleFormat,
            valueFormat = config.tooltip_format_value || defaultValueFormat,
            title;

        var text = '<div id="tooltip" class="module-triangle-bottom">';

        if (userParams.inlineCustomTooltipCategoryShow) {
            var tooltipCategoryText = userParams.inlineCustomTooltipForPie ? d[0].id : d[0].x;
            title = sanitise(titleFormat ? titleFormat(tooltipCategoryText) : tooltipCategoryText);
            text += title + (userParams.inlineCustomTooltipValueShow ? ': ' : '');
        }

        if (userParams.inlineCustomTooltipValueShow) {
            if (userParams.inlineCustomTooltipValueBold) {
                text += '<span style="font-weight: 500;">';
            }

            if (userParams.inlineCustomTooltipForPie) {
                text += sanitise(valueFormat ? valueFormat(userParams.categoryValue, d[0].ratio, d[0].id) : userParams.categoryValue);
            } else {
                text += userParams.categoryValue;
            }

            if (userParams.inlineCustomTooltipValueBold) {
                text += '</span>';
            }
        }

        text += '</div>';

        return text;
    };

    var customTooltipContentTable = function (thisObj, d, defaultTitleFormat, defaultValueFormat, color, userParams) {
        userParams.showTooltipColor = userParams.hasOwnProperty('showTooltipColor') ? userParams.showTooltipColor : false;
        userParams.showTooltipCategoryName = userParams.hasOwnProperty('showTooltipCategoryName') ? userParams.showTooltipCategoryName : false;
        userParams.showTooltipCategoryValue = userParams.hasOwnProperty('showTooltipCategoryValue') ? userParams.showTooltipCategoryValue : false;
        userParams.absTooltipCategoryValue = userParams.hasOwnProperty('absTooltipCategoryValue') ? userParams.absTooltipCategoryValue : false;

        var sanitise = function (str) {
            return typeof str === 'string' ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : str;
        };

        var $$ = thisObj, config = $$.config,
            titleFormat = config.tooltip_format_title || defaultTitleFormat,
            nameFormat = config.tooltip_format_name || function (name) {
                    return name;
                },
            valueFormat = config.tooltip_format_value || defaultValueFormat,
            text, i, title, value, name, bgcolor,
            orderAsc = $$.isOrderAsc();

        if (config.data_groups.length === 0) {
            /* d.sort(function (a, b) {
             var v1 = a ? a.value : null, v2 = b ? b.value : null;
             return orderAsc ? v1 - v2 : v2 - v1;
             });*/
        } else {
            var ids = $$.orderTargets($$.data.targets).map(function (i) {
                return i.id;
            });
            /*d.sort(function (a, b) {
             var v1 = a ? a.value : null, v2 = b ? b.value : null;
             if (v1 > 0 && v2 > 0) {
             v1 = a ? ids.indexOf(a.id) : null;
             v2 = b ? ids.indexOf(b.id) : null;
             }
             return orderAsc ? v1 - v2 : v2 - v1;
             });*/
        }

        for (i = 0; i < d.length; i++) {
            if (!(d[i] && (d[i].value || d[i].value === 0))) {
                continue;
            }

            if (!text) {
                title = sanitise(titleFormat ? titleFormat(d[i].x) : d[i].x);
                text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th>" + title + "</th></tr>" : "");
            }

            value = sanitise(valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index, d));
            if (value !== undefined) {
                // Skip elements when their name is set to null
                if (d[i].name === null) {
                    continue;
                }
                name = sanitise(nameFormat(d[i].name, d[i].ratio, d[i].id, d[i].index));
                bgcolor = color(d[i].id);

                text += "<tr class='" + $$.CLASS.tooltipName + "-" + $$.getTargetSelectorSuffix(d[i].id) + "'>";

                if (userParams.showTooltipColor || userParams.showTooltipCategoryName || userParams.showTooltipCategoryValue) {
                    text += "<td class='name'>";

                    if (userParams.showTooltipColor) {
                        text += "<span class='color-block text-left' style='background-color:" + bgcolor + "'></span>";
                    }

                    if (userParams.showTooltipCategoryName) {
                        text += name;
                    }

                    if (userParams.showTooltipCategoryValue) {
                        if (userParams.showTooltipColor || userParams.showTooltipCategoryName) {
                            text += ": ";
                        }

                        if (userParams.absTooltipCategoryValue) {
                            value = Math.abs(value);
                        }

                        text += "<span style='font-weight: bold;'>" + value + "</span>";
                    }

                    text += "</td>";
                }

                text += "</tr>";
            }
        }
        return text + "</table>";
    };
})(jQuery);