module.exports = function (expressApp, db) {
  const fs = require('fs');
  const settings_path = "./settings.json"

  // GET Method to data of a specific sensor 
  expressApp.get('/:sensor/currenttemp', (req, res) => {
    let sensor = req.params.sensor;
    console.log(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.get(
      `SELECT * FROM Temperature WHERE Sensor = ? ORDER BY Timestamp DESC LIMIT 1`,
      [sensor],
      (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        res.json(row);
      }
    );
  });

  // GET Method to get trend of a specific sensor 
  expressApp.get('/:sensor/temptrend/:hours', (req, res) => {
    let sensor = req.params.sensor;
    let hours = req.params.hours;
    console.log(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    db.all(
      `SELECT * FROM Temperature WHERE Sensor = ? AND datetime(Timestamp) >=datetime('now', '-` +
      hours +
      ` Hour')`,
      [sensor],
      (err, rows) => {
        if (err) {
          return console.error(err.message);
        }
        res.json(rows);
      }
    );
  });

  // GET Method to get the .json settings 
  expressApp.get('/settings', (req, res) => {
    console.log(
      'GET ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );
    fs.readFile(settings_path, 'utf8', (err, data) => {
      if (err) {
        console.error(err.message)
        throw err;
      }
      res.send(JSON.parse(data));
    });
  });

  // POST Method to write to the .json settings 
  expressApp.post('/settings', (req, res) => {
    console.log(
      'POST ' + req.protocol + '://' + req.get('host') + req.originalUrl
    );

    function writeSettings(path) {
      fs.writeFile(path, JSON.stringify(req.body, null, 2), function writeJSON(
        err
      ) {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        }
        console.log('Writing settings to ' + path);
        res.sendStatus(200);
      });
    }

    writeSettings(settings_path);
  });
};
