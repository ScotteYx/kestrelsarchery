var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("./database.sqlite3");
var seedData = require("./seed-data.json");

module.exports = { db, reset, createTables, getSettings };

db.all("SELECT * FROM users", function(err, rows) {  
  if (!(rows && rows.length)) {
    console.log("Resetting because user table is empty");
    reset();
  }
});

function reset() {
  console.log("Recreating database...");
  db.run("DROP TABLE user;", () => {
    db.run("DROP TABLE settings;", () => {
      db.run("DROP TABLE bookings;", () => {
        createTables();
      });
    });
  });
}

function createTables() {
  // TODO add foreign key userId
  db.run(
    `
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY,
      userId INTEGER,
      start TEXT,
      end TEXT      
    );`,
    function() {
      db.run(
        `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          username TEXT,
          password TEXT,
          admin BIT
        );`,
        function() {
          db.run(
            `
              CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY,
                name TEXT,
                value TEXT
              );`,
            function() {
              // Do something else...
            }
          );
        }
      );
    }
  );
}

var defaultSettings = [
    { "name": "startTime", "value": 8 }, // Earliest time a booking can start, in hours
    { "name": "endTime", "value": 20 }, // Latest time a booking can end, in hours
    { "name": "interval", "value": 0.25 }, // Minimum time between booking start times, in hours
    { "name": "maxBookingLength", "value": 2 }, // Max booking length in hours
    { "name": "maxConcurrentBookings", "value": 6 }, // Max number of bookings at any one time. Equivalent to the number of lanes
    { "name": "daysToDisplay", "value": 14 } // The number of days to display in the calendar, starting from today
  ]

function getSettings(response, callback)
{
  db.all(`SELECT name, value
            FROM settings`,
    function(error, result) {
      if (error) response.status(400).send(error.message);
      
      var settings = {};
      
      for (var i = 0; i < defaultSettings.length; i++)
      {
        settings[defaultSettings[i].name] = defaultSettings[i].value;
      }
      
      console.log("Getting settings from the database");
      
      var anyDefaultsNotSet = false;
      var insertQuery = "INSERT INTO settings (name, value) VALUES ";
       
      if (result == null)
      {
        anyDefaultsNotSet = true;
        console.log("getSettings >> No settings returned");
        
        for (var i = 0; i < defaultSettings.length; i++){
          insertQuery += " ('" + defaultSettings[i].name + "', '" + defaultSettings[i].value + "'),";
        }
      }
      else
      {
        console.log(result.length);
        console.log(result[0]);

        
        for (var i = 0; i < defaultSettings.length; i++){
          var settingFromDb = result.find(setting => setting.name === defaultSettings[i].name);

          if (settingFromDb)
          {
            settings[settingFromDb.name] = parseFloat(settingFromDb.value);
          }
          else
          {
            insertQuery += " ('" + defaultSettings[i].name + "', " + defaultSettings[i].value + "),";
            anyDefaultsNotSet = true;
            console.log(`getSettings >> ${defaultSettings[i].name} not set`);
          }
        }
      }
      
      if (anyDefaultsNotSet)
      {
        insertQuery = insertQuery.replace(/,$/, "");
        // Write settings to db
        db.run(insertQuery, [], function(error){
          if (error) {
            console.log(error);
            response.status(400).send(error.message);
          }
          else
          {
            console.log("Default settings saved to database");
          }
        });
        
      }

      callback(settings);
    }
  ); 
}