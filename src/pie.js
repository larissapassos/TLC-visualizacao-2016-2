var marginPie = {top: 20, right: 20, bottom: 0, left: 0};
var wPie = 400 - marginPie.left - marginPie.right,
    wPieCenter = wPie / 2;
var hPie = 300 - marginPie.top - marginPie.bottom,
    hPieCenter = hPie / 2;
var tau = 2 * Math.PI;
var outerRadius = 120,
    innerRadius = 100;
var pieSvg;
var shouldBuildLegend = true;
var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

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
        .append("g")
        .attr("transform", "translate(" + wPieCenter + "," + hPieCenter + ")");

    readPieData();
}

function readPieData() {
    if (!loaded) {
        d3.json(chosenCabCategory, function(error, data) {
            if (error) throw error;
            loadedData = data.slice();
            selectedData = loadedData.slice();
            loaded = true;
            renderPie();
        });
    } else {
        renderPie();
    }
}

function buildPieLegend() {
    shouldBuildLegend = false;
    var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    var c = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory20);

    pieSvg
        .selectAll("#pieLegend").data(keys)
        .enter().append("rect")
        .attr("id", "pieLegend")
        .attr("x", wPie - 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("transform", function(d,i){ return "translate(0, " + (i*20) + ")" })
        .style("fill", c)
}

function renderPie() {
    console.log("render pie");
    var tmp = selectedData.map(d => d.passenger_count);
    var data = {1: 0, 2: 0, 3: 0, 4: 0, 5:0, 6: 0, 7: 0, 8: 0, 9: 0};
    if (shouldBuildLegend) { buildPieLegend(); }

    for (var i = 0; i < tmp.length; i++) {
        var curr = tmp[i];
        for (var key in curr) {
            if (key != 0) data[key] += curr[key];
        }
    }
    var arcsData = d3.pie()(Object.values(data));
    var keys = Object.keys(data);

    var c = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory20);
    var pathBind = pieSvg.selectAll("#piePath").data(arcsData);
    pathBind.exit().remove();

    pathBind.enter().append("path")
        .attr("id", "piePath")
        .attr("d", arc)
        .style("fill", function(d, i){ return c(i); });
    pathBind.transition()
        .duration(1000)
        .attr("id", "piePath")
        .attr("d", arc)
        .style("fill", function(d, i){ return c(i); });
}

// function arcTween(newAngle) {
//     return function(d) {
//         var interpolate = d3.interpolate(d.endAngle, newAngle);
//         return function(t) {
//             d.endAngle = interpolate(t);
//             return arc(d);
//         }
//     }
// }
