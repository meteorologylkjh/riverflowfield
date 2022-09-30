
function initDemoMap() {
  var Esri_WorldImagery = L.tileLayer(
    "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, " +
        "AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    }
  );

  var Esri_DarkGreyCanvas = L.tileLayer(
    "http://{s}.sm.mapstack.stamen.com/" +
      "(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/" +
      "{z}/{x}/{y}.png",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, " +
        "NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community"
    }
  );

  var baseLayers = {
    Satellite: Esri_WorldImagery,
    "Grey Canvas": Esri_DarkGreyCanvas
  };

  var map = L.map("map", {
      preferCanvas: true, renderer: L.canvas(),
    layers: [Esri_WorldImagery]
  });

  var layerControl = L.control.layers(baseLayers);
  layerControl.addTo(map);
    map.setView([25.163996, 121.433997], 10);

  return {
    map: map,
    layerControl: layerControl
  };
}

// demo map
var mapStuff = initDemoMap();
var map = mapStuff.map;


var layerControl = mapStuff.layerControl;

// load data (u, v grids) from somewhere (e.g. https://github.com/danwild/wind-js-server)

    let U = [];
    let V = [];
    let lat = [];
    let lon = [];
    let points = [];
    let latNumber = Number((data[0].header.la1 - data[0].header.la2).toFixed(3)) / data[0].header.dy;
    let lonNumber = Number((data[0].header.lo2 - data[0].header.lo1).toFixed(3)) / data[0].header.dx;
    
    
    for (let i = 0; i < latNumber; i++) {
        for (let j = 0; j < lonNumber; j++) {
            U.push(0);
            V.push(0);
            lat.push(data[0].header.la1 - data[0].header.dy * i);
            lon.push(data[0].header.lo1 + data[0].header.dx * j);
            points.push(turf.point([data[0].header.la1 - data[0].header.dy * i, data[0].header.lo1 + data[0].header.dx * j]))
        }
    }
    let grids = turf.featureCollection(points);

        let sections = datas["VelDist"];
        sections.forEach((section) => {
            let points = section["VelDist"];
            let name = section["SecName"];
            points.forEach((point) => {
                let targetPoint = turf.point([point["Lat"], point["Lng"]]);
                let nearest = turf.nearestPoint(targetPoint, grids);
                let index = nearest.properties.featureIndex;
                V[index] = point["V"]*10;
                U[index] = point["U"]*10;
            });

        });


    data[0].header.nx = lonNumber
    data[0].header.ny = latNumber
    data[1].header.nx = lonNumber
    data[1].header.ny = latNumber
    data[0].data = U
    data[1].data = V

    var velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
            position: 'bottomleft',
            emptyString: 'No velocity data',
            angleConvention: 'bearingCW',
            speedUnit: 'm/s',
            showCardinal: true,
        },
        data: data,
       
        // OPTIONAL
        particleAge: 50,
        particleMultiplier: 0.033,
        particlelineWidth: 1,
        frameRate: 50,
        minVelocity: 0,
        maxVelocity: 10,
        velocityScale: 0.01,
        opacity: 0.97,
        // define your own array of hex/rgb colors
        colorScale: [],
        onAdd: () => console.log('onAdd'),
        onRemove: () => console.log('onRemove'),
        // optional pane to add the layer, will be created if doesn't exist
        // leaflet v1+ only (falls back to overlayPane for < v1)
        paneName: "overlayPane",
    }).addTo(map);

    //layerControl.addOverlay(velocityLayer, "Wind - Great Barrier Reef");


$.getJSON("./datas/water-gbr.json", function(data) {
  var velocityLayer = L.velocityLayer({
    displayValues: true,
    displayOptions: {
      velocityType: "GBR Water",
      position: "bottomleft",
      emptyString: "No water data"
    },
    data: data,
    maxVelocity: 0.6,
    velocityScale: 0.1 // arbitrary default 0.005
  });

  //layerControl.addOverlay(velocityLayer, "Ocean Current - Great Barrier Reef");
});

$.getJSON("./datas/wind-global.json", function(data) {
  var velocityLayer = L.velocityLayer({
    displayValues: true,
    displayOptions: {
      velocityType: "Global Wind",
      position: "bottomleft",
      emptyString: "No wind data"
    },
    data: data,
    maxVelocity: 15
  });

  //layerControl.addOverlay(velocityLayer, "Wind - Global");
});