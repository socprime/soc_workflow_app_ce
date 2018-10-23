require('ui/modules').get('app/soc_workflow_ce', []).service('spInitChartDonut', [
    function () {
        return function (chartSelector, chartLegendSelector, chartSrc, chartObj) {
            chartSrc = chartSrc || {};
            let chart = {
                'id': chartSelector || '',
                'legendContainer': chartLegendSelector || '',
                'content': chartSrc.data || [],
                'names': chartSrc.names || [],
                'colors': chartSrc.colors || [],
                'total': chartSrc.total || '',
                'object': chartObj || null
            };

            try {
                chart.object = $(chart.id).createC3DonutPieChart({
                    selector: chart.id,
                    dataColumns: chart.content,
                    dataNames: chart.names,
                    dataType: "donut",
                    dataOrder: null,
                    sizeHeight: 290,
                    donutTitle: typeof chart.total != "undefined" ? chart.total : '',
                    donutWidth: 30,
                    donutLabelShow: false,
                    legendShow: false,
                    tooltipFormatValue: function (value, ratio, id) {
                        let chunks = [];
                        let chunkSize = 3;

                        value = value.toString().split("").reverse().join("");

                        while (value) {
                            if (value.length < chunkSize) {
                                chunks.push(value);
                                break;
                            }
                            else {
                                chunks.push(value.substr(0, chunkSize));
                                value = value.substr(chunkSize);
                            }
                        }

                        value = chunks.join(" ");

                        value = value.toString().split("").reverse().join("");

                        ratio = parseInt(ratio * 100) + '%';

                        return ratio + ' (' + value + ')';
                    },
                    colorPattern: chart.colors
                });
            } catch (e) {
                console.log(e);
            }

            try {
                if (chart.object !== null) {
                    d3.select(chart.legendContainer).html('');
                    d3.select(chart.legendContainer).selectAll('div')
                        .data(Object.keys(chart.object.internal.config.data_names))
                        .enter().append('span').attr('class', 'c3-legend-item-custom-container')
                        .attr('data-id', function (id) {
                            return id;
                        })
                        .html(function (id) {
                            let result = '';
                            result += '<span class="c3-legend-item-tile-custom" style="background-color: ' + chart.object.color(id) + '"></span>';
                            let name = (typeof chart.object.internal.config.data_names[id] !== "undefined") ? chart.object.internal.config.data_names[id] : id;
                            result += '<span>' + name + '</span>';
                            return result;
                        })
                        .on('mouseover', function (id) {
                            chart.object.focus(id);
                        })
                        .on('mouseout', function (id) {
                            chart.object.revert();
                        })
                        .on('click', function (id) {
                            $(this).toggleClass("c3-legend-item-hidden");
                            chart.object.toggle(id);
                        });

                    $(chart.legendContainer).closest('.donut-chart-legend-container').removeClass('hidden');
                }
            } catch (e) {
                console.log(e);
            }

            return chart.object;
        };
    }]);
