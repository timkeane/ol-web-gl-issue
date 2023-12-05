import Map from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON';
import View from 'ol/View';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import VectorSource from 'ol/source/Vector';
import {tile as strategy} from 'ol/loadingstrategy';
import {createXYZ} from 'ol/tilegrid';

const token = '';

const caiUrl ='https://services.arcgis.com/R0IGaIgf2sox9aCY/ArcGIS/rest/services/IL_CAI_CNServer_2023_11_30/FeatureServer/0/query?f=geojson&where=1%3D1&outSR=3857&outFields=Name,Address,City,State,Zip%20as%20ZIP,State,County,LocationID%20as%20Location_ID,CAIType%20as%20Type,broadband_speed%20as%20speed,max_broadband_speed_upload%20as%20max_up';

class RandomValue extends GeoJSON {
  constructor(options) {
    super(options);
    this.idPrefix = options.idPrefix;
    this.idProp = options.idProp;
  }
  readFeatureFromObject(object, options) {
    const feature = super.readFeatureFromObject(object, options);
    const yesNo = Math.floor(Math.random() * 2) ? 'Y' : 'N';
    feature.setId(this.idPrefix + feature.get(this.idProp));
    feature.set('Enforceable_Commitment', yesNo);
    return feature;
  }
}

function getParameterizedtUrl(url, extent) {
  const extentParam = `{"xmin":${extent[0]},"ymin":${extent[1]},"xmax":${extent[2]},"ymax":${extent[3]},"spatialReference":{"wkid":102100,"latestWkid":3857}}`;
  return `${url}&esriSpatialRelIntersects&geometry=${encodeURIComponent(extentParam)}&token=${token}`;
}

function caiBbox(extent, resolution, projection) {
  return getParameterizedtUrl(caiUrl, extent);
}

const map = new Map({
  target: 'map',
  view: new View({
    center: [-9771729, 5149134],
    zoom: 10
  })
});

const source = new VectorSource({
  format: new RandomValue({
    idProp: 'Location_ID',
    idPrefix: 'cai-'
  }),
  url: caiBbox,
  strategy: strategy(createXYZ({tileSize: 512}))
});

const svg =  {
  Y: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" ><circle fill="" stroke="#000" stroke-width="3" cx="24" cy="24" r="19"/><circle fill="#008450" stroke="#fff" stroke-width="3" cx="24" cy="24" r="16"/><path fill="#fff" transform="translate(12, 12)" d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>',
  N: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" ><circle fill="" stroke="#000" stroke-width="3" cx="24" cy="24" r="19"/><circle fill="#CC0202" stroke="#fff" stroke-width="3" cx="24" cy="24" r="16"/><path fill="#fff" transform="translate(13.2, 13.2) scale(0.9 0.9)" d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/></svg>',
  default: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" ></svg>',
};

function getIconDataUri(value) {
  return `data:image/svg+xml;utf-8,${encodeURIComponent(svg[value])}`;
}

const style = {
  'icon-src': [
    'match',
    ['get', 'Enforceable_Commitment'],
    'Y', getIconDataUri('Y'),
    'N', getIconDataUri('N'),
    getIconDataUri('default')
  ],
  'icon-size': [48, 48],
  'icon-scale': 1
};

console.warn(style);

const layer = new WebGLPointsLayer({
  source: source,
  style
});

map.addLayer(layer);

map.on('singleclick',e => {
  map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
    console.warn(feature.getId(), feature);
  });
});
