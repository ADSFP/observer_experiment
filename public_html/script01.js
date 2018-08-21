/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var counter = 0;
var timeGreen = 25;
var timeOrange = 5;
var timeRed = 30;
var greenOn = false;
var orangeOn = false;
var redOn = true;
document.addEventListener('DOMContentLoaded', function(){ 
    setup();
}, false);

function setup() {
    
    var timer = document.getElementById("timer");
    console.log(document); 
    counter = timeRed;
    document.getElementById("timer").innerHTML = counter;
    
    function timeIt() {
        console.log(counter);
        counter--;
        document.getElementById("timer").innerHTML = counter;
        if (counter === 0) {
            if (greenOn === true) {
                orangeOn = true;
                greenOn = false;
                counter = timeOrange;
            }
            else if (orangeOn === true) {
                redOn = true;
                orangeOn = false;
                counter = timeRed;
            }
            else if (redOn === true) {
                greenOn = true;
                redOn = false;
                counter = timeGreen;
            }
        }
    }
    setInterval(timeIt, 1000);
}