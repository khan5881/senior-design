// ADD LAST WILL

#include <HardwareSerial.h> // used for pH sensor
#include <ArduinoJson.h> // used for arduinoJSON object
#include <DHTesp.h> // used for humidity sensor
#include <WiFi.h> // used to connect to the wifi
#include <PubSubClient.h> // used to connect to hivemq for mqtt
#include <Adafruit_NeoPixel.h>
HardwareSerial myserial(2); // using U2_TXD
DHTesp dht;


// DEFINITION OF ALL GPIO PINS STARTS HERE...............
#define rx 17  // RX and TX
#define tx 16
#define w8r_lvl 34 // water level pin
#define PIN 33 // LED PIN


const int relay = 21; // GPIO for relay
const int moist1 = 36; // GPIO for the 4 moisture sensors
const int moist2 = 21;
const int moist3 = 12;
const int moist4 = 15;
// DEFINITION OF ALL GPIO PINS ENDS HERE.................

// ALL VARIABLES SETUP STARTS HERE.........................
String sensorstring = ""; // a string to hold the data from the Atlas Scientific product
boolean sensor_string_complete = false; // have we received all the data from the Atlas Scientific product

bool phstat, humiditystat, waterstat;
bool moiststat[4];

float reading, volt, percent, waterlevel, percent_full, pH;
float moistpercent[4];
int ctr = 0;
int time_wait = 300000;
int timetotal;
// ALL VARIABLES SETUP ENDS HERE...........................


// SETTING UP THE WIFI/ MQTT
const char* ssid = "pollution"; // ssid username
const char* password =  "aus12345"; // router password

const uint16_t port = 3005;
const char * host = "192.168.1.129";// IP address of server (change this to aus pc one)
const char* mqtt_server = "broker.mqttdashboard.com"; // MQTT server
WiFiClient espClient; //creating wifi client
PubSubClient client(espClient); // partially initializing MQTT client

Adafruit_NeoPixel pixels = Adafruit_NeoPixel(1, PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  Serial.begin(115200);
  pinMode(relay, OUTPUT);
  digitalWrite(relay, HIGH); // Relay is initally turned off
  myserial.begin(9600, SERIAL_8N1, 17, 16); // set baud rate for the software serial port to 9600 (for pH readings)
  sensorstring.reserve(30); // set aside some bytes for receiving data from Atlas Scientific product (for obtaining pH sensor values)
  dht.setup(32, DHTesp::DHT22);
  setup_wifi(); // function that connects the esp32 to the wifi
  client.setServer(mqtt_server, 1883); // setting up a server
  pixels.begin(); // This initializes the NeoPixel library.

}

