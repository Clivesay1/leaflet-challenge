//variable to hold the URL for the earthquake data
let Url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

//map
let myMap = L.map("map", {
    center: [
      35, -100
    ],
    zoom: 7,
});

//base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

 let Topographic = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
   attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

 let Satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
  maxZoom: 20,
  subdomains:['mt0','mt1','mt2','mt3']
});

//baseMaps object.
let baseMaps = {
  "Street Map": street,
  "Topographic Map": Topographic,
  "Satellite Map": Satellite
};

//layer group for the earthquakes
let earthquakes = new L.LayerGroup();

//Use d3 to get data from the URL
d3.json(Url).then(function (data) {

//geojson layer with data
  L.geoJSON(data, {
    onEachFeature: onEachFeature,
    style: formatCircleMarker,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    }}).addTo(earthquakes);

//overlayMaps object to hold our earthquakes layer.
let overlayMaps = {
  Earthquakes: earthquakes
};

//layer control and pass in our baseMaps and overlayMaps
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

//Add the layer control to the map
earthquakes.addTo(myMap);
street.addTo(myMap);

//function to create popups for each feature
function onEachFeature(feature, layer) {
  layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><p>Magnitude: " + feature.properties.mag + "</p><p>Depth: " + feature.geometry.coordinates[2] + "</p>");
}

//function to select marker color based on depth
function chooseColor(depth) {
  var color = "";
  if (depth >= -10 && depth <= 10) {
      return color = "#98ee00";
  }
  else if (depth > 10 && depth <= 30) {
      return color = "#d4ee00";
  }
  else if (depth > 30 && depth <= 50) {
      return color = "#eecc00";
  }
  else if (depth > 50 && depth <= 70) {
      return color =  "#ee9c00";
  }
  else if (depth > 70 && depth <= 90) {
      return color = "#ea822c";
  }
  else if (90 < depth) {
      return color = "#ea2c2c";
  }
  else {
      return color = "black";
  }
}
//function to select marker size based on magnitude
function chooseSize(magnitude) {
  if (magnitude === 0) {
    return magnitude * 1
  };
  return magnitude * 5
};

//function to format markers
function formatCircleMarker (feature, latlng) {
let format = {
    radius: chooseSize(feature.properties.mag),
    fillColor: chooseColor(feature.geometry.coordinates[2]),
    color: chooseColor(feature.geometry.coordinates[2]),
    opacity: 1
}
return format
}

});

//Set up map legend to show depth colors
let legend = L.control({ position: "bottomright"});

legend.onAdd = function () {
let div = L.DomUtil.create("div", "info legend");

let colors = ["#98ee00", "#d4ee00", "#eecc00", "#ee9c00", "#ea822c", "#ea2c2c"]
let depthRange = [-10, 10, 30, 50, 70, 90];

//loop through each range and create label with color
for (let i = 0; i < depthRange.length; i++) {
  div.innerHTML += 
  "<i style='background: " + colors[i] + " '></i>"  + 
  depthRange[i] + (depthRange[i + 1] ? "&ndash;" + depthRange[i + 1] + "<br>" : "+");
}
  return div;
};

//Add legend to map
legend.addTo(myMap);