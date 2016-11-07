var PICK_LAT = "Pickup_latitude",
    PICK_LNG = "Pickup_longitude",
    DROP_LAT = "Dropoff_latitude",
    DROP_LNG = "Dropoff_longitude";


var mapSVG;
var mapG;
var width = 860,
    height = 600,
    nyc_geojson_path = "../data/boroughs.geojson",
    featureColl = {},
    loaded = false,
    scale0 = 50000;
    tau = 2 * Math.PI;

var projection = d3.geoMercator()
    .center([-74.55, 40.95])
    .scale(scale0)
    .translate([0, 0]);

var path = d3.geoPath()
    .projection(projection)
    .pointRadius(.7);

var zoomed = function() {
    var transform = d3.event.transform;
    projection.scale(transform.k * scale0)
        .translate([transform.x, transform.y]);
    d3.selectAll("path").attr("d", path)
}

var zoom = d3.zoom()
    .scaleExtent([.8, 5])
    .on("zoom", zoomed);

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
    mapSVG = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "boroughs");

    mapG = mapSVG.append("g").attr("class", "map").attr("id", "map");
}

var centered;
var clicked = function(d) {
    var x, y, k;

    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
    } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
    }

    mapG.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    mapG.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
}

function loadMap(){
    d3.json(nyc_geojson_path, function(error, nycGeoJson) {
        mapG//.call(zoom)
            .selectAll("#nyc-state")
            .data(nycGeoJson.features)
            .enter()
            .append("path")
            .attr("class", function(d){ return d.properties.name; })
            .attr("id", "nyc-state")
            .attr("d", path)
            .style("stroke", "orange")
            .style("fill", "orange")
            .style("stroke-width", ".5px")
            .style("fill-opacity", ".1")
            .on("click", clicked);
    });
}

function loadTaxiSpots(){
    d3.csv("../assets/tlc/green/subset.csv", function(error, tlc){
        if(!loaded) {
            var features = [];

            tlc.slice(1, 10000).forEach(function(datum){
                features.push(toGeoJSON(datum, "pickup"));
                features.push(toGeoJSON(datum, "dropoff"));
            })

            mapG.selectAll("#taxi-spot")
                .data(features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "point")
                .attr("id", "taxi-spot")
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
