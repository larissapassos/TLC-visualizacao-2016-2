var margin = {top: 20, right: 20, bottom: 40, left: 60};
var w = 700 - margin.left - margin.right;
var h = 500 - margin.top - margin.bottom;
var histSvg;

var selectedData;
var dataLoaded = false;

var barWidth = 20;
var barPadding = 2;

function groupTrips() {
    var timeParser = d3.timeParse("%Y-%m-%d %H:%M:%S");
    return selectedData.reduce(function(counts, curr) {
                        var day = timeParser(curr.lpep_pickup_datetime).getDate();
                        counts[day] ? counts[day]++ : counts[day] = 1;
                            return counts;
                    }, {});
}

function renderHistogram() {
    if (dataLoaded) {
        var tripsPerDay = groupTrips();
    
        var tripsArray = [];
        Object.keys(tripsPerDay).forEach(function(day) {
            tripsArray.push({'day': day, 'count': tripsPerDay[day]});
        });
        tripsArray.sort(function(a, b) { return a.day - b.day; });

        var x = d3.scalePoint()
                    .domain(Object.keys(tripsPerDay))
                    .range([0, w]);
        
        var y = d3.scaleLinear()
                    .domain([0, d3.max(tripsArray, function(d) { return d.count; })])
                    .range([h, 0]);
        
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
                return h - y(d.count);
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
                return h - y(d.count);
            })
            .attr("fill", "green")
            .attr("stroke-width", "1px")
            .attr("stroke","black");
        
        histSvg.append("g")
            .attr("id","xAxis")
            .attr("transform","translate(0," + h + ")")
            .call(d3.axisBottom(x));

        histSvg.append("g")
            .attr("id","yAxis")
            .call(d3.axisLeft(y));

    } else {
        console.log("Error. data should have been loaded");
    }
}

function readData() {
    d3.csv(csv_path, function(data) {
        selectedData = data.slice(1, data.length);
        dataLoaded = true;
        renderHistogram();
    });
}

function initHistogram() {
    histSvg = d3.select("body")
                .append("svg")
                .attrs({
                    width : w + margin.left + margin.right,
                    height: h + margin.top + margin.bottom,
                    transform : "translate(" + margin.left + "," + margin.top + ")"
                })
                .attr("class", "hist")
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    readData();
}

initHistogram();