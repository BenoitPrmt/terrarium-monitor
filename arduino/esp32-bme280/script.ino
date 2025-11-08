#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>
#include <time.h>

#define MEASURE_INTERVAL_MS 300000UL  // 5 min.


const char* WIFI_SSID = ""; // WiFi SSID
const char* WIFI_PASS = ""; // WiFi password

const char* BASE_URL = ""; // DOMAIN + /api/v1/record/{UUID}
const char* TERRARIUM_UUID = ""; // UUID of the terrarium
const char* DEVICE_TOKEN   = ""; // Device token for authentication
const char* DEVICE_ID      = "esp32-bme280-001";


Adafruit_BME280 bme;

static uint32_t nowEpoch() {
  time_t now;
  time(&now);
  return (uint32_t)now;
}

static bool ensureWifi(uint32_t timeoutMs = 20000) {
  if (WiFi.status() == WL_CONNECTED) return true;
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeoutMs) {
    delay(250);
    Serial.print(".");
  }
  Serial.println();
  return WiFi.status() == WL_CONNECTED;
}

void setup() {
  Serial.begin(115200);
  delay(200);

  if (!ensureWifi()) {
    Serial.println("[WiFi] échec de connexion (on réessaiera plus tard)");
  } else {
    Serial.println("[WiFi] connecté");
  }

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  Wire.begin();
  if (!bme.begin(0x76)) {
    if (!bme.begin(0x77)) {
      Serial.println("[BME280] capteur introuvable (0x76/0x77)");
      while (true) { delay(1000); }
    }
  }
  Serial.println("[BME280] OK");
}

static bool postSamples(float tempC, float humPct, float pressHpa, float altM) {
  if (!ensureWifi()) {
    Serial.println("[HTTP] Pas de WiFi");
    return false;
  }

  StaticJsonDocument<1536> doc;
  doc["device_id"] = DEVICE_ID;
  doc["terrarium_uuid"] = TERRARIUM_UUID;
  doc["sent_at"] = nowEpoch();

  JsonArray samples = doc.createNestedArray("samples");

  {
    JsonObject o = samples.add<JsonObject>();
    o["t"] = nowEpoch();
    o["type"] = "TEMPERATURE";
    o["value"] = tempC;
    o["unit"] = "C";
  }
  {
    JsonObject o = samples.add<JsonObject>();
    o["t"] = nowEpoch();
    o["type"] = "HUMIDITY";
    o["value"] = humPct;
    o["unit"] = "%";
  }
  {
    JsonObject o = samples.add<JsonObject>();
    o["t"] = nowEpoch();
    o["type"] = "PRESSURE";
    o["value"] = pressHpa;
    o["unit"] = "hPa";
  }
  {
    JsonObject o = samples.add<JsonObject>();
    o["t"] = nowEpoch();
    o["type"] = "ALTITUDE";
    o["value"] = altM;
    o["unit"] = "m";
  }

  String payload;
  serializeJson(doc, payload);

  HTTPClient http;

  bool isHttps = strncmp(BASE_URL, "https://", 8) == 0;
  int code = -1;

  if (isHttps) {
    WiFiClientSecure client;
    client.setInsecure(); // DEV only
    if (!http.begin(client, BASE_URL)) {
      Serial.println("[HTTP] begin() a échoué (HTTPS)");
      return false;
    }
  } else {
    if (!http.begin(BASE_URL)) {
      Serial.println("[HTTP] begin() a échoué (HTTP)");
      return false;
    }
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  code = http.POST((uint8_t*)payload.c_str(), payload.length());
  Serial.printf("[HTTP] POST %s -> %d\n", BASE_URL, code);

  if (code > 0) {
    String resp = http.getString();
    Serial.println(resp);
  }

  http.end();
  return (code >= 200 && code < 300);
}

void loop() {
  uint32_t t0 = millis();

  float tempC  = bme.readTemperature();
  float humPct = bme.readHumidity();
  float pressHpa = bme.readPressure() / 100.0F;
  float altM   = bme.readAltitude(1013.25);

  Serial.printf("[MEASURE] T=%.2f°C H=%.2f%% P=%.2fhPa Alt=%.2fm\n", tempC, humPct, pressHpa, altM);

  bool ok = postSamples(tempC, humPct, pressHpa, altM);
  if (ok) Serial.println("[SEND] OK");
  else    Serial.println("[SEND] ÉCHEC");

  uint32_t elapsed = millis() - t0;
  if (elapsed < MEASURE_INTERVAL_MS) delay(MEASURE_INTERVAL_MS - elapsed);
}
