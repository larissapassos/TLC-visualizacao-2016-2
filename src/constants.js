var LAT_MIN = "region.lat_min",
    LAT_MAX = "region.lat_max",
    LNG_MIN = "region.lng_min",
    LNG_MAX = "region.lng_max";

var OPACITY = 0.5;

var loaded = false;
var loadedData;
var selectedRect;
var selectedData;

function isInsideRect(coords, rect) {
    var minLng = rect[0][0] <= rect[1][0] ? rect[0][0] : rect[1][0],
            minLat = rect[0][1] <= rect[1][1] ? rect[0][1] : rect[1][1],
            maxLng = rect[0][0] <= rect[1][0] ? rect[1][0] : rect[0][0],
            maxLat = rect[0][1] <= rect[1][1] ? rect[1][1] : rect[0][1];
        
        return coords[0][0] >= minLng && coords[2][0] <= maxLng && coords[0][1] >= minLat && coords[2][1] <= maxLat;
}

function filterPoints(points, rect) {
    if (points) {
        // console.log(points[0].geometry.coordinates[0])
        selectedRect = points.filter(function(d) {
            return isInsideRect(d.geometry.coordinates[0], rect);
        });
    }

    console.log(selectedData[0])
    selectedData = loadedData.filter(function(d) {
        var coords = [ [d.region.lng_min, d.region.lat_min], [], [d.region.lng_max, d.region.lat_max] ];
        return isInsideRect(coords, rect);
    });
    console.log(selectedData)
}