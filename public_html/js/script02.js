
/* var source1 = new EventSource('');
    source1.onmessage = function(e) {
      document.body.innerHTML += e.data + '<br>';
      console.log("1");
    }; */

let minEndTime = "http://example.org#minendtime";
let maxEndTime = "http://example.org#maxendtime";

if(typeof(EventSource) !== "undefined") {
    var source = new EventSource("https://lodi.ilabt.imec.be:3002/");
    source.onopen = function() {
        document.getElementById("titel").innerHTML = "Getting server updates";
    };
    
    source.onmessage = function(event) {
        document.getElementById("myDiv").innerHTML += event.data + "<br>";
    };

} else {
    document.getElementById("myDIV").innerHTML = "No server updates";
}