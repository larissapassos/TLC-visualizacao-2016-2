var margin = {top: 10, right: 20, bottom: 10, left: 20};
var padding = {outer: 20, inner: 50};
var w = 500 - margin.left - margin.right;
var h = 500 - margin.top - margin.bottom;
var svgChart;

//var csv_path = "../assets/tlc/green/green_tripdata_2016-06.csv";
var csv_path = "../assets/tlc/green/subset2.csv";

var tripsPerDay = {};

var chartXAxis = false;
var chartYAxis = false;

function renderLineChart() {
    getTripsPerDay();

    var lxScale = d3.scalePoint()
                    .domain(Object.keys(tripsPerDay))
                    .range([padding.outer, w - padding.outer]);

    var lyScale = d3.scaleLinear()
                    //.domain([0, d3.max(Object.values(tripsPerDay))])
                    .domain([d3.min(Object.values(tripsPerDay)), d3.max(Object.values(tripsPerDay))])
                    .range([h - padding.outer, padding.outer]);

    var xAxis = d3.axisBottom(lxScale);

    if(!chartXAxis) {       
        d3.select("#xAxis").call(xAxis);
        chartXAxis = true;
    } else {
        d3.select("#xAxis").transition().call(xAxis);
    }

    var yAxis = d3.axisLeft(lyScale);   

    if(!chartYAxis) {       
        d3.select("#yAxis").call(yAxis);
        chartYAxis = true;
    } else {
        d3.select("#yAxis").transition().call(yAxis);
    }

    var tripsPerDayArray = [];
    Object.keys(tripsPerDay).forEach(function(k) {
        var newObject = {};
        newObject["day"] = k;
        newObject["count"] = tripsPerDay[k];
        tripsPerDayArray.push(newObject);
    })

    line = d3.line()
             .x(function(d) { return lxScale(d.day) + padding.inner; })
             .y(function(d) { return lyScale(d.count); });
    
    var lineBind = svgChart.selectAll(".line")
                            .data([tripsPerDayArray]);

    lineBind.enter()
            .append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d); })
            .attr("fill", "none")
            .style("stroke", "blue")
            .attr("stroke-width", "3px")
            .on("mouseover", function(d) {
                if (d3.event != null) {
                    d3.event.stopPropagation();
                    d3.event.preventDefault();
                }

                d3.select(this).attr("stroke-width", "5px");
            })
            .on("mouseout", function(d) {
                d3.event.stopPropagation();
                d3.event.preventDefault();

                d3.select(this).attr("stroke-width", "3px");
            })
            .append("title")
            .text(function(d) {
                return "Green Cab Trips";
            });
    
    lineBind.exit()
            .remove();
    
    lineBind.transition()
            .attr("d", function(d) { return line(d); })
            .attr("fill", "none")
            .style("stroke", "blue")
            .attr("stroke-width", "3px");
}

function getTripsPerDay() {
    var timeParser = d3.timeParse("%Y-%m-%d %H:%M:%S");
    tripsPerDay = {};
    selectedData.forEach(function(d) {
            var day = timeParser(d.lpep_pickup_datetime).getDate();
            if (day in tripsPerDay) {
                tripsPerDay[day]++;
            } else {
                tripsPerDay[day] = 1;
            }
    });
}

function readCsv() {
    if (!loaded) {
        console.time('loading svg');
        d3.csv(csv_path, function(data) {
            loadedData = data.slice(1, data.length);
            selectedData = loadedData.slice();
            loaded = true;
            console.timeEnd('loading svg');

            console.time('drawing svg');
            renderLineChart();
            console.timeEnd('drawing svg');
    });
    }
}

function createLineChartSvg() {
    svgChart = d3.select("body")
            .append("svg")
            .attrs({
                width : w + margin.left + margin.right,
                height: h + margin.top + margin.bottom,
                transform : "translate(" + margin.left + "," + margin.top + ")"
            })
            .on("mousedown", function(d) {
                d3.event.stopPropagation();
                d3.event.preventDefault();
            });

    svgChart.append("g")
            .attr("id","xAxis")
            .attr("transform","translate(" + padding.inner + "," + (h - margin.bottom) + ")");

    svgChart.append("g")
            .attr("id","yAxis")
            .attr("transform","translate(" + (padding.inner + margin.left) + ",0)");
}

function initLinePlot() {
    createLineChartSvg();
    readCsv();
}