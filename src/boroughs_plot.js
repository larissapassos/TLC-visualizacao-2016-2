var PICK_LAT = "Pickup_latitude",
    PICK_LNG = "Pickup_longitude",
    DROP_LAT = "Dropoff_latitude",
    DROP_LNG = "Dropoff_longitude";

var svg;
var width = 960,
    height = 500,
    featureColl = {},
    loaded = false;

var projection = d3.geoMercator()
    .center([-73.94, 40.70])
    .scale(50000)
    .translate([(width) / 2, (height)/2]);

var path = d3.geoPath()
    .projection(projection)
    .pointRadius(.7);

function toGeoJSON(datum, key) {
    var lat = datum[key == "pickup" ? PICK_LAT : DROP_LAT],
        lng = datum[key == "pickup" ? PICK_LNG : DROP_LNG];

    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lng, lat, 0.0]},
        "properties": {"type": key}
    };
}

function initSVG(){
    svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "boroughs");
}

function loadMap(){
    d3.json("../data/boroughs.geojson", function(error, nycGeoJson) {
        var group = svg.append("g")
            .attr("class", "g-1");

        group.append("g")
            .attr("class", "boroughs")
            .selectAll(".state")
            .data(nycGeoJson.features)
            .enter()
            .append("path")
            .attr("class", function(d){ return d.properties.name; })
            .attr("d", path)
            .style("stroke", "black")
            .style("stroke-width", ".5px")
            .style("fill-opacity", ".1");

        console.log(nycGeoJson);
    });
}


function loadTaxiSpots(){
    d3.csv("../assets/tlc/green/subset.csv", function(error, tlc){
        if(!loaded) {
            var features = [];

            tlc.slice(1, tlc.length).forEach(function(datum){
                features.push(toGeoJSON(datum, "pickup"));
                features.push(toGeoJSON(datum, "dropoff"));
            })

            d3.select(".g-1")
                .append("g")
                .attr("class", "tlc")
                .selectAll("path.point")
                .data(features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "point")
                .style("fill", d => d.properties.type == "pickup" ? "blue" : "green")
                .style("fill-opacity", ".2");
        }
    });
}

function init(){
    initSVG();
    loadMap();
    loadTaxiSpots();
}

init();
