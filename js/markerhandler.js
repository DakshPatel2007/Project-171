AFRAME.registerComponent("markerhandler", {
  init: async function() {
    var toys = await this.getToys();

    this.el.addEventListener("markerFound", () => {
      var markerId = this.el.id;
      this.handleMarkerFound(toys, markerId);
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askUserId: function(){
    swal({
      title: "Welcome to the toy shop",
      content: {
        element:"input",
        attributes: {
          placeholder: "Type your user_id",
        }
      }
    })
    .then(inputValue =>{
      uid = inputValue;
    })
  },


  handleMarkerFound: function(toys, markerId) {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "flex";
    var orderButtton = document.getElementById("order-button");
    var orderSummaryButtton = document.getElementById("order-summary-button");

    orderButtton.addEventListener("click", () => {
      swal({
        icon: "https://i.imgur.com/4NZ6uLY.jpg",
        title: "Thanks For Order !",
        text: "  ",
        timer: 2000,
        buttons: false
      });
    });

    orderSummaryButtton.addEventListener("click", () => {
      swal({
        icon: "warning",
        title: "Order Summary",
        text: "Work In Progress"
      });
    });

    var toy = toys.filter(toy => toy.id === markerId)[0];
    var model = document.querySelector(`#model-${toy.id}`);
    model.setAttribute("position", toy.model_geometry.position);
    model.setAttribute("rotation", toy.model_geometry.rotation);
    model.setAttribute("scale", toy.model_geometry.scale);
  },
  getToys: async function() {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },


handleOrder: function(uid, toy){
  firebase
  .firestore()
  .collection("users")
  .doc(uid)
  .get()
  .then(doc => {
    var details = doc.data();
    if(details["current_orders"][toy.id]){
      details["current_orders"][toy.id]["quantity"] += 1;
      var currentQuantity = details["current_orders"][toy.id]["quantity"];
      details["current_orders"][toy.id]["subtotal"] = 
        currentQuantity * toy.price;
    }else{
      details["current_orders"][toy.id] = {
        item:toy.toy_name,
        price: toy.price,
        quantity: 1,
        subtotal: toy.price * 1
      };
    }

    details.total_bill += toy.price;
    firebase
    .firestore()
    .collection("users")
    .doc(doc.id)
    .update(details);
  })
}
});