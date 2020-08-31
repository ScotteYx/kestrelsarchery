var daysToDisplay = 14;
$(document).ready(function() {
  var user_bookings = [];

  function GetBookings() {
    user_bookings = [];
    var currentDatePlusDaysToDisplay = moment().add(daysToDisplay, "day");
    $.get(
      "/user_bookings",//?endDate=" + currentDatePlusDaysToDisplay.toISOString(),
      function(bookings) {
        user_bookings = bookings;
      }
    ).then(() => {
      HideOrShowTable();
    });
  }

  function HideOrShowTable() {
    if (user_bookings.length == 0) {
      $("#bookingsLead").hide();
      $("#bookingsTable").hide();
      $("#noBookingsMessage").show();
    } else {
      $("#bookingsLead").show();
      $("#bookingsTable").show();
      PopulateTable();
    }
  }

  function PopulateTable() {
    $("#bookingsTable").html("");

    user_bookings.sort(function(item1, item2) {
      return moment(item1.start).diff(moment(item2.start));
    });

    var headings = `              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th></th>
              </tr>`;
    $("#bookingsTable").append(headings);

    $.each(user_bookings, function(index, item) {
      var row = "<tr><td>" + moment(item.start).format("dddd, MMMM Do YYYY");
      +"</td>";
      row = row + "<td>" + moment(item.start).format("HH:mm") + "</td>";
      row = row + "<td>" + moment(item.end).format("HH:mm") + "</td>";
      row =
        row +
        '<td><button type="button" id="cancelButton_' +
        item.id +
        '" class="btn btn-primary">Cancel</button</td></tr>';

      $("#bookingsTable").append(row);
      $("#cancelButton_" + item.id).click(function() {
        ConfirmBookingCancellation(item.id, GetBookings);
      });
    });
  }

  GetBookings();
});
