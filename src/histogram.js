var marginHist = {top: 20, right: 20, bottom: 40, left: 60};
var wHist = 500 - marginHist.left - marginHist.right;
var hHist = 500 - marginHist.top - marginHist.bottom;
var histSvg;

var selectedData;
var dataLoaded = false;

var barWidth = 40;
var csv_path_hist = "../assets/tlc/green/subset.csv";

function prettyDay(day) {
    var days = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
    return days[day];
}

function groupTrips() {
    var timeParser = d3.timeParse("%Y-%m-%d %H:%M:%S");
    return selectedData.reduce(function(counts, curr) {
                        var day = timeParser(curr.lpep_pickup_datetime).getDay();
                        counts[day] ? counts[day]++ : counts[day] = 1;
                            return counts;
                    }, {});
}

function renderHistogram() {
    if (dataLoaded) {
        var tripsPerDayHist = groupTrips();
    
        var tripsArray = [];
        Object.keys(tripsPerDayHist).forEach(function(day) {
            tripsArray.push({'day': day, 'count': tripsPerDayHist[day]});
        });
        tripsArray.sort(function(a, b) { return a.day - b.day; });

        var x = d3.scalePoint()
                    .domain(Object.keys(tripsPerDayHist))
                    .range([0, wHist - marginHist.right]);
        
        var y = d3.scaleLinear()
                    .domain([0, d3.max(tripsArray, function(d) { return d.count; })])
                    .range([hHist, 0]);
        
        var histBind = histSvg.selectAll("rect")
                                .data(tripsArray);
        
        // insertion
        histBind.enter()
            .append("rect")
            .attr("x", function(d, i) {
                return x(d.day);
            })
            .attr("y", function(d) {
                return y(d.count);
            })
            .attr("width", barWidth)
            .attr("height", function(d) {
                return hHist - y(d.count);
            })
            .attr("fill", "green")
            .attr("stroke-width", "1px")
            .attr("stroke","black");

        // removal
        histBind.exit()
                .remove();
        
        // update
        histBind.transition()
            .attr("x", function(d, i) {
                return x(d.day);
            })
            .attr("y", function(d) {
                return y(d.count);
            })
            .attr("width", barWidth)
            .attr("height", function(d) {
                return hHist - y(d.count);
            })
            .attr("fill", "green")
            .attr("stroke-width", "1px")
            .attr("stroke","black");
        
        histSvg.append("g")
            .attr("id","xAxisHist")
            .attr("transform","translate(0," + hHist + ")")
            .call(d3.axisBottom(x).tickFormat(function(d) { return prettyDay(d); }));

        histSvg.append("g")
            .attr("id","yAxisHist")
            .call(d3.axisLeft(y));

    } else {
        console.log("Error. data should have been loaded");
    }
}

function readData() {
    d3.csv(csv_path_hist, function(data) {
        selectedData = data.slice(1, data.length);
        dataLoaded = true;
        renderHistogram();
    });
}

function initHistogram() {
    histSvg = d3.select("body")
                .append("svg")
                .attrs({
                    width : wHist + marginHist.left + marginHist.right,
                    height: hHist + marginHist.top + marginHist.bottom,
                    transform : "translate(" + marginHist.left + "," + marginHist.top + ")"
                })
                .attr("class", "hist")
                .append("g")
                    .attr("transform", "translate(" + marginHist.left + "," + marginHist.top + ")");
    
    readData();
}

initHistogram();