paypal
  .Buttons({
    // Estilo de los botones
    style: {
      color: "blue",
      label: "pay"
    },
    // Call your server to set up the transaction
    createOrder: function (data, actions) {
      return fetch("http://127.0.0.1:8000/api/paypal/generar-orden", {
        method: "get",
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (orderData) {
          return orderData.id;
        });
    },

    // Call your server to finalize the transaction
    onApprove: function (data, actions) {
      return fetch(
        "http://127.0.0.1:8000/api/paypal/guardar-orden/" + data.orderID,
        {
          method: "get",
        }
      )
        .then(function (res) {
          return res.json();
        })
        .then(function (orderData) {
          // Three cases to handle:
          //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
          //   (2) Other non-recoverable errors -> Show a failure message
          //   (3) Successful transaction -> Show confirmation or thank you

          // This example reads a v2/checkout/orders capture response, propagated from the server
          // You could use a different API or structure for your 'orderData'
          var detalleError =
            Array.isArray(orderData.details) && orderData.details[0];

          if (detalleError && detalleError.issue === "INSTRUMENT_DECLINED") {
            return actions.restart(); // Recoverable state, per:
            // https://developer.paypal.com/docs/checkout/integration-features/funding-failure/
          }

          if (detalleError) {
            var msg = "Lo sentimos, su transacción no pudo ser procesada.";
            if (detalleError.description)
              msg += "\n\n" + detalleError.description;
            if (orderData.debug_id) msg += " (" + orderData.debug_id + ")";
            return alert(msg); // Show a failure message (try to avoid alerts in production environments)
          }

          // Successful capture! For demo purposes:
          console.log("Capture result", orderData);

          // Replace the above to show a success message within this page, e.g.
          // const element = document.getElementById('paypal-button-container');
          // element.innerHTML = '';
          // element.innerHTML = '<h3>Thank you for your payment!</h3>';
          // Or go to another URL:  actions.redirect('thank_you.html');
        });
    },
  })
  .render("#paypal-button-container");
