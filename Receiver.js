// Node-module imports ---------------------------------------------------------
var mosca = require('mosca');
var twilio = require('twilio');
var config = require('./config.js')
// Global Variables ------------------------------------------------------------
var twilioSID;                                    // Twilio account number
var twilioAT;                                     // Twilio Auth token
var twilioPhoneNumber;                            // Automated text number
var userPhoneNumber;                              // Number to send texts to
var broker;                                       // Variable to store mosca broker
var g_port = 1927;                                // Port to access mosca broker
var count = 0;                                    // Count to extrapolate when coffee is ready
var seconds;                                      // Used for extrapolation
var dataSet = [];                                 // Used for extrapolation
var lastPayload;                                  // Used for extrapolation
var acidityString = "We couldn't find your coffee's pH level. Are you using a pH probe?";
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
  broker.on('ready', () => {console.log("Listener is ready on port 1927")})
  broker.on('clientConnected', (client) => {console.log(client.id + " has connected")})
  broker.on('published', function(packet, client) {
    var payload = packet.payload.toString();
    if (packet.topic == 'Coffee/pH'){
      pHLevel = parseFloat(payload);
      if (5 < pHLevel)
        acidityString = "Your coffee's pH level is " + pHLevel + ", this is pretty basic, maybe add more grounds next time."
      if (4.5 <= pHLevel && pHLevel <= 5)
        acidityString = "Your coffee's pH level is " + pHLevel + ", this is actually ideal, maybe apply for a job at Starbucks?"
      if (pHLevel < 4.5)
        acidityString = "Your coffee's pH level is " + pHLevel + ", this is pretty acidic, maybe add less grounds next time."
    }

    if (packet.topic == 'Coffee/Temperature'){
      if ("60" < payload){
        console.log("\x1b[1m\x1b[31m%s\x1b[0m", "Your coffee is " + payload + "°C, it is too hot to serve right now, just wait a bit.");
        if (count < 10 && (lastPayload != payload)){
          seconds = (new Date()).getTime()
          dataSet.push({datapoint: count, temp: parseFloat(payload), seconds: seconds})
          count++;
        }
        if (count == 10){
          extrapolate(dataSet);
          count++;
        }
      lastPayload = payload
      }
      else if ("55" <= payload && payload <= "60"){
        console.log("\x1b[1m\x1b[32m%s\x1b[0m", "Your coffee is " + payload + "°C, it is the optimal time to serve!")
        sendText(payload);
      }
      else if (payload < "55")
        console.log("\x1b[1m\x1b[36m%s\x1b[0m", "Your coffee is " + payload + "°C, it is too cold to serve, you will have to reheat it.")
    }
  })
}
function extrapolate(data){
  dataArray = [{datapoint: 1, y: data[0].temp, x: 0}]
  var time = 0;
  for (i = 1; i < data.length; i++){
    var delT = data[i].seconds - data[i-1].seconds
    time = time + delT;
    dataArray.push({datapoint: i+1, y: data[i].temp, x: time})
  }
  //console.log(dataArray)
}

function sendText(payload){
  var client = new twilio(config.sid, config.at);
  client.messages.create({
    to: config.upn,
    from: config.tpn,
    body: ("From RohitPleaseDrinkYourCoffee,\n\nYour coffee is " + payload + "°C, now's the time to serve!\n\n" + acidityString)
  });
}
