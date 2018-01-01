var myOffset = new Date().getTimezoneOffset();

// converts date format from JSON
function getChartDate(d) {
    // offset in minutes is converted to milliseconds and subtracted so that chart's x-axis is correct
    return Date.parse(d) - (myOffset * 60000);
}

$(document).on('page:load ready', function() {
    // blank array for holding chart data
    var chartData = [[], []];
    // variable for the local date in milliseconds
    var localDate;
    // variable for the last date added to the chart
    var last_date;
    var dynamicChart = [];

    // get the data with a webservice call
    $.getJSON('https://thingspeak.com/channels/386789/feed.json?offset=0&amp;results=288', function(data) {

        var chartOptions = [2];
        // if no access
        if (data == '-1') {
            $('#chart-container').append('This channel is not public.  To embed charts, the channel must be public or a read key must be specified.');
        }
        console.log(data);

        $.each(data.feeds, function(i, feed) {
            var p1 = new Highcharts.Point();
            var v1 = this.field1;
            p1.x = getChartDate(this.created_at);
            p1.y = parseFloat(v1);
            if (this.location) {
                p1.name = this.location;
            }
            if (!isNaN(parseInt(v1))) {
                chartData[0].push(p1);
            }

            if (this.field2 !== undefined) {
                var p2 = new Highcharts.Point();
                var v2 = this.field2;
                p2.x = getChartDate(this.created_at);
                p2.y = parseFloat(v2);
                if (this.location) {
                    p2.name = this.location;
                }
                if (!isNaN(parseInt(v2))) {
                    chartData[1].push(p2);
                }
            }
        });

        for (var i = 0; i < 2; i++) {
            // specify the chart options
            chartOptions[i] = {
                chart: {
                    renderTo: 'chart-container-' + (i + 1),
                    defaultSeriesType: 'line',
                    backgroundColor: '#ffffff',
                    events: {
                        load: function () {
                            //if dynamic and no "timeslice" options are set
                            //   GAK 02/16/2013 Let's try to add the last "average" slice if params[:average]

                            var url = 'https://thingspeak.com/channels/386789/feed/last.json?callback=?&amp;offset=0&amp;location=true&amp;results=288';
                            if ("".length > 0) {
                                url = 'https://thingspeak.com/channels/386789/feed/last_average.json?callback=?&amp;offset=0&amp;location=true&amp;average=&amp;results=288';
                            } else if ("".length > 0) {
                                url = 'https://thingspeak.com/channels/386789/feed/last_median.json?callback=?&amp;offset=0&amp;location=true&amp;median=&amp;results=288';
                            } else if ("".length > 0) {
                                url = 'https://thingspeak.com/channels/386789/feed/last_sum.json?callback=?&amp;offset=0&amp;location=true&amp;sum=&amp;results=288';
                            }

                            if ('true' === 'true' && (''.length < 1)) {
                                // push data every 15 seconds
                                setInterval(function () {
                                    // get the data with a webservice call if we're just getting the last channel
                                    $.getJSON(url, function (data) {
                                        // if data exists
                                        if (data && data.field1) {
                                            for (var i = 0; i < 2; i++) {
                                                var p = new Highcharts.Point();
                                                // set the proper values
                                                var v = i === 0 ? this.field1 : this.field2;

                                                p.x = getChartDate(data.created_at);
                                                p.y = parseFloat(v);
                                                // add location if possible
                                                if (data.location) {
                                                    p.name = data.location;
                                                }
                                                // get the last date if possible
                                                if (dynamicChart[i].series[0].data.length > 0) {
                                                    last_date = dynamicChart[i].series[0].data[dynamicChart[i].series[0].data.length - 1].x;
                                                }
                                                var shift = false; //default for shift

                                                //if push is requested in parameters
                                                // then if results is and data.length is < results, shift = false
                                                var results = 288;

                                                if (results && dynamicChart[i].series[0].data.length + 1 >= results) {
                                                    shift = true;
                                                }
                                                // if a numerical value exists and it is a new date, add it
                                                if (!isNaN(parseInt(v)) && (p.x != last_date)) {
                                                    dynamicChart[i].series[0].addPoint(p, true, shift);
                                                } else {
                                                    dynamicChart[i].series[0].data[dynamicChart[i].series[0].data.length - 1].update(p);
                                                }
                                            }
                                        }
                                    });

                                }, 60000);
                            }
                        }
                    },
                    zoomType: 'x'
                },
                title: {
                    text: ''
                },
                plotOptions: {
                    line: {
                        color: '#d62020'
                    },
                    bar: {
                        color: '#d62020'
                    },
                    column: {
                        color: '#d62020'
                    },
                    spline: {
                        color: '#d62020'
                    },
                    series: {
                        marker: {
                            radius: 3
                        },
                        animation: true,
                        step: false,
                        borderWidth: 0,
                        turboThreshold: 0
                    }
                },
                exporting: {
                    enabled: false
                },
                tooltip: {
                    // reformat the tooltips so that local times are displayed
                    formatter: function () {
                        var d = new Date(this.x + (myOffset * 60000));
                        var n = (this.point.name === undefined) ? '' : '<br/>' + this.point.name;
                        return this.series.name + ':<b>' + this.y + '</b>' + n + '<br/>' + d.toDateString() + '<br/>' + d.toTimeString().replace(/\(.*\)/, "");
                    }
                },
                xAxis: {
                    type: 'datetime',
                    title: {
                        text: ''
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    min: i === 0 ? 10 : 20,
                    max: i === 0 ? 30 : 50
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: i === 0 ? data.channel.field1 : data.channel.field2
                }],
                credits: {
                    text: 'ThingSpeak.com',
                    href: 'https://thingspeak.com/',
                    style: {
                        color: '#D62020'
                    }
                }
            };

            // add the data to the chart
            chartOptions[i].series[0].data = chartData[i];

            // set chart labels here so that decoding occurs properly
            chartOptions[i].title.text = data.channel.name;
            chartOptions[i].xAxis.title.text = 'Time';
            chartOptions[i].yAxis.title.text = i === 0 ? data.channel.field1 : data.channel.field2;

            // draw the chart
            dynamicChart[i] = new Highcharts.Chart(chartOptions[i]);
        }
        // end getJSON success
    })
    // chained to getjson, on error
        .error(function() {
            $('#chart-container').html('Invalid Channel.');
        });

}); // end document.ready
