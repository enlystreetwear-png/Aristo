// Paste your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyAMqZpc0u8WqE8mby9tLGn9HpkiOhwjz8I",
  authDomain: "aristo-46e2f.firebaseapp.com",
  databaseURL: "https://aristo-46e2f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aristo-46e2f",
  storageBucket: "aristo-46e2f.firebasestorage.app",
  messagingSenderId: "976927618183",
  appId: "1:976927618183:web:4d3c3cf76b2707699bb422",
  measurementId: "G-7WN802GCS7"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();


function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(user => {
      if (email === "accountant@gmail.com") {
        showAccountantPage();
      } else {
        showOwnerPage();
      }
    })
    .catch(err => alert(err.message));
}


function showAccountantPage() {
  document.getElementById("app").innerHTML = `
    <h2>Accountant</h2>

    <input type="text" id="imageUrl" placeholder="Paste Image URL"><br><br>
    <input type="text" id="items" placeholder="Items (comma separated)"><br><br>
    <input type="number" id="total" placeholder="Total"><br><br>

    <button onclick="uploadBill()">Save Bill</button>
  `;
}


function uploadBill() {
  const imageUrl = document.getElementById("imageUrl").value;
  const items = document.getElementById("items").value.split(",");
  const total = Number(document.getElementById("total").value);

  const date = new Date().toISOString().split("T")[0];

  db.collection("bills").add({
    date: date,
    items: items,
    total: total,
    imageUrl: imageUrl
  });

  alert("Saved!");
}



function showOwnerPage() {
  document.getElementById("app").innerHTML = `
    <h2>Owner</h2>

    <input type="date" id="date">
    <button onclick="loadBills()">Load</button>

    <div id="list"></div>
  `;
}

function loadBills() {
  const date = document.getElementById("date").value;

  db.collection("bills")
    .where("date", "==", date)
    .get()
    .then(snapshot => {

      let html = "";
      let total = 0;

      snapshot.forEach(doc => {
        const data = doc.data();

        total += data.total;

        html += `
  <div class="bill-card">
    <img src="${data.imageUrl}">
    <p><strong>Total:</strong> ${data.total}</p>
    <p><strong>Items:</strong> ${data.items.join(", ")}</p>
  </div>
`;

      });

      html += `<div class="total-box">Daily Total: ${total}</div>`;


      document.getElementById("list").innerHTML = html;
    });
}
