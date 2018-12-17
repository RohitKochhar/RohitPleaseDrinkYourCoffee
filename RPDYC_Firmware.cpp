#include <WiFiNINA.h>
#include <MQTT.h>

const char WIFI_SSID[] = "Singhcolford-EXT"; // WiFI ssid
const char WIFI_PASS[] = "simba123"; //WiFI password
const char MQTTHost[]  = "192.168.2.34";
int MQTTPort      = 1927;
char printbuf[100];

//WiFiSSLClient ipCloudStack;
WiFiClient wifiClient;
MQTTClient mqttClient;

int status = WL_IDLE_STATUS;

// Topics
String mainTopic = "MQTTTEST";

void messageReceived(String &topic, String &payload) {
  Serial.println("incoming: " + topic + " - " + payload);
  if (topic.equals(mainTopic)) {
    Serial.println("Sending ping...");
    Serial.println("Pinged!");
    // Start rotating
    // wait 5 seconds for connection:
    delay(5000);
  }
}

void connect() {
 // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue:
    while (true);
  }

  // attempt to connect to WiFi network:
  while ( status != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(WIFI_SSID);
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    status = WiFi.begin(WIFI_SSID, WIFI_PASS);

    // wait 5 seconds for connection:
    delay(5000);
  }
  Serial.println("Connecting...");
  Serial.println("Connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // You need to set the IP address directly.
  Serial.print("Connecting to MQTT at ");
  Serial.print(MQTTHost);
  Serial.print(":");
  Serial.print(MQTTPort);
  Serial.println(".");
  mqttClient.begin(MQTTHost, MQTTPort, wifiClient);
  while (!mqttClient.connect("ArduinoRohit")) {
    Serial.print("*");
    delay(500);
  }
  Serial.println("Connected to MQTT");
  mqttClient.onMessage(messageReceived);
  mqttClient.subscribe(mainTopic);
  mqttClient.publish("Coffee/pH", "4.8");
  getTemperature();
}

void setup() {
  Serial.begin(115200);

}

void getTemperature(){

  for (int i = 100; i > 50; i--){
    sprintf(printbuf, "%d", i);
    mqttClient.publish("Coffee/Temperature",printbuf);
    delay(1000);
  }
}

void loop() {
  mqttClient.loop();
  delay(1000);

  if (!wifiClient.connected()) {
    connect();
  }
}
