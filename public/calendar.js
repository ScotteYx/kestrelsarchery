var settings = {};
var keyCount = 0;
var Bookings;
var UserID;

function DrawCalendar() {
  $("#calendarTable").html('<tr id="headers"></tr>');

  var content = "<td></td>";
  var row = "";

  // CELLS
  var nextTime = settings.startTime;
  var counter = 0;
  while (nextTime < settings.endTime) {
    var timeString = Number.isInteger(nextTime) ? nextTime.toString() : ".";
    timeString += content += "<td>" + timeString + "</td>";
    row +=
      '<td class="time noBookings" title="Click to book" booked="0" users="" value="' +
      nextTime +
      '"><img class="pull-right" src="https://cdn.glitch.com/8122894a-f216-4fd9-8d98-66e3d7e02913%2FusersIcon.png?v=1589925481856" title="Click to see who has booked"></td>';

    // Calculating this each time rather than adding settings.interval to the last value, because adding 
    // resulted in rounding errors that meant Number.isInterger() was only true for the first column
    // - the next hour would be something like 9.99999999998
    counter++;
    nextTime = settings.startTime + (settings.interval * counter);
  }

  // HEADERS
  row += "</tr>";
  $("#headers").html(content);
  for (var i = 0; i < settings.daysToDisplay; i++) {
    var date = moment().add(i, "d");
    var rowWithDate =
      '<tr class="left" date=\'' +
      date.format("DD/MM/YYYY") +
      "'><td>" +
      date.format("ddd D MMM") +
      "</td>" +
      row;
    $("#calendarTable").append(rowWithDate);
  }    

  // CLICK EVENT
  $(".time").on("click", function(event) {
    var cell = event.target;

    if ($(cell).hasClass("yourBooking")) {
      PrepareToCancelBooking(cell);
      return;
    }

    if (!$(cell).hasClass("time")) {
      return;
    }

    var column = cell.cellIndex;
    var time = $(cell).attr("value");
    var rowElement = $(cell).parent();
    var date = moment($(rowElement).attr("date"), "DD/MM/YYYY");
    var rules = `<p style="text-align:left;">
The following rules are currently in place at the field. If you have any questions please contact the committee.

<h4><b>General</b></h4>

<ul style="text-align:left;">
<li>Archers will arrive, set-up, shoot, pack away, go home. There should be no social gatherings, coaching or spectating.</li>
<li>The only people allowed other than archers are a non-shooting parent or guardian of a junior archer and a designated helper for anyone unable to collect their own arrows.</li>
<li>Only members of Kestrels AC and Kestrels Junior AC will be allowed to shoot.</li>
<li>There must be a minimum of 2 senior members present at all times.</li>
<li>The field will be split into 5 shooting lanes. Each is 5m in width. For reference the lanes will be numbered 1-5, left to right as you look down the range from the shooting line.</li>
<li>Each lane may be used by a household group or by an individual archer. Archers from different households will not shoot in the same lane.</li>
<li>All archers will use their own target faces and face pins. These will be provided by the club but remain in the possession of the archer to bring, use and take away every time they shoot.</li>
<li>People will provide their own personal hand sanitiser.</li>
<li>The toilets will be out of bounds except in an emergency. If they are used then all surfaces must be wiped clean including the shed rear door and locks.</li>
<li>Only one person or family group will be allowed in the shed at any time. There will be an exclusion zone around the door entrance.</li>
<li>Nothing in the shed should be touched or moved except for the target stands and bosses.</li>
</ul>

<h4><b>Booking lanes for shooting</b></h4>

<ul style="text-align:left;">
<li>Archers must book a lane in advance of shooting using the booking system. Archers will not be allowed to shoot without booking.</li>
<li>Each booking is for a maximum of 2 hours. This includes any time required to set-up and clear away. You should be ready to leave the field at the end of your booked time – not just ready to pack away.</li>
<li>Shooting may start at 8am and will finish at 8pm. There is a maximum of 6 shooting times and a maximum of 5 lanes each day.</li>
<li>The field may be closed on certain days for maintenance.</li>
<li>Before arriving at the field, you should familiarise yourself, via the booking system, with the numbers/names of people who have booked the same slot and whether or not there are people shooting beforehand or afterwards.</li>
</ul>
 
<h4><b>Arriving at and leaving the field</b></h4>

<ul style="text-align:left;">
<li>You should arrive at the field no earlier than 10 minutes before your booked time. If there are no archers booked in the previous time slot you may arrive earlier to open up the shed.</li>
<li>Park in a position that maintains social distancing.</li>
<li>If there are any other archers on the field from a previous time slot you should wait in your car or at the shooting line end of the field between the road and the shooting line but not on the actual field itself. Maintain social distancing rules.</li>
<li>It is the responsibility of the leaving archers to remove any target stands and bosses back to the shed that are not required by the arriving archers. They should move only the stand/boss from the lane in which they were shooting. This must be completed by the end of their booked time slot.</li>
<li>It is the responsibility of the arriving archers to move any additional target stands/bosses that are required by the arriving group from the shed onto the field.</li>
<li>If target stands are required in different lanes than the leaving group were using it is the responsibility of the arriving group to move them.</li>
<li>You should only enter the field when any previous archers have moved away.</li>
</ul>

<h4><b>Setting Up</b></h4>

<ul style="text-align:left;">
<li>Targets should be placed in the centre of the lane.</li>
<li>Targets may be moved within a lane to change the distance shot.</li>
<li>Archers must provide and fit their own target faces. Shooting at a blank boss is not allowed.</li>
<li>Only 80cm faces may be used on straw bosses. Full sized faces must only be used on full-sized foam bosses.</li>
<li>Archers should set up their own equipment on the field behind the shooting line. They should not use the shed.</li>
</ul>

<h4><b>Shooting and collecting</b></h4>

<ul style="text-align:left;">
<li>The archers will agree amongst themselves who is the field captain.</li>
<li>Household groups will shoot in details of 2 archers. If there are an uneven number then one archer will shoot in a detail by themselves. They may shoot a maximum of 6 arrows each end.</li>
<li>Individual archers may agree with other archers to shoot more than 6 arrows but not at the expense of holding up other archers.</li>
<li>Archers who are unable to collect their own arrows must be accompanied by a member of their own household to collect arrows.</li>
<li>Archers should only touch the target face and their own arrows when collecting arrows. The boss and stand should not be touched in any circumstances.</li>
<li>Lost arrows may be searched for only by those archers in the same group. Archers should not help look for arrows shot by an archer in a different lane.</li>
<li>The club metal detectors should not be used.</li>
<li>If arrows cannot be found in a short and reasonable time they should be left on the field and recorded using the lost arrow form.</li>
</ul>

<h4><b>Other</b></h4>

<ul style="text-align:left;">
<li>Any target faces or target pins left behind will be removed to waste.</li>
<li>If any archery equipment, including lost arrows, is found on the field it should be removed to the shed and placed on the designated table well away from the stands and bosses.</li>
</ul>

</p>
</div>`;

    Swal.fire({
      title: "Kestrels Archery Club : Shooting Procedures During Covid-19 Crisis",
      html: rules,
      width: "90%",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText: "Cancel",
      confirmButtonText: "I understand and agree to follow the rules",
      reverseButtons: true
    }).then(result => {
      if (!result.value) {
        return;
      }

      var markup = `<p>Creating booking on ${date.format(
        "dddd Do MMMM yyyy"
      )}</p>
        <form>
          <div class="form-group">
            <label for="startTime">Start Time</label>
            <input type="text" class="form-control" id="startTime" aria-describedby="startTime">
          </div>
          <div class="form-group">
            <label for="endTime">End Time</label>
            <input type="text" class="form-control" id="endTime" aria-describedby="startTime">
          </div>
        </form>
          <p>Note that the maximum booking time is ${settings.maxBookingLength} hours.</p>`;

      Swal.fire({
        title: "Booking Details",
        html: markup,
        icon: "info",
        confirmButtonText: "Book",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        reverseButtons: true,
        onBeforeOpen: () => {
          var startMoment = moment
            .utc(parseInt(time * 60 * 60 * 1000))
            .format("HH:mm");
          var endMinute = parseInt(time * 60) + settings.maxBookingLength * 60;

          if (settings.endTime * 60 < endMinute) {
            endMinute = settings.endTime * 60;
          }

          var endMoment = moment.utc(endMinute * 60 * 1000).format("HH:mm");

          $("#startTime").timepicker({
            timeFormat: "HH:mm",
            interval: parseInt(settings.interval * 60),
            minTime: moment.utc(settings.startTime * 60 *60 * 1000).format("HH:mm"),
            maxTime: moment.utc(settings.endTime * 60 *60 * 1000).format("HH:mm"),
            defaultTime: startMoment,
            startTime: moment.utc(settings.startTime * 60 *60 * 1000).format("HH:mm"),
            dynamic: false,
            dropdown: true,
            scrollbar: true
          });
          $("#endTime").timepicker({
            timeFormat: "HH:mm",
            interval: parseInt(settings.interval * 60),
            minTime: moment.utc(settings.startTime * 60 *60 * 1000).format("HH:mm"),
            maxTime: moment.utc(settings.endTime * 60 *60 * 1000).format("HH:mm"),
            defaultTime: endMoment,
            startTime: moment.utc(settings.startTime * 60 *60 * 1000).format("HH:mm"),
            dynamic: false,
            dropdown: true,
            scrollbar: true
          });
        }
      }).then(result => {
        if (!result.value) {
          return;
        }
        // Fetch data
        var startDate = moment(date)
          .add(moment.duration($("#startTime").val()))
          .toISOString();
        var endDate = moment(date)
          .add(moment.duration($("#endTime").val()))
          .toISOString();

        // Create booking
        CreateBooking({
          Start: startDate,
          End: endDate
        });

        GetBookings();
      });
    });
  });

  SetEvents(Bookings);
}

