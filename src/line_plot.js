var margin = {top: 10, right: 20, bottom: 10, left: 20};
var padding = {outer: 20, inner: 50};
var w = 500 - margin.left - margin.right;
var h = 500 - margin.top - margin.bottom;
var svgChart;

//var csv_path = "../assets/tlc/green/green_tripdata_2016-06.csv";
var csv_path = "../assets/tlc/green/subset.csv";

var tripsPerDay = {};

function renderLineChart() {
    var lxScale = d3.scalePoint()
                    .domain(Object.keys(tripsPerDay))
                    .range([padding.outer, w - padding.outer]);

    var lyScale = d3.scaleLinear()
                    //.domain([0, d3.max(Object.values(tripsPerDay))])
                    .domain([d3.min(Object.values(tripsPerDay)), d3.max(Object.values(tripsPerDay))])
                    .range([h - padding.outer, padding.outer]);

    var xAxis = d3.axisBottom(lxScale);       
    var xAxisGroup = d3.select("#xAxis").call(xAxis);

    var yAxis = d3.axisLeft(lyScale);          
    var yAxisGroup = d3.select("#yAxis").call(yAxis);

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

    svgChart.append("path")
            .attr("class", "line")
            .attr("d", line(tripsPerDayArray))
            .attr("fill", "none")
            .style("stroke", "green")
            .attr("stroke-width", "3px")
            .on("mouseover", function(d) {
                d3.event.stopPropagation();
                d3.event.preventDefault();

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
}

function readCsv() {
    console.time('loading svg');
    var timeParser = d3.timeParse("%Y-%m-%d %H:%M:%S");
    d3.csv(csv_path, function(data) {
        data.slice(1, data.length).forEach(function(d) {
            var day = timeParser(d.lpep_pickup_datetime).getDate();
            if (day in tripsPerDay) {
                tripsPerDay[day]++;
            } else {
                tripsPerDay[day] = 1;
            }
        });
        console.timeEnd('loading svg');

        console.time('drawing svg');
        renderLineChart();
        console.timeEnd('drawing svg');
    });
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

createLineChartSvg();
readCsv();