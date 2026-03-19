// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// 👥 USERS (Hardcoded)
const users = [
  {
    email: "accountant@gmail.com",
    password: "1234",
    role: "accountant"
  },
  {
    email: "owner@gmail.com",
    password: "1234",
    role: "owner"
  }
];


// 🔐 LOGIN FUNCTION
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("role", user.role);
    loadApp();
  } else {
    alert("Invalid login");
  }
  
  if (user) {
  localStorage.setItem("role", user.role);

  document.getElementById("loginPage").style.display = "none"; // 👈 hide login

  loadApp();
}

}


// 🔄 LOAD APP BASED ON ROLE
function loadApp() {
  const role = localStorage.getItem("role");

  if (role) {
    document.getElementById("loginPage").style.display = "none"; // 👈 hide login
  }

  if (role === "accountant") {
    showAccountantPage();
  } else if (role === "owner") {
    showOwnerPage();
  }
}



// 👨‍💼 ACCOUNTANT PAGE
function showAccountantPage() {
  document.getElementById("app").innerHTML = `
    <h2>Accountant Dashboard</h2>

    <h3>Add Bill</h3>
    <input type="text" id="imageUrl" placeholder="Paste Image URL"><br><br>
    <input type="text" id="items" placeholder="Items (comma separated)"><br><br>
    <input type="number" id="total" placeholder="Total"><br><br>

    <button onclick="saveBill()">Save Bill</button>

    <hr>

    <h3>View Bills</h3>

    <div class="date-row">
      <input type="date" id="selectedDate">
      <button onclick="loadBillsForAccountant()">Load</button>
    </div>

    <div id="billList"></div>

    <button onclick="logout()">Logout</button>
  `;

  // ✅ Auto load today's bills
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("selectedDate").value = today;
  loadBillsForAccountant();
}

let unsubscribe = null;

function loadBillsForAccountant() {
  const date = document.getElementById("selectedDate").value;

  // stop old listener
  if (unsubscribe) unsubscribe();

  unsubscribe = db.collection("bills")
    .where("date", "==", date)
    .onSnapshot(snapshot => {

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

            <button onclick="editBill('${doc.id}', '${data.imageUrl}', '${data.items.join(",")}', ${data.total})">Edit</button>
            <button onclick="deleteBill('${doc.id}')">Delete</button>
          </div>
        `;
      });

      html += `<div class="total-box">Daily Total: ${total}</div>`;

      document.getElementById("billList").innerHTML = html;
    });
}


function deleteBill(id) {
  if (confirm("Delete this bill?")) {
    db.collection("bills").doc(id).delete().then(() => {
      loadBillsForAccountant();
    });
  }
}

let editingId = null;

function editBill(id, imageUrl, items, total) {
  editingId = id;

  document.getElementById("imageUrl").value = imageUrl;
  document.getElementById("items").value = items;
  document.getElementById("total").value = total;

  window.scrollTo(0, 0);
}



// 💾 SAVE BILL
function saveBill() {
  const imageUrl = document.getElementById("imageUrl").value;
  const items = document.getElementById("items").value.split(",");
  const total = Number(document.getElementById("total").value);

  // 👉 IMPORTANT: use selected date instead of always today
  const date = document.getElementById("selectedDate").value;

  if (editingId) {
    db.collection("bills").doc(editingId).update({
      imageUrl,
      items,
      total
    }).then(() => {
      editingId = null;
      alert("Updated!");

      clearForm();              // ✅ clear inputs
      loadBillsForAccountant(); // ✅ AUTO refresh
    });

  } else {
    db.collection("bills").add({
      date,
      items,
      total,
      imageUrl
    }).then(() => {
      alert("Saved!");

      clearForm();              // ✅ clear inputs
      loadBillsForAccountant(); // ✅ AUTO refresh
    });
  }
}
function clearForm() {
  document.getElementById("imageUrl").value = "";
  document.getElementById("items").value = "";
  document.getElementById("total").value = "";
}




// 👑 OWNER PAGE
function showOwnerPage() {
  document.getElementById("app").innerHTML = `
    <h2>Owner Dashboard</h2>

    <div class="date-row">
      <input type="date" id="date">
      <button onclick="loadBills()">Load</button>
    </div>

    <div id="list"></div>

    <button onclick="logout()">Logout</button>
  `;
}


// 📊 LOAD BILLS
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


// 🚪 LOGOUT
function logout() {
  localStorage.removeItem("role");

  document.getElementById("loginPage").style.display = "block"; // 👈 show login again
  document.getElementById("app").innerHTML = "";
}



// 🔄 AUTO LOGIN IF ALREADY LOGGED IN
window.onload = function () {
  if (localStorage.getItem("role")) {
    loadApp();
  }
};

