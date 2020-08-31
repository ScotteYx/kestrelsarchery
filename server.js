// where your node app starts
// First we require all the libraries we want to use
var mkdirp = require("mkdirp");
mkdirp(".data");
mkdirp(".data/public");

var fs = require("fs"),
  http = require("http"),
  express = require("express"),
  bodyParser = require("body-parser"), // This middleware parses posted form data (used to let users post new catbnb listings)
  multer = require("multer"), // this middleware allows users to post files (like images)
  cookieParser = require("cookie-parser"),
  session = require("express-session"),
  upload = multer({ dest: ".data/public/images" }), // Set up a directory for uploaded images
  app = express(), // Set up express
  hash = require("object-hash"),
  jQuery = require("jquery");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "keyboard cat",
    cookie: { maxAge: 6000000 },
    resave: true,
    saveUninitialized: false
  })
);
app.use(cookieParser());

var setup = require("./setup-db"),
  db = require("./setup-db").db,
  returnQuery = require("./helpers").returnQueryAll,
  runQuery = require("./helpers").queryAll,
  moment = require("./public/moment");

// Start the server
var server = http.createServer(app);
server.listen(process.env.PORT);

require("./playground")(app);

// Everything in the front-end's public/ folder will be made available for download to the client
app.use(express.static("public"));
app.use(express.static(".data/public"));

//===========================================================================
// Login/logout
//===========================================================================
function VerifyPassword(username, password, request, response, callback){
  // Hash password
  var hashedPassword =  HashPassword(password);

  var existingUsers = runQuery(
    `SELECT * FROM users WHERE LOWER(username)='${username}' AND password='${hashedPassword}'`,
    function(results) {
      console.log("   checkSignIn - " + results);

      if (results && results.length > 0) {
        var user = results[0];

        // We don't want to send the password back so create a new user object without it to return
        var userToReturn = {
          id: user.id,
          username: user.username,
          admin: user.admin
        };
        
        callback(userToReturn);
      } else {       
        callback(null);
      }
    });

  existingUsers(request, response);
}

// This route logs in the selected user
app.post("/login", function(request, response) {
    console.log(">> checkSignIn");

  VerifyPassword(request.body.username.toLowerCase(), request.body.password, request, response, function(user){
    if (user == null)
    {
      console.log("   checkSignIn - 401");
      response.status(401).send("Username or password incorrect");
    }
    else
    {
       request.session.user = user;
       console.log("User " + request.session.user.username + " logged in");
      response.sendStatus(200);
    }
  });
});

// This route logs out the user
app.get("/logout", function(request, response) {
  if (request.session.user) {
    console.log("User " + request.session.user.username + " logging out");
  }
  request.session.destroy();
  if (typeof request.session == "undefined") console.log("User logged out");

  response.redirect("/");
});

//===========================================================================
// Navigate
//===========================================================================
// This route checks to see if the user is logged in.
// If not, it shows a login screen
// If you are, it shows the calendar page
app.get("/", function(request, response) {
  if (!request.session.user) {
    console.log(">> Home - Login page");
    response.sendFile(__dirname + "/views/login.html");
  } else {
    console.log(">> Home - Calendar page");
    response.sendFile(__dirname + "/views/calendar.html");
  }
});

// This route shows the signup form
app.get("/signup", function(request, response) {
  console.log(">> signup");
  response.sendFile(__dirname + "/views/signup.html");
});

// This route shows the navbar
app.get("/navbar", function(request, response) {
  console.log(">> navbar");
  response.sendFile(__dirname + "/views/navbar.html");
});

// This route shows the bookings page
app.get("/mybookings", function(request, response) {
  console.log(">> mybookings");
  response.sendFile(__dirname + "/views/bookings.html");
});

// This route shows the settings form
app.get("/settings", function(request, response) {
  if (block(request, true)) {
    response
      .status(403)
      .send(
        "You are not logged in as an admin. Only admins are able to view the settings page."
      );
    return;
  }

  console.log(">> settings");
  response.sendFile(__dirname + "/views/settings.html");
});

// This route shows the bookings page
app.get("/changepassword", function(request, response) {
  console.log(">> changepassword");
  response.sendFile(__dirname + "/views/changepassword.html");
});

