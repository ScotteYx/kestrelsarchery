var UserID;

$(document).ready(function() {
  $.get("/current_user", function(user) {
    UserID = user.id;

    var content;

    if (typeof user.id == "undefined") {
      content = `
        <li><a href="/">Log In</a></li>`;
    } else {
      $(".loggedInAs").text("Logged in as: " + user.username);
      content = `
          <li><a href="/changepassword">Change Password</a></li> 
          <li><a href="/logout">Log Out</a></li>
        `;
      
      // Show logged in message
      $(".loggedInAs").show();
      
      // Show all users the Calendar tab
      $(".userTab").show();
      
      // Only show admin users the settings tab
      if (user.admin == "1")
      {
        $(".settingsTab").show();
      }
    }

    $("#navRight").html(content);
  });

  $("#logoutButton").on("click", function(event) {
    $.get("/logout");
  });
});
