var marginPie = {top: 20, right: 20, bottom: 40, left: 60};
var wPie = 400 - marginPie.left - marginPie.right;
var hPie = 300 - marginPie.top - marginPie.bottom;
var tau = 2 * Math.PI;
var outerRadius = 100,
    innerRadius = 50;
var pieSvg;

var barWidth = 40;
var csv_path_Pie = "../assets/tlc/green/subset2.csv";

var pieXAxis = false;
var pieYAxis = false;

function initPie() {
    pieSvg = d3.select("#views")
        .append("svg")
        .attrs({
            id : "pie",
            width : wPie + marginPie.left + marginPie.right,
            height: hPie + marginPie.top + marginPie.bottom,
            transform : "translate(" + marginPie.left + "," + marginPie.top + ")"
        })
        .attr("class", "pie")
        .append("g");

    readPieData();
}

function readPieData() {
    if (!loaded) {
        d3.csv(csv_path_hist, function(data) {
            loadedData = data.slice(1, data.length);
            selectedData = loadedData.slice();
            loaded = true;
            renderPie();
        });
    }
}

function renderPie() {
    var tmp = selectedData.map(d => parseInt(d.Passenger_count));
    var data = {}
    for (var i = 0; i < tmp.length; i++) {
        data[tmp[i]] == undefined ? data[tmp[i]] = 1 : data[tmp[i]] += 1;
    }
    var arcsData = d3.pie()(Object.values(data));
    var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    var c = d3.scaleOrdinal()
        .domain(Object.keys(data))
        .range(d3.schemeCategory10);
    var pathBind = pieSvg.selectAll("#piePath").data(arcsData);
    pathBind.exit().remove();

    pathBind.enter().append("path")
        .attr("id", "piePath")
        .attr("d", arc)
        .style("fill", function(d, i){ return c(i); });
}
