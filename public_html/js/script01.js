/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

let counter = 0;
let times = [24,4,29];
let colorText = ["green", "orange", "red"];
let arrayPos = 1;
document.addEventListener('DOMContentLoaded', function(){ 
    setup();
}, false);

function setup() {
    
    console.log(document); 
    counter = times[arrayPos];
    colorIt(arrayPos);
    document.getElementById("timer").innerHTML = counter;
    
    function timeIt() {
        console.log(counter);
        document.getElementById("timer").innerHTML = counter;
        counter--;
        if (counter === -1) {
            if (arrayPos === 2) {
                arrayPos = 0;
            }
            else {
                arrayPos += 1;
            }
            counter = times[arrayPos];
            colorIt(arrayPos);
        }
    }
    
    function colorIt(colorPos) {
        document.getElementById("bol").style.backgroundColor = colorText[colorPos];
    }
    setInterval(timeIt, 1000);
    //setInterval(colorIt, 1000);
}