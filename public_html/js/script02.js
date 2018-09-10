const jsonld = require('jsonld');
const N3 = require('n3');
const moment = require('moment');

const EX = 'http://example.org#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const GIS = 'http://www.opengis.net/#';
const PROV = 'http://www.w3.org/ns/prov#';

let maxAge = 0;
let data;
let arrayCount;
let onGoing = false;

const predicates = {
  departureLane: N3.DataFactory.namedNode(EX + 'departureLane'),
  arrivalLane: N3.DataFactory.namedNode(EX + 'arrivalLane'),
  wktLiteral: N3.DataFactory.namedNode(GIS + 'geosparql/wktLiteral'),
  width: N3.DataFactory.namedNode(EX + 'width'),
  signalGroup: N3.DataFactory.namedNode(EX + 'signalGroup'),
  eventState: N3.DataFactory.namedNode(EX + 'eventstate'),
  minEndTime: N3.DataFactory.namedNode(EX + 'minendtime'),
  maxEndTime: N3.DataFactory.namedNode(EX + 'maxendtime'),
  label: N3.DataFactory.namedNode(RDFS + 'label'),
  generatedAt: N3.DataFactory.namedNode(PROV + 'generatedAtTime')
};

const signalGroupExample = 'http://example.org/signalgroup/4';

function showPolling(_countMin, _countMax, _label) {
    document.getElementById("myDiv2").innerHTML = "minEndTime: " + _countMin + "<br>" + "maxEndTime: " +  _countMax + "<br>" + _label;
}

if(typeof(EventSource) !== "undefined") {
    var source = new EventSource("https://lodi.ilabt.imec.be:3002/");
    
    source.onmessage = function(event) {
        processEvent1(JSON.parse(event.data));
    };
} 

else {
    document.getElementById("myDIV").innerHTML = "No server updates";
}

function decideWhichFunction() {
    if (maxAge === 0) {
        startFetch();
    }
    //console.log(maxAge);
    if (maxAge > 0) {
        for(i=0; i < maxAge; i++) {
            let countMin = arrayCount[0];
            let countMax = arrayCount[1];
            let label = arrayCount[2];
            setTimeout(autoTimer, 1000, countMin, countMax, label);
        }
        startFetch();  
    }
}

function autoTimer(_countMin, _countMax, _label) {
    let countMin = _countMin - 1;
    let countMax = _countMax - 1;
    arrayCount = [countMin, countMax, _label];
    showPolling(countMin, countMax, _label);
}

function startFetch() {
    fetch("https://lodi.ilabt.imec.be:3002/")
    .then(function(response) {
        let headers = response.headers;
        let cache = headers.get("cache-control");
        const regex = /.*max-age=(\d+).*/gi;
        const result = regex.exec(cache);
        if (result !== null && result[1] !== null) {
            maxAge = parseInt(result[1]);
        }
        //console.log(maxAge);
        //console.log(response.json());
        return response.json();
    })
    .then(function(data) {
        processEvent2(data);
        decideWhichFunction();
    });
}
    
function retrieveQuads(_jsonld) {
    return new Promise ((resolve, reject) => {
        jsonld.toRDF(_jsonld, {format: 'application/n-quads'}, (err, nquads) => {
            resolve(nquads);
        });
    });
};

/*function getDepartureAndArrivalLane(_signalGroup, _quads) {
    const store = new N3.Store();
    store.addQuads(_quads);

    const departureLaneQuad = store.getQuads(N3.DataFactory.namedNode(_signalGroup), predicates.departureLane, null);
    console.log(departureLaneQuad);
    // In case data is found about _signalGroup
    if (departureLaneQuad && departureLaneQuad.length > 0) {
        const graph = departureLaneQuad[0].graph.value;
        console.log(departureLaneQuad);
        const departure = departureLaneQuad[0].object.value;
        const departureL = store.getQuads(eventState, predicates.label, null)[0].object.value;
        //console.log(eventStateLabel);
        const departureLane = moment(store.getQuads(eventState, predicates.minEndTime, null, graph)[0].object.value); 
        
        return departureLane;
    }        
}*/

/*async function getDepLane(_event) {
    let data = _event;  
    let connections = [];

    const quadsString = await retrieveQuads(data);
    const parser = new N3.Parser();
    const quads = parser.parse(quadsString);
    const store = new N3.Store();
    store.addQuads(quads);
    const allQuad = store.getQuads(N3.DataFactory.namedNode(), predicates.eventState, null);
    
    for ( in triples) {
    tr = triples[t];
    if (tr.object.value == connection && tr.predicate.value == type_predicate) {
      var found_con = { url: tr.subject.value };
      connections.push(found_con);
    }
  }
}*/

function getMinEndTimeBySignalgroup(_signalGroup, _quads) {
    const store = new N3.Store();
    store.addQuads(_quads);

    const eventStateQuad = store.getQuads(N3.DataFactory.namedNode(_signalGroup), predicates.eventState, null);
    // In case data is found about _signalGroup
    if (eventStateQuad && eventStateQuad.length > 0) {
        const graph = eventStateQuad[0].graph.value;
        const eventState = eventStateQuad[0].object.value;
        const eventStateLabel = store.getQuads(eventState, predicates.label, null)[0].object.value;
        const minEndTime = moment(store.getQuads(eventState, predicates.minEndTime, null, graph)[0].object.value); 
        const maxEndTime = moment(store.getQuads(eventState, predicates.maxEndTime, null, graph)[0].object.value); 
        
        return [minEndTime, eventStateLabel, maxEndTime];
    }        
}

async function processEvent1(_event) {
    data = _event;
    
    const quadsString = await retrieveQuads(data);
    const parser = new N3.Parser();
    const quads = parser.parse(quadsString);
     
    let arrayLabel = getMinEndTimeBySignalgroup(signalGroupExample, quads);
    let minEndTime = arrayLabel[0];
    let eventLabel = arrayLabel[1];
    let maxEndTime = arrayLabel[2];
    const generatedAt = moment(data[0]['generatedAt']);
    //let departureLane = getDepartureAndArrivalLane(signalGroupExample, quads);
    if(minEndTime) {
        /*console.log("min: " + minEndTime.valueOf());
        console.log("now: " + generatedAt.valueOf());
        console.log("diff: " + (minEndTime.valueOf() - generatedAt.valueOf()));*/
        countMin = Math.round((minEndTime.valueOf() - generatedAt)/1000);
        countMax = Math.round((maxEndTime.valueOf() - generatedAt)/1000);
        document.getElementById("myDiv1").innerHTML = "minEndTime: " + countMin + "<br>" + "maxEndTime: " +  countMax + "<br>" + eventLabel;
    }
}   

async function processEvent2(_event) {
    let data = _event;

    const quadsString = await retrieveQuads(data);
    const parser = new N3.Parser();
    const quads = parser.parse(quadsString);
        
    let arrayLabel = getMinEndTimeBySignalgroup(signalGroupExample, quads);
    let minEndTime = arrayLabel[0];
    let eventLabel = arrayLabel[1]; 
    let maxEndTime = arrayLabel[2];
    const generatedAt = moment(data[0]['generatedAt']);
    const countMin = Math.round((minEndTime.valueOf() - generatedAt)/1000);
    const countMax = Math.round((maxEndTime.valueOf() - generatedAt)/1000);
    arrayCount = [countMin, countMax, eventLabel];
    showPolling(countMin, countMax, eventLabel);
}

decideWhichFunction();