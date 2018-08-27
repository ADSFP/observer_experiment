
/* var source1 = new EventSource('');
    source1.onmessage = function(e) {
      document.body.innerHTML += e.data + '<br>';
      console.log("1");
    }; */

let minEndTime = "http://example.org#minendtime";
let maxEndTime = "http://example.org#maxendtime";
let connection = "http://example.org#Connection";
let signal_predicate = "http://example.org#signalGroup";
let eventstate = "http://example.org/eventstate/";
const jsonld = require('jsonld');
const N3 = require('n3');

if(typeof(EventSource) !== "undefined") {
    var source = new EventSource("https://lodi.ilabt.imec.be:3002/");
    source.onopen = function() {
        document.getElementById("titel").innerHTML = "Getting server updates";
    };
    
    var requestTimes = function() {
        let allTriples = source.triples;
        let allQuads = source.quads;
        for (t in allTriples) {
            tr = allTriples[t];
            if (tr.predicate.value === signal_predicate) {
                connection.signal_group = tr.object.value;
            }
        }
        
        for (q in allQuads) {
            qd = allQuads[q];
            console.log(qd);
            if (qd.predicate.value === eventstate) {
                minEndTime.minEndTime = tr.object.value;
            }
        }
    };
    
    var retrieveQuads = function(_jsonld) {
        return new Promise ((resolve, reject) => {
            jsonld.toRDF(_jsonld, {format: 'application/n-quads'}, (err, nquads) => {
                resolve(nquads);
            });
        });
    };
    
    var toQuads = async function(_client, _path) {
        const doc = await retrieveDocument(_client, _path);
        if (doc) {
            const stringOfQuads = await retrieveQuads(JSON.parse(doc));
            const parser = new N3.Parser();
            const allQuads = parser.parse(stringOfQuads);
            return allQuads;
        }
        else {
            return [];
        }
    }
    
    source.onmessage = function(event) {
        requestTimes();
        //document.getElementById("myDiv").innerHTML += "deze site is van arne!!" + "<br>";
    };
} 

else {
    document.getElementById("myDIV").innerHTML = "No server updates";
}