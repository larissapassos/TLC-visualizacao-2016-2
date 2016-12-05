// var PICK_LAT = "Pickup_latitude",
//     PICK_LNG = "Pickup_longitude",
//     DROP_LAT = "Dropoff_latitude",
//     DROP_LNG = "Dropoff_longitude";

var LAT_MIN = "regions.lat_min",
    LAT_MAX = "regions.lat_max",
    LNG_MIN = "regions.lng_min",
    LNG_MAX = "regions.lng_max";

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
        
        return coords[0] >= minLng && coords[0] <= maxLng && coords[1] >= minLat && coords[1] <= maxLat;
}

function filterPoints(points, rect) {
    if (points) {
        selectedRect = points.filter(function(d) {
            return isInsideRect(d.geometry.coordinates, rect);
        });
    }

    selectedData = loadedData.filter(function(d) {
        var coords = [d[PICK_LNG], d[PICK_LAT]];
        return isInsideRect(coords, rect);
    });
}