$(document).ready(function() {
  $.get("/current_user", function(user) {
    if (user != null) {
      UserID = user.id;
      
      $.get("/getsettings", function(result) {
        settings = result;
        
        GetBookings();
      });
      
    }
    // TODO - if the user is null, alert and then redirect to login screen
  });

  $("#keyButton").click(function() {
    keyCount++;
    var rest = $("#keyButton").html();
    if (
      $("#keyButton")
        .html()
        .includes("Show Key")
    ) {
      $("#keyButton").html("Hide Key");
    } else {
      $("#keyButton").html("Show Key");
    }

    if (keyCount % 30 == 0) {
      $("#confetti").show();
      setTimeout(function() {
        $("#confetti").hide();
      }, 1000);
    }
  });
});

function CreateBooking(booking) {
  var data = { userId: UserID, start: booking.Start, end: booking.End };
  $.ajax({
    type: "POST",
    url: "/createBooking",
    data: data,
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
          title: "Booking Saved",
          text: "Your booking has been successfully saved.",
          icon: "success",
          confirmButtonText: "OK"
        });

        GetBookings();
      }
    }
  });
}

function CancelBooking(booking) {
  var data = { userId: UserID, bookingId: booking.id };
  $.ajax({
    type: "POST",
    url: "/cancelBooking",
    data: data,
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
          title: "Booking Cancelled",
          text: "Your booking has been successfully cancelled.",
          icon: "success",
          confirmButtonText: "OK"
        });

        GetBookings();
      }
    }
  });
}

