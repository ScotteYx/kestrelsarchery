function ConfirmBookingCancellation(bookingId, callback) {
  // Ask the user if they want to cancel their booking
  var markup = `<p>Are you sure you want to cancel this booking?</p>`;

  Swal.fire({
    title: "Cancel Booking",
    html: markup,
    icon: "info",
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    reverseButtons: true
  }).then(result => {
    if (!result.value) {
      return;
    }

    CancelBooking(bookingId, callback);
  });
}


function CancelBooking(bookingId, callback){
  var data = { userId: UserID, bookingId: bookingId };
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

        callback();
      }
    }
  });
}