// This route shows the ladder
app.get("/ladder", function(request, response) {
  console.log(">> ladder");
  response.sendFile(__dirname + "/views/ladder.html");
});
  
  // This route shows the matches
app.get("/mymatches", function(request, response) {
  console.log(">> ladder");
  response.sendFile(__dirname + "/views/matches.html");
});
//===========================================================================
// Data handling
//===========================================================================
// These routes return the results of an SQL query
app.get("/user", returnQuery("SELECT id, username, admin FROM users"));
app.get("/bookings", returnQuery(`SELECT bookings.id AS id, bookings.start AS start, bookings.end AS end, bookings.userId AS userId, users.username AS username
                                    FROM bookings 
                                    JOIN users
                                      ON bookings.userId = users.id
                                ORDER BY username`)
);

function signUp(request, response, next) {
  console.log(">> signup1");
  var username = request.body.username,
    verifier = request.body.verifier,
    password = request.body.password,
    passwordReenter = request.body.passwordReenter;

  // Check that the verifier is correct. This is just a simple passcode to verify that the users are actually people we know
  if (
    !verifier ||
    verifier.toLowerCase().trim() !== process.env.SignUpVerifier
  ) {
    response
      .status(401)
      .send(
        "The verification code entered was not correct. Please check the spelling."
      );
    return;
  }

  // Check that the username is valid i.e. no special characters that will be affected by the database
  var regex = /^[A-Za-z0-9 ][A-Za-z0-9 ]*[A-Za-z0-9 ]$/g;
  var match = username.match(regex);
  if (!match) {
    response
      .status(401)
      .send(
        "The username is not valid. Please only use alphanumeric characters"
      );
    return;
  }

  // Check that the user does not already exist
  // Ideally this check should be done here, but for now it is on the client side before we call /signup
  var checkIfUserExists = runQuery(
    `SELECT id, username
       FROM users 
      WHERE LOWER(username) = '${username.toLowerCase()}'`,
    function(results) {
      if (results && results.length > 0) {
        response
          .status(401)
          .send(
            "A user named '" +
              results[0].username +
              "' already exists. Please try a different username."
          );
        return;
      }

      // Check that the passwords match
      if (password !== passwordReenter) {
        response.status(401).send("The passwords do not match.");
        return;
      }

      // Hash password
      var hashedPassword =  HashPassword(password);      

      console.log("Creating user...");

      db.run(
        `INSERT INTO users (username, password) VALUES('${username}', '${hashedPassword}')`,
        function() {
          var getUser = runQuery(
            `SELECT id, username, admin FROM users WHERE username ='${username}' AND password='${hashedPassword}'`,
            function(results) {
              console.log(results);

              if (results && results.length > 0) {
                var user = results[0];

                // We don't want to send the password back so create a new user object without it to return
                request.session.user = {
                  id: user.id,
                  username: user.username,
                  admin: user.admin
                };

                console.log("User created.");
                next();
              } else {
                response
                  .status(401)
                  .send("User was not added correctly. Please try again.");
              }
            }
          );

          getUser(request, response);
        }
      );
    }
  );

  checkIfUserExists();
}

// When you post to the route instead of get it, we want it to create a new user with the posted information
// As an exercise, relace the SQL query in this method with one that will insert the new user into the database
app.post("/signup1", signUp, function(request, response) {
  console.log("User logged in. Redirecting...");
  response.redirect("/");
});


app.post("/changePassword", function(request, response) {
  if (block(request, false))
  {
    response
      .status(403)
      .send("You are not logged in. Please log in to change a password.");
    return;
  }
  
  var userId = parseInt(request.body.user);
  var currentUserPassword = request.body.password;
  var newPassword = request.body.newPassword;
  var passwordReenter = request.body.passwordReenter;
  
  if (newPassword !== passwordReenter)
  {
     response
      .status(403)
      .send("The new passwords do not match.");
    return;
  }

  // We will only allow users to change their own password, unless they are an admin
  if (request.session.user.id !== userId && request.session.user.admin !== 1)
  {
     response
      .status(403)
      .send("You are only allowed to change your own password. Contact an admin if another password needs to be changed.");
    return;
  }
  
  console.log(5);

  // Check the password
  VerifyPassword(request.session.user.username.toLowerCase(), currentUserPassword, request, response, function(user){
      console.log(6);

    
    if (user == null)
    {
     response
      .status(403)
      .send("Password entered was not correct.");
      return;
    }
    else
    {
      console.log("Changing password...");
      
      // Hash password
      var newHashedPassword =  HashPassword(newPassword);
      
      var query = runQuery(`UPDATE users SET password='${newHashedPassword}' WHERE id='${userId}'`, function(result) {
        response.sendStatus(200);
      });
      
      query(request, response);
    }
  });
});

