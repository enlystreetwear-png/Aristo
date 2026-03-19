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

    <input type="text" id="imageUrl" placeholder="Paste Image URL"><br><br>
    <input type="text" id="items" placeholder="Items (comma separated)"><br><br>
    <input type="number" id="total" placeholder="Total"><br><br>

    <button onclick="saveBill()">Save Bill</button>
    <button onclick="logout()">Logout</button>
  `;
}


// 💾 SAVE BILL
function saveBill() {
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

  alert("Bill saved!");
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

