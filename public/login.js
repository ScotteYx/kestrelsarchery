var Usernames = [];
var UserId;

$(document).ready(function() {
  $.get("/user", function(response) {
    Usernames = [];

    for (var i = 0; i < response.length; i++) {
      var u = response[i];
      Usernames.push(u);
    }
    
    // If we are on the change password page, check if the current user is an admin
    if ($("#changePasswordButton").length > 0)
    {
      $.get("/current_user", function(response) {
        // If the user is not logged in then redirect to the login page
        if (typeof response.username === "undefined")
        {
          window.location.replace("/");
          return;
        }
        
        UserId = response.id;
        
        // If the current user is an admin 
        if (response.admin == 1){
          
          var selectHtml = `<select id="usernameSelect" class="form-control" name="user">`;
          for (var i = 0; i < Usernames.length; i++)
          {
            selectHtml += `<option value="${Usernames[i].id}">${Usernames[i].username}</option>`
          }
          selectHtml += `</select>`
          
          $("#usernameTxt").replaceWith(selectHtml);
          
          $("#passwordLabel").text("Your password");
        }
        else
        {
          $("#usernameTxt").val(response.username).prop( "disabled", true );
        }
      });  
    }
  });

  $("#loginButton").on("click", function(event) {
    var formData = $("#loginForm").serializeArray();

    var data = {};
    $.each(formData, function(index, item) {
      data[item.name] = item.value;
    });

    $.ajax({
      type: "POST",
      url: "/login",
      data: data,
      complete: function(response, status) {
        if (status === "error") {
          Swal.fire({
            title: "Error!",
            text: response.responseText,
            icon: "error",
            confirmButtonText: "OK"
          });
        } else {
          window.location.replace("/");
        }
      }
    });
  });

  $("#signUpButton").on("click", function(event) {
    var formData = $("#signUpForm").serializeArray();

    var data = {};
    $.each(formData, function(index, item) {
      data[item.name] = item.value;
    });

    if (Usernames.includes(user => user.username == data.username)) {
      Swal.fire({
        title: "Error!",
        text: "Username already exists. Please try another.",
        icon: "error",
        confirmButtonText: "OK"
      });

      return;
    }

    $.ajax({
      type: "POST",
      url: "/signup1",
      data: data,
      complete: function(response, status) {
        var markup, title;
        if (status === "error") {
          var errorMessage = response.responseText
          
          // Handle server errors that return a full html page
          if (response.responseText.includes("DOCTYPE")){
            errorMessage = "Server error. Please refresh the page and try again. If this error persists please contact the committee."
          }
          
          Swal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK"
          });
          
        } else {
          Swal.fire({
            title: "Success!",
            text: "User successfully created!",
            icon: "success",
            confirmButtonText: "OK"
          }).then(() => {
            window.location.replace("/");
          });
        }
      }
    });
  });
  
  $("#changePasswordButton").on("click", function(event){
    
    var formData = $("#passwordChangeForm").serializeArray();

    var data = {};
    $.each(formData, function(index, item) {
      data[item.name] = item.value;
    });
    
    if (typeof data.user == "undefined")
    {
      data.user = UserId;
    }
      
     $.ajax({
      type: "POST",
      url: "/changePassword",
      data: data,
      complete: function(response, status) {
        if (status === "error") {
          Swal.fire({
            title: "Error!",
            text: response.responseText,
            icon: "error",
            confirmButtonText: "OK"
          });
        } else {
          Swal.fire({
            title: "Success",
            text: "Password changed successfully",
            icon: "success",
            confirmButtonText: "OK"
          }).then(() => {
            window.location.replace("/changepassword");
          });
        }
      }
    });
  });
});