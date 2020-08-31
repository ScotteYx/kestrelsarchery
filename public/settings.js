var daysToDisplay = 14;
$(document).ready(function() {
  var settings = [];

  function GetSettings() {
    settings = [];
    $.get("/getsettings",
      function(result) {
        settings = result;
      }
    ).then(() => {
      HideOrShowTable();
    });
  }

  // TODO - save button
  
  
  function HideOrShowTable() {
    if (settings.length == 0) {
      $("#settingsTable").hide();
    } else {
      $("#settingsTable").show();
      PopulateTable();
    }
  }

  function PopulateTable() {
    $("#settingsTable").html("");
 

    var headings = `<tr>
                <th>Setting</th>
                <th>Value</th>
              </tr>`;
    $("#settingsTable").append(headings);

    $.each(settings, function(key, value) {
      var row = "<tr><td>" + key + "</td>";
      row = row + `<td><input type='text' class='settingsValue' setting='${key}' value='${value}' /></td>`;
      
      $("#settingsTable").append(row);
    
    });
  }

  $("#saveSettingsBtn").on("click", function(){
    // Get settings from controls
    $.each($(".settingsValue"), function(index, item){
      settings[$(item).attr("setting")] = parseFloat($(item).val());
    });
    
    // Send request to server
    $.ajax({
    type: "POST",
    url: "/setsettings",
    data: { settings: settings },
    complete: function(response, status) {
      if (status === "error") {
        Swal.fire({
          title: "Error",
          html: response.responseText.includes("DOCTYPE")
            ? "Please try again and contact a member of the committee if this occurs again"
            : response.responseText,
          icon: "error",
          confirmButtonText: "OK"
        });
      } else {
        Swal.fire({
          title: "Settings Saved",
          text: "Your changes have been saved.",
          icon: "success",
          confirmButtonText: "OK"
        });

        GetSettings();
      }
    }
  });
    
  });
  
  GetSettings();
});