// This route sends the currently logged in user's information
app.get("/current_user", function(request, response) {
  console.log(">> current_user");
  if (typeof request.session == "undefined" || typeof request.session.user == "undefined") {
    response.send({});
  } else {
    db.get(
      `SELECT id, username, admin FROM users WHERE id = ${request.session.user.id}`,
      function(err, row) {
        response.send(row);
      }
    );
  }
});

app.get("/user_bookings", function(request, response) {
  console.log(">> user_bookings");
  if (block(request, false)) {
    response
      .status(403)
      .send("You are not logged in. Please log in to check your bookings.");
    return;
  }

  var now = moment().add(-24 * 60, "minutes").format("YYYY-MM-DDT00:00:00.000Z");
  var query = runQuery(
    `SELECT *
              FROM bookings
              WHERE userId = ${request.session.user.id}
              AND 
              dateTime(start) > dateTime('${now}')`,
    function(result) {
      console.log(result);
      response.send(result);
    }
  );

  query();
});

function checkBooking(request, response, next) {
  console.log(">> checkBooking");

  // Check that the user is logged in
  if (block(request, false)) {
    response
      .status(403)
      .send("You are not logged in. Please log in to create bookings.");
    return;
  }

  var start = request.body.start,
    end = request.body.end,
    user = request.session.user.id;

  var startTime = moment(start);
  var endTime = moment(end);

  // Check that the start of the booking is before the end
  if (!startTime.isBefore(endTime)) {
    response.status(403).send("The end time must be after the start time.");
    return;
  }

  setup.getSettings(response, function(settings) {
    // Check the duration of the booking
    if (
      moment.duration(endTime.diff(startTime)).asMinutes() >
      settings.maxBookingLength * 60
    ) {
      response
        .status(403)
        .send(
          "The maximum bookig time is currently " +
            settings.maxBookingLength +
            " hours. Unable to create booking."
        );
      return;
    }

    /*
    - Verify booking times
  - Do not allow more than max/2 bookings to start at the same time (round up?)
  */

    // Get current bookings in the selected time frame
    var checkBookingsInTimeframe = runQuery(
      `SELECT userId, start, dateTime(start) AS startDate, end, dateTime(end) AS endDate
         FROM bookings 
        WHERE (dateTime(start) >= dateTime('${start}') AND dateTime(start) < dateTime('${end}'))
           OR (dateTime(end) > dateTime('${start}') AND dateTime(end) <= dateTime('${end}'))
           OR (dateTime(start) <= dateTime('${start}') AND dateTime(end) >= dateTime('${end}'))`,

      function(results) {
        if (results && results.length > 0) {
          // Check if the user already has a booking in this time period

          for (var i = 0; i < results.length; i++) {
            var row = results[i];
            if (row.userId == user) {
              response
                .status(401)
                .send("You already have a booking in this time frame.");
              return;
            }

            row.startMoment = moment(row.start);
            row.endMoment = moment(row.end);
          }

          // Verify the number of bookings at this time does not exceed the max. allowed

          var times = [];

          for (
            var i = moment(start);
            i.diff(end, "minutes") < 0;
            i.add(settings.interval * 60, "minutes")
          ) {
            var time = {
              time: moment(i),
              count: 0
            };

            console.log(time.time);

            times.push(time);
          }

          var tooManyBookings = false;
          for (var i = 0; i < results.length; i++) {
            for (var j = 0; j < times.length - 1; j++) {
              var row = results[i];
              var startTime = times[j];
              var endTime = times[j + 1];

              // If the start is before the end time and the end is after the start time then it is in this time frame
              // end > start
              // row start < start & row end > end
              // |    |--|     |
              // row start < start & row end > start
              // |         |-|-|
              // row start < end & row end > end
              // |-|-|         |

              //console.log("   checking " + row.start + ", " + row.end + ", " + j + ", " + startTime.time.toISOString());
              if (
                row.startMoment.diff(endTime.time) < 0 &&
                row.endMoment.diff(startTime.time) > 0
              ) {
                //console.log(startTime.time.format())
                startTime.count++;
                if (startTime.count >= settings.maxConcurrentBookings) {
                  tooManyBookings = true;
                  break;
                }
              }
            }

            if (tooManyBookings) {
              break;
            }
          }

          if (tooManyBookings) {
            response
              .status(401)
              .send("There is not enough space to book this time frame.");
            return;
          }

          next();
        } else {
          next();
        }
      }
    );

    console.log(">> checkBookingsInTimeframe");
    checkBookingsInTimeframe(request, response);
  });
}

