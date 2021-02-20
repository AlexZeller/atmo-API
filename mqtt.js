module.exports = function (mqtt_url, db) {

  const mqtt = require("mqtt")
  const mqttclient = mqtt.connect(mqtt_url)
  const fs = require('fs');
  const settings_path = "./settings.json"

  let rawdata = fs.readFileSync(settings_path);
  let settings = JSON.parse(rawdata);

  mqttclient.on('connect', () => {
    settings.sensors.forEach(sensor => {
      mqttclient.subscribe('zigbee2mqtt/' + sensor.id)
      console.info('Subscribed to topic for sensor with id ' + sensor.id)
    });
  })

  mqttclient.on("message", function (topic, message) {
    let payload = message.toString();
    let sensor = topic.split("/")[1]
    console.log("New message from topic " + sensor + " : " + payload);
    addToDB(payload, sensor);
  });

  function addToDB(payload, sensor) {
    let payload_arr = JSON.parse(payload)
    let temperature = payload_arr["temperature"];
    let humidity = payload_arr["humidity"];
    let pressure = payload_arr["pressure"];
    let battery = payload_arr["battery"];
    let linkquality = payload_arr["linkquality"];

    let statement = db.prepare(`INSERT INTO Temperature (Sensor, Temperature, Humidity, Airpressure, Battery, Linkquality) VALUES (?, ?, ?, ?, ?, ?)`);

    statement.run([sensor, temperature, humidity, pressure, battery, linkquality], err => {
      if (err) {
        if (err.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: Temperature.Timestamp") {
          console.log("Prevent duplicate entry to database");
        } else {
          console.error(err);
        }
      }
    });
    statement.finalize();
    console.log("Added message data from topic: " + sensor + " to database")
  };
};