function GetBookings() {
  $.get("/bookings", function(bookings) {
    Bookings = bookings;
    DrawCalendar();
  });
}

function SetEvents(events) {
  $.each(events, function(index, booking) {
    var date = moment(booking.start).format("DD/MM/YYYY");
    var row = $("tr[date='" + date + "'] td[value]");

    $.each(row, function(index, cell) {
      var value = parseFloat($(cell).attr("value"));
      var startTimeMoment = moment(booking.start);
      var endTimeMoment = moment(booking.end);
      var bookingStartTime =
        parseInt(startTimeMoment.format("HH")) +
        parseInt(startTimeMoment.minutes()) / 60;
      var bookingEndTime =
        parseInt(endTimeMoment.format("HH")) +
        parseInt(endTimeMoment.minutes()) / 60;

      if (value >= bookingStartTime && value < bookingEndTime) {
        $(cell).attr("booked", parseInt($(cell).attr("booked")) + 1);
        $(cell).attr("users", $(cell).attr("users") + "," + booking.username);

        var spaces = settings.maxConcurrentBookings - parseInt($(cell).attr("booked"));
        var plural = "";
        if (spaces > 1) {
          plural = "s";
        }
        $(cell).attr(
          "title",
          "Click to book (" + spaces + " space" + plural + " available)"
        );

        // Highlight the current user's bookings
        if (booking.userId === UserID) {
          $(cell).addClass("yourBooking");
          $(cell).attr("yourBookingId", booking.id);
          $(cell).attr(
            "title",
            "Your booking (" +
              spaces +
              " space" +
              plural +
              " available) - click to cancel"
          );
          $(cell).attr("users", $(cell).attr("users") + " (You)");
        }

        var numberOfBookings = parseInt($(cell).attr("booked"));

        if (numberOfBookings >= settings.maxConcurrentBookings) {
          // Fully booked
          $(cell).addClass("fullyBooked");
          $(cell).removeClass("partiallyBooked");
          $(cell).removeClass("time");
          $(cell).removeClass("noBookings");
          if ($(cell).hasClass("yourBooking")) {
            $(cell).attr(
              "title",
              "Your booking (fully booked) - click to cancel"
            );
          } else {
            $(cell).attr("title", "Fully booked");
          }
        } else if (numberOfBookings <= 0) {
          // No bookings - this code is never hit
          $(cell).addClass("time");
          $(cell).removeClass("fullyBooked");
          $(cell).removeClass("partiallyBooked");
          $(cell).addClass("noBookings");
        } else {
          // Partially booked
          $(cell).addClass("time");
          $(cell).addClass("partiallyBooked");
          $(cell).removeClass("fullyBooked");
          $(cell).removeClass("noBookings");
        }
      }
    });
  });
  
  function GetUsersString(event, api){
    var cell = $(this).parent();
    var users = $(cell).attr("users");
    users = users.replace(/^,/, "");
    users = users.replace(/,/g, "<br/>");
    
    return users;
  }
  
  $('.time img, .fullyBooked img').qtip({
    content: { 
      title: "Existing bookings",
      text: GetUsersString
    },
    position: {
        my: 'bottom center',
        at: 'top center',
        adjust: {
            method: 'shift'
        }
    },
    show: { event:'click mouseenter' },
    hide: { event:'mouseleave unfocus' },
     style: {
        classes: 'qtip-bootstrap'
    }
  });
  
}

function PrepareToCancelBooking(cell) {
  // Ask the user if they want to cancel their booking

  var bookingId = $(cell).attr("yourBookingId");

  ConfirmBookingCancellation(bookingId, GetBookings);
}
