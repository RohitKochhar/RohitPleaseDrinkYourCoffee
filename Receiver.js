// Node-module imports ---------------------------------------------------------
//var Promise = require('bluebird');
var portfinder = require('portfinder');
var mosca = require('mosca');
// Global Variables ------------------------------------------------------------
var broker;                                        // Variable to store mosca broker
var g_port = 1927;                                 // Port to access mosca broker
// Call to main() --------------------------------------------------------------
main()
// Main function ---------------------------------------------------------------
function main(){
  createMosca()
}
// Create Mosca Broker ---------------------------------------------------------
function createMosca(){
  console.log("Creating listener on port 1927...")
  broker = new mosca.Server({port: g_port});
  broker.on('ready', () => {console.log("Listner is ready on port 1927")})
  broker.on('connect', (client) => {console.log(client + "has connected")})
  broker.on('published', function(packet, client) {
    var payload = packet.payload.toString();
    if (packet.topic == 'Coffee/Temperature'){
      if ("60" < payload)
        console.log("Your coffee is " + payload + "°C, it is too hot to serve right now, just wait a bit.");
      else if ("55" <= payload && payload <= "60")
        console.log("Your coffee is " + payload + "°C, it is the optimal time to serve!")
      else if (payload < "55")
        console.log("Your coffee is " + payload + "°C, it is too cold to serve, you will have to reheat it.")
    }
  })
}
