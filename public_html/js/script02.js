const jsonld = require('jsonld');
const N3 = require('n3');
const moment = require('moment');

const EX = 'http://example.org#';
const RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
const GIS = 'http://www.opengis.net/#';
const PROV = 'http://www.w3.org/ns/prov#';

const predicates = {
  departureLane: N3.DataFactory.namedNode(EX + 'departureLane'),
  arrivalLane: N3.DataFactory.namedNode(EX + 'arrivalLane'),
  wktLiteral: N3.DataFactory.namedNode(GIS + 'geosparql/wktLiteral'),
  width: N3.DataFactory.namedNode(EX + 'width'),
  signalGroup: N3.DataFactory.namedNode(EX + 'signalGroup'),
  eventState: N3.DataFactory.namedNode(EX + 'eventstate'),
  minEndTime: N3.DataFactory.namedNode(EX + 'minendtime'),
  label: N3.DataFactory.namedNode(RDFS + 'label'),
  generatedAt: N3.DataFactory.namedNode(PROV + 'generatedAtTime')
};

const signalGroupExample = 'http://example.org/signalgroup/4';

//setInterval(startFetch(), 1000);

if(typeof(EventSource) !== "undefined") {
    var source = new EventSource("https://lodi.ilabt.imec.be:3002/");
    
    source.onmessage = function(event) {
        processEvent1(JSON.parse(event.data));
    };
} 

else {
    document.getElementById("myDIV").innerHTML = "No server updates";
}

function startFetch() {
    fetch("https://lodi.ilabt.imec.be:3002/")
    .then(function(response) {
        //let headers = response.headers;
    
        //let cache = headers["Cache-Control"];
        //return response;
        return response.json();
    })
    .then(function(data) {
        console.log(data);
        processEvent2(data);
    });
}
    
function retrieveQuads(_jsonld) {
    return new Promise ((resolve, reject) => {
        jsonld.toRDF(_jsonld, {format: 'application/n-quads'}, (err, nquads) => {
            resolve(nquads);
        });
    });
};

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
        
        return minEndTime;
    }        
}

async function processEvent1(_event) {
    let data = _event;

    const quadsString = await retrieveQuads(data);
    const parser = new N3.Parser();
    const quads = parser.parse(quadsString);
        
    let minEndTime = getMinEndTimeBySignalgroup(signalGroupExample, quads);
    const generatedAt = moment(data[0]['generatedAt']);
    if(minEndTime) {
        /*console.log("min: " + minEndTime.valueOf());
        console.log("now: " + generatedAt.valueOf());
        console.log("diff: " + (minEndTime.valueOf() - generatedAt.valueOf()));*/
        const count = Math.round((minEndTime.valueOf() - generatedAt)/1000);
        document.getElementById("myDiv1").innerHTML = "pub-sub: " + count;
    }
}   

async function processEvent2(_event) {
    let data = _event;

    const quadsString = await retrieveQuads(data);
    const parser = new N3.Parser();
    const quads = parser.parse(quadsString);
        
    let minEndTime = getMinEndTimeBySignalgroup(signalGroupExample, quads);
    const generatedAt = moment(data[0]['generatedAt']);
    if(minEndTime) {
        /*console.log("min: " + minEndTime.valueOf());
        console.log("now: " + generatedAt.valueOf());
        console.log("diff: " + (minEndTime.valueOf() - generatedAt.valueOf()));*/
        const count = Math.round((minEndTime.valueOf() - generatedAt)/1000);
        document.getElementById("myDiv2").innerHTML = "polling: " + count;
    }
}   