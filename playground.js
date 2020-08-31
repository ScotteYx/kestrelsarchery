var db    = require('./setup-db').db,
    reset = require('./setup-db').reset;

module.exports = function(app) {
  
  if (process.env.SECRET_URL) {
    app.get('/' + process.env.SECRET_URL, function (request, response) {
      response.cookie('isSuper', process.env.SECRET_URL);
      response.redirect('/'); 
    });
  }
  
  app.get('/reset', function(request, response) {    
    
    if (block(request, true)) {
      response.status(403).send('You are not authorised. Please log in as an admin user.');
      return;
    }

    console.log("Reset get called");
    reset();
    response.redirect('/');
  });
  
  app.get("/calendar", function(request, response) {
     if (block(request, false))
      {
        console.log("Request blocked");
        response.redirect('/');
      }
    else response.sendFile(__dirname + "/views/calendar.html");
  });
  
  app.get("/sql", function (request, response) {
    if (block(request, true))
      {
        console.log("Request blocked");
      response.redirect('/');
      }
    else
      response.sendFile(__dirname + '/views/playground.html');
  });
  
  app.post('/playground-query', function(request, response) {
    if (block(request, true)) {
      response.status(403).send('You are not authorised. Please log in as an admin user.');
      return;
    }

    db.all(request.body.query, function(error, rows) {
        if (error)
          response.status(400).send(error.message);
        else
          response.send(rows);
    });
  });
}

function block(request, adminOnly) {

  // If the current user is not an admin then block the request
  if (typeof request.session == "undefined" || typeof request.session.user == "undefined" )
  {
      console.log("Please log in to view this page");
      return true;
  }
  
  //return false; // TODO - remove this line before release

  if(adminOnly && request.session.user.admin !== 1)
  {
    console.log("Request blocked - user is not admin");
    return true;
  }
  
    return process.env.BLOCK_PLAYGROUND === "true" && request.cookies.isSuper !== process.env.SECRET_URL;
}