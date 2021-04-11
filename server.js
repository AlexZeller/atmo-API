const express = require("express");
const sqlite = require('sqlite3').verbose();
let api = require('./api');
let mqtt = require("./mqtt")

// URL for the MQTT Broker
const mqtt_broker_url = "mqtt://mosquitto"

// Port for the API Server
const port = 8090

// Create Express App
var bodyParser = require('body-parser');
// Set up express app
let app = express();
// Configure encoding
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Connect to SQLite Database
const db = new sqlite.Database('./db.sqlite', (err) => {
    if (err) {
        return console.log(err.message);
    }
    console.info('Connected to SQLite Database');
});

// Create Database Table if it not already exists
db.run(`CREATE TABLE IF NOT EXISTS Temperature (
    Timestamp TIMESTAMP NOT NULL DEFAULT (datetime('now','localtime')),
    Sensor INT(1),
    Temperature DECIMAL(3, 1),
    Humidity Decimal(3, 1),
    Airpressure INT(1500),
    Battery INT(3),
    Linkquality Int(4),
    UNIQUE (Timestamp)
)`);

// Initialize HTTP Server
api(app, db);
app.listen(port, () => {
    console.log('API server running at ' + port)
})

//Initialize MQTT Broker Connection
mqtt(mqtt_broker_url, db)
console.info("Listening to MQTT Broker " + mqtt_broker_url)
