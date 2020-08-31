var db = require("./setup-db").db;

module.exports = { returnQueryAll, sendResults, queryAll };

// Helper methods
function returnQueryAll(q) {
  return function(request, response) {
    db.all(q, sendResults(response));
  };
}

function sendResults(response) {
  return function(error, results) {
    if (error) response.status(400).send(error.message);
    else response.send(results);
  };
}

function queryAll(q, next) {
  return function(request, response) {
    db.all(q, parseResults(response, next));
  };
}

function parseResults(response, next) {
  return function(error, results) {
    if (error) {
      //console.log(error);
      response.status(400).send(error.message);
    } else {
      //console.log(results);
      next(results);
    }
  };
}
