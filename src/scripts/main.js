var L = require('leaflet');
var leafletDraw = require('leaflet-draw');
require('leaflet-providers');

// fix image path 
//L.Icon.Default.imagePath = 'node_modules/leaflet/dist/images/';

var mapTools = ((L) => {
    var map;
    var inputs = {};
    var inputElms;
    
    // DRAW
    var drawnItems;
    var drawControl;

    var def = {
        // Opzioni di default
        mapId: 'map',
        latlng: [41.89, 12.5],
        zoom: 12,
        provider: 'CartoDB.Positron',

        // Draw
        draw: true,

        // Leaflet.js options
        leafletOptions: {
            scrollWheelZoom: false
        },

        elements: {
            selectTiles: '#tpSelect',
            lat: '#lat',
            lng: '#lng',
            zoom: '#zoom',
            button: '#setInputs'
        },

        // functions
        setDefaults: (defaults) => {
            for (const key in defaults) {
                if (defaults.hasOwnProperty(key)) {
                    def[key] = defaults[key];
                }
            }
        }
    };

    var events = () => {
        // Map
        map.addEventListener('moveend', setInputs);

        // Inputs
        let button = document.querySelector(def.elements.button);
        button.addEventListener('click', setMapView);

        for (const key in inputElms) {
            if (inputElms.hasOwnProperty(key)) {
                inputElms[key].addEventListener("keyup", (e) => {
                    // Cancel the default action, if needed
                    e.preventDefault();
                    // Number 13 is the "Enter" key on the keyboard
                    if (e.keyCode === 13) setMapView();
                });
            }
        }

        // Tiles
        let selectTiles = document.querySelector(def.elements.selectTiles);

        selectTiles.addEventListener('change', (e) => {
            if(!e.target.value) return false;
            changeTileLayer(e.target.value);
        });

    };

    var setMapView = () => {
        getInputs();
        map.setView([inputs.lat, inputs.lng], inputs.zoom);
    };

    var getInputElms = () => {
        inputElms = {
            lat: document.querySelector(def.elements.lat),
            lng: document.querySelector(def.elements.lng),
            zoom: document.querySelector(def.elements.zoom)
        }
    };

    var setInputs = () => {
        let center = map.getCenter(),
            zoom = map.getZoom();

        if(inputElms.lat) inputElms.lat.value = center.lat;
        if(inputElms.lng) inputElms.lng.value = center.lng;
        if(inputElms.zoom) inputElms.zoom.value = zoom;
    };

    var getInputs = () => {
        if(inputElms.lat) inputs.lat = inputElms.lat.value;
        if(inputElms.lng) inputs.lng = inputElms.lng.value;
        if(inputElms.zoom) inputs.zoom = inputElms.zoom.value;
    };

    var changeTileLayer = (name) => {
        L.tileLayer.provider(name).addTo(map);
    };

    var drawControls = () => {
        drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            }
        });
        map.addControl(drawControl);
    };

    var initialize = (defaults) => {
        // Imposta i defaults
        def.setDefaults(defaults);      

        // Inizializza la mappa
        map = L.map(def.mapId, def.leafletOptions);
        map.setView(def.latlng, def.zoom);

        // Imposta il layer
        changeTileLayer(def.provider);

        // Aggiunge i controlli di disegno
        if(def.draw) drawControls();

        // Assegna i campi
        getInputElms();

        // Riempie i campi
        setInputs();

        // Attiva gli eventi
        events();
    };

    return {
        init: (defaults)=>{
            initialize(defaults);
        }
    }

})(L);


// Inizializzazione
mapTools.init({
    draw:true
});