void loop()
{
  if (client.connect("ESP32Client")) { // if the esp client connects
    //EZO PH SENSOR STARTS HERE......................................................
    StaticJsonBuffer<400> jsonBuffer; // create a buffer
    JsonObject& root = jsonBuffer.createObject(); // creating a veriable that will store the strings in 'root'

    while (myserial.available() > 0 && !sensor_string_complete) // if we see that the Atlas Scientific product has sent a character
    {
      char inchar = (char)myserial.read(); // get the char we just received

      sensorstring += inchar; // add the char to the var called sensorstring
      if (inchar == '\r') // if the incoming character is a <CR>
      {
        sensor_string_complete = true; // set the flag
      }
    }

    if (sensor_string_complete == true) // if a string from the Atlas Scientific product has been received in its entirety
    {
      Serial.println("pH value is: " + sensorstring); // send that string to the PC's serial monitor
      sensorstring.remove(5);
      root["pH"] = String(sensorstring);

      if (isdigit(sensorstring[0])) {                   //if the first character in the string is a digit
        pH = sensorstring.toFloat();                    //convert the string to a floating point number so it can be evaluated by the Arduino
      }
      if (pH > 7.000 || pH < 5.500)
        phstat = false;
      else
        phstat = true;

      sensorstring = "";  // clear the string
      sensor_string_complete = false;  // reset the flag used to tell if we have received a completed string from the Atlas Scientific product
    }

    //EZO PH SENSOR ENDS HERE................................................................

    // HUMIDITY SENSOR STARTS HERE......................................
    float humidity = dht.getHumidity();
    Serial.println("Humidity value: " + String(humidity) + "%");
    root["humidity"] = String(humidity);

    if (humidity < 40 || humidity > 60)
      humiditystat = false;
    else
      humiditystat = true;
    // HUMIDITY SENSOR ENDS HERE.........................................

    // WATER LEVEL SENSOR START HERE................................
    reading = analogRead(w8r_lvl);  //read analog values from water sensor
    volt =  (3.30 * reading) / (4095.0); //convert to digital
    percent = (2.2 - volt) / (15.0); // convert to percent
    percent_full = (percent) * 100; // multiply by 100 to get it in percent
    waterlevel = (percent * 25.00); // convert to percent to cm

    Serial.println("waterlevel " + String(waterlevel) + " cm");

    root["waterlevel"] = String(waterlevel);

    if (waterlevel < 15.00 || waterlevel > 25) //check if the water level is below 13
    {
      digitalWrite(relay, LOW); //turn relay on (THIS IS AN ISSUE, DEAL WITH IT ASAP)
      waterlevel = false;
    }
    else
    {
      digitalWrite(relay, HIGH); //turn relay off
      waterlevel = true;
    }
    // WATER LEVEL SENSOR END HERE...................................

    // HYGROMETER soil moisture sensor STARTS here...........................
    moistpercent[0] = readSoil(moist1, 1);
    moistpercent[1] = readSoil(moist2, 2);
    moistpercent[2] = readSoil(moist3, 3);
    moistpercent[3] = readSoil(moist4, 4);

    JsonObject& hygro = root.createNestedObject("hygrometer");
    //
    hygro["hygro1"] = String(moistpercent[0]);
    hygro["hygro2"] = String(moistpercent[1]);
    hygro["hygro3"] = String(moistpercent[2]);
    hygro["hygro4"] = String(moistpercent[3]);
    // HYGROMETER SOIL MOISTURE SENSOR ENDS HERE.............................

    char JSONmessageBuffer[600]; // create buffer that will store the json object
    root.printTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
    Serial.println(JSONmessageBuffer);

    if (phstat && humiditystat && waterstat && moiststat[0] && moiststat[1] && moiststat[2] && moiststat[3]) // works fine
    {
      Serial.println("All sensors are measuring the correct values");
      client.publish("esp32/1234/hygrodata", JSONmessageBuffer); // this data is published to the MQTT broker
      ctr = 0;
      pixels.setPixelColor(0, pixels.Color( 0, 255, 0)); // bright green color.
    }
    else {
      if (ctr == 0) {
        ctr = 1;
        if (pH > 7.000)
          client.publish("esp32/1234/highph", "Warning! pH level of water is high");
        else if (pH < 5.500)
          client.publish("esp32/1234/lowph", "Warning! pH level of water is low");

        if (humidity < 40)
          client.publish("esp32/1234/lowhumidity", "Warning! Humidity in atmosphere is  low");
        else if (humidity > 60)
          client.publish("esp32/1234/highhumidity", "Warning! Humidity in atmosphere is  high");

        if (waterlevel < 15.00)
          client.publish("esp32/1234/lowwaterlevel", "Warning! waterlevel in box is low");
        else if (waterlevel > 25.00)
          client.publish("esp32/1234/highwaterlevel", "Warning! waterlevel in box is low");

        for (int i = 1; i <= 4; i++) {
          char str[100];
          char str2[200];

          if (moistpercent[i - 1] > 60)
          {
            sprintf(str, "esp32/1234/highhygrometer/%i", i);
            sprintf(str2, "Warning! Plant number %i will die due to too much water in soil", i);
            client.publish(str, str2);
          }
          else
          {
            sprintf(str, "esp32/1234/lowhygrometer/%i", i);
            sprintf(str2, "Warning! Plant number %i will die due to lack of water in soil", i);
            client.publish(str, str2);
          }
        }
        timetotal = millis() + time_wait;
        pixels.setPixelColor(0, pixels.Color( 0, 0, 255)); // bright blue color.
        pixels.show(); // This sends the updated pixel color to the hardware.


      }
      else {
        if (millis() >= timetotal) {
          ctr = 2;
          client.publish("esp32/1234/alert",  "Alert! One or more sensors are not working");
        }
        pixels.setPixelColor(0, pixels.Color( 255, 0, 0)); // bright red color.
        pixels.show(); // This sends the updated pixel color to the hardware.

      }
    }
    delay(2000);

  }
}

int readSoil(int moist, int hygronum) // FUNCTION FOR READING SOIL MOSITURE SENSOR
{
  int val = analogRead(moist);//Read the SIG value form sensor
  float moistvolts = ((val / 4095.00) * 3.30); //analog to digital
  float percent = ((moistvolts / 3.30) * 100.00 ); //convert to percentage
  float sense = 0.00;
  if (hygronum == 3) {
    sense = 100.00 - percent;
    Serial.println("Soil Moisture " + String(hygronum) + " = " + String(sense) + "%");
  } else {
    Serial.println("Soil Moisture " + String(hygronum) + " = " + String(percent) + "%");
  }
  if ( percent > 60.00 || percent < 40.00)
    moiststat[hygronum] = false;
  else
    moiststat[hygronum] = true;
  return percent; // SENDING THE SOIL MOISTURE SENSOR VALUE TO THE LOOP
}

// FUNCTION THAT SETS UP THE WIFI
void setup_wifi() {
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password); // function returns WL_CONNECTED when connected to network, else WL_IDLE_STATUS if not connected, but powered on

  while (WiFi.status() != WL_CONNECTED) { // while wifi not connected, print dot on serial evert .5s
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected!"); // message informing that esp connected to wifi
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP()); // displays IP address
}
