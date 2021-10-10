// Creating Date Object
let fullDate = new Date();
let hour = fullDate.getHours();
let min = fullDate.getMinutes();
let ampm = hour >= 12 ? "pm" : "am";
hour = hour % 12 == 0 ? 12 : hour % 12;
hour = hour < 10 ? `0${hour}` : hour;
min = min < 10 ? `0${min}` : min;
let time = `${hour}:${min} ${ampm}`;

// Getting your name and making it titlecase
let name = prompt("Enter your name");
name = `${name.slice(0, 1).toUpperCase()}${name.slice(1).toLowerCase()}`;

// Getting HTML Elements
var messages = document.getElementById("messages");
messages.className = "messages";
var inputBar = document.getElementById("inputBar");
inputBar.className = "inputBar";
var input = document.getElementById("input");
input.className = "input";
var btn = document.getElementById("btn");
btn.className = "btn";

// Creating function to send data to Firebase Database
function sendData() {
  var key = firebase.database().ref(`messages`).push().key;
  let obj = {
    key: key,
    sender: name,
    msg: input.value,
    msgTime: time,
  };
  firebase.database().ref(`messages/${key}`).set(obj);
  input.value = "";
}

// Get data from Firebase Database to DOM
firebase
  .database()
  .ref(`messages`)
  .on("child_added", (data) => {
    // Create Elements
    let msg_li = document.createElement("li");
    let msgDiv = document.createElement("div");
    msgDiv.className = "msgDiv";
    let msgDetails = document.createElement("small");
    msgDetails.className = "msgDetails";
    let senderName = document.createElement("span");
    senderName.className = "senderName";
    let msgTime = document.createElement("span");
    msgTime.className = "msgTime";
    let msg = document.createElement("p");
    msg.className = "msg";

    // Append Elements
    messages.append(msg_li);
    msg_li.append(msgDiv);
    msgDiv.append(msgDetails);
    msgDiv.append(msg);
    msgDetails.append(senderName);
    msgDetails.append(msgTime);
    senderName.innerHTML = `${data.val().sender} • `;
    msgTime.innerHTML = data.val().msgTime;
    msg.innerHTML = data.val().msg;

    // Show delete button if a message is sent by me
    if (data.val().sender === name) {
      msg_li.className = "msgRight";
      msgDiv.id = data.val().key;
      if (data.val().msg != "This message has been deleted") {
        let delBtn = document.createElement("i");
        delBtn.setAttribute("class", "far fa-trash-alt");
        delBtn.setAttribute("onclick", "delMsg(this)");
        delBtn.className += " delBtn";
        delBtn.style.color = "#DC3545";
        delBtn.id = data.val().key;
        msg_li.append(delBtn);
      }
      // Show others message on left
    } else if (data.val().sender !== name) {
      msg_li.className = "msgLeft";
    }

    window.scrollTo(0, document.documentElement.scrollHeight);
  });

// Delete message
function delMsg(e) {
  firebase.database().ref(`messages`).child(e.id).set({
    key: e.id,
    sender: name,
    msg: "This message has been deleted",
    msgTime: time,
  });
  e.remove();
}

// Show message deleted on DOM
firebase
  .database()
  .ref(`messages`)
  .on("child_changed", (data) => {
    var delMsgPara = document.getElementById(data.val().key).lastChild;
    delMsgPara.innerHTML = data.val().msg;
  });

// Create Event Listener
btn.addEventListener("click", sendData);
input.onkeyup = (e) => {
  e.keyCode === 13 ? sendData() : "";
};