// This method creates a booking on the selected date
app.post("/createBooking", checkBooking, function(request, response) {
  var start = request.body.start,
    end = request.body.end,
    user = request.session.user.id,
    username = request.session.user.username;

  console.log("Creating booking for user " + username + "...");

  // Run a database query to add to the booking table
  db.run(
    `INSERT INTO bookings(userId, start, end) VALUES(${user}, '${start}', '${end}')`
  );

  console.log(
    "Created booking: " + start + " - " + end + " for user " + username
  );
  response.sendStatus(200);
});

// Cancel a booking
app.post("/cancelBooking", function(request, response) {
  console.log(">> cancelBooking");
  if (block(request, false)) {
    response
      .status(403)
      .send("You are not logged in. Please log in to cancel your bookings.");
    return;
  }

  var booking = request.body.bookingId,
    user = request.session.user.id,
    username = request.session.user.username;

  console.log(
    "Cancelling booking " + booking + " for user " + username + "..."
  );

  // TODO - check that the booking belongs to the user so we can send them an error if the id doesn't match up or exist

  // Run a database query to add to the booking table
  db.run(`DELETE FROM bookings WHERE id = ${booking} AND userId = ${user}`);

  console.log("Booking cancelled for user " + username);
  response.sendStatus(200);
});

//================================
// Settings
//================================
app.get("/getsettings", function(request, response) {
  if (block(request, false)) {
    response
      .status(403)
      .send("You are not logged in. Please log in to check settings.");
    return;
  }

  setup.getSettings(response, function(result) {
    response.send(result);
  });
});

app.post("/setsettings", function(request, response) {
  if (block(request, false)) {
    response
      .status(403)
      .send("You are not logged in. Please log in to set settings.");
  }

  var updateQuery = `UPDATE settings SET value = (CASE `;
  var inQuery = "";

  for (var i = 0; i < Object.keys(request.body.settings).length; i++) {
    var key = Object.keys(request.body.settings)[i];
    var value = request.body.settings[key];

    if (!Number(value)) {
      response
        .status(403)
        .send(`Invalid value set for setting '${key}'. Settings not saved.`);
      return;
    }
    updateQuery += ` WHEN name = '${key}' THEN '${value}' `;
    inQuery += ` '${key}',`;
  }

  inQuery = inQuery.replace(/,$/, "");
  updateQuery += ` END) WHERE name in (${inQuery}) `;

  console.log(updateQuery);

  var query = runQuery(updateQuery, function(result) {
    response.sendStatus(200);
  });

  query();
});


function HashPassword(password)
{
    var objToHash = {
    password: password,
    seed: process.env.HashSeed
  };
  
  // Hash password
  var hashedPassword = hash(objToHash);
  return hashedPassword;
}

function block(request, adminOnly) {
  // If the current user is not an admin then block the request
  if (
    typeof request.session == "undefined" ||
    typeof request.session.user == "undefined"
  ) {
    console.log("Please log in to view this page");
    return true;
  }

  if (adminOnly && request.session.user.admin !== 1) {
    console.log("Request blocked - user is not admin");
    return true;
  }

  return false;
}
