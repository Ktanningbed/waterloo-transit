import './style.css';
import {Map, Overlay, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import LineString from 'ol/geom/LineString.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import VectorSource from 'ol/source/Vector.js';
import {Fill, Icon, Stroke, Style} from 'ol/style.js';
import {Vector, Vector as VectorLayer} from 'ol/layer.js';
import Polyline from 'ol/format/Polyline.js'
import {transform} from 'ol/proj';
import MultiLineString from 'ol/geom/MultiLineString';
import { Circle } from 'ol/geom';


const iconFeature = new Feature({
  geometry: new Point(fromLonLat([-80.5449, 43.4723])),
});

const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 480],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'https://cdn.pixabay.com/photo/2014/04/03/10/03/google-309740__480.png',
    scale: 0.1,
  }),
});


iconFeature.setStyle(iconStyle);

const vectorSource = new VectorSource({
  features: [iconFeature],
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});


const map = new Map({
  target: 'map',
  layers: [
    
    new TileLayer({
      source: new OSM()
    }),
  ],
  view: new View({
    center: fromLonLat([-80.5438, 43.4758]),
    zoom: 13
  })
});

function getShape(routeName){
  // console.log('hi')
  fetch("http://127.0.0.1:5000/api/shape", {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({"name": routeName})}).then((res) => 
  res.json()
  .then((data) => {
    console.log(data[1])
    var route = new LineString(data[0]).transform('EPSG:4326', 'EPSG:3857')
    var routeCoords = route.getCoordinates()
    var routeLength = routeCoords.length;
    var routeFeature = new Feature({
      type: 'route',
      geometry: route
    })
    var geoMarker = new Feature({
      type: 'geoMarker',
      geometry: new Point(routeCoords[0])
    })
    var startMarker = new Feature({
      type: 'icon',
      geometry: new Point(routeCoords[0])
    });
    var endMarker = new Feature({
      type: 'icon',
      geometry: new Point(routeCoords[routeLength - 1])
    });
    var styles1 = new Style({
      stroke: new Stroke({
        width: 6,
        color: 'dodgerblue'
      })
    })
    routeFeature.setStyle(styles1)
    var vectorLayer2 = new VectorLayer({
      source: new VectorSource({
        features: [routeFeature, geoMarker, startMarker, endMarker],
        
      }),name: "route"
      // style: function(feature){
      //   return styles[feature.get('type')]
      // }
    })
    map.addLayer(vectorLayer2)
    
    showStops(data[1])
  }))
}

function showStops(data) {
  const div = document.getElementById("routes")
  const title = document.getElementById("route-title-id")
  
  const btn = document.createElement('button')
  const backIcon = document.createElement('i')
  backIcon.classList.add("fa")
  backIcon.classList.add("fa-search")
  btn.appendChild(backIcon)
  btn.innerText = 'BACK'
  btn.classList.add('back-button')
  
  title.innerText = "STOPS"
  btn.addEventListener("click", reset)
  title.prepend(btn)
  while(div.firstChild){
    div.removeChild(div.firstChild)
  }
  // console.log(data)
  for(var i = 0; i<data.length; i++){
    const stop = document.createElement('div')
    stop.classList.add('stop')
    const stopName = document.createElement('h1')
    stopName.classList.add('stop-name')
    stopName.innerText = data[i][25]
    stop.appendChild(stopName)
    const arrival = document.createElement('h3')
    arrival.classList.add("arrival-time")
    arrival.innerText = "Arrival Time:  " + data[i][17]
    stop.appendChild(arrival)
    div.appendChild(stop)
  }
}

function reset(){
  const div = document.getElementById("routes")
  const title = document.getElementById("route-title-id")
  title.innerText = 'ROUTES'
  while(div.firstChild){
    div.removeChild(div.firstChild)
  }
  loadRoutes()
  map.getLayers().forEach(layer => {
    if (layer && layer.get('name') === 'route') {
      map.removeLayer(layer);
    }
  });
}

function loadRoutes() {
  let routes = [];
  fetch("http://127.0.0.1:5000/api/routes").then((res) => res.json()
  .then((data) => {
      // console.log()
      changeInfo(data);

  }))
  // console.log(routes)
}

function changeInfo(data) {
  console.log(data)
  let div = document.getElementById('routes')
  for(var i = 0; i<data.length; i++){
      var btn = document.createElement('btn')
      // var = document.createElement("li")
      // console.log(data[i])
      btn.innerHTML = data[i][2]
      // btn.appendChild(document.createTextNode(data[i][2]))
      btn.classList.add("route")
      // var route = data[i][2]
      btn.addEventListener("click", () => {
        // console.log(route)

        getShape("Queen-River")
      })
      // btn.appendChild(li)
      div.appendChild(btn)
      // console.log(route[2])
  }
  
  
}
loadRoutes()



map.addLayer(vectorLayer)