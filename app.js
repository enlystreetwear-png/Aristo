// 🔥 Firebase Config (TOP)
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// 👥 USERS
const users = [
  { email: "accountant@gmail.com", password: "1234", role: "accountant" },
  { email: "owner@gmail.com", password: "1234", role: "owner" }
];


// 🔐 LOGIN
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("role", user.role);
    document.getElementById("loginPage").style.display = "none";
    loadApp();
  } else {
    alert("Invalid login");
  }
}


// 🔄 LOAD APP
function loadApp() {
  const role = localStorage.getItem("role");

  if (role) {
    document.getElementById("loginPage").style.display = "none";
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

    <div id="itemsContainer"></div>

    <button onclick="addItem()">+ Add Item</button><br><br>

    <h3>Total: ₹ <span id="totalAmount">0</span></h3>

    <button onclick="saveBill()">Save Bill</button>

    <hr>

    <h3>View Bills</h3>

    <div class="date-row">
      <input type="date" id="selectedDate" onchange="loadBillsForAccountant()">
    </div>

    <div id="billList"></div>

    <button onclick="logout()">Logout</button>
  `;

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("selectedDate").value = today;

  loadBillsForAccountant();
}


// ➕ ADD ITEM
function addItem(name = "", price = "") {
  const container = document.getElementById("itemsContainer");

  const div = document.createElement("div");
  div.className = "item-row";

  div.innerHTML = `
    <input type="text" placeholder="Item name" value="${name}" class="item-name">
    <input type="number" placeholder="Price" value="${price}" class="item-price" oninput="calculateTotal()">
    <button onclick="this.parentElement.remove(); calculateTotal()">X</button>
  `;

  container.appendChild(div);
}


// 💰 CALCULATE TOTAL
function calculateTotal() {
  const prices = document.querySelectorAll(".item-price");

  let total = 0;

  prices.forEach(input => {
    total += Number(input.value) || 0;
  });

  document.getElementById("totalAmount").innerText = total;
}


// 🔄 REAL-TIME LISTENER
let unsubscribe = null;

function loadBillsForAccountant() {
  const date = document.getElementById("selectedDate").value;

  if (unsubscribe) unsubscribe();

  unsubscribe = db.collection("bills")
    .where("date", "==", date)
    .onSnapshot(snapshot => {

      let html = "";
      let total = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        total += data.total;

        let itemsHtml = "";
        data.items.forEach(item => {
          itemsHtml += `<p>${item.name} - ₹${item.price}</p>`;
        });

        html += `
          <div class="bill-card">
            <img src="${data.imageUrl}">
            ${itemsHtml}
            <p><strong>Total:</strong> ₹${data.total}</p>

            <button onclick="editBill('${doc.id}')">Edit</button>
            <button onclick="deleteBill('${doc.id}')">Delete</button>
          </div>
        `;
      });

      html += `<div class="total-box">Daily Total: ₹${total}</div>`;

      document.getElementById("billList").innerHTML = html;
    });
}


// 🗑️ DELETE
function deleteBill(id) {
  if (confirm("Delete this bill?")) {
    db.collection("bills").doc(id).delete();
  }
}


// ✏️ EDIT
let editingId = null;

function editBill(id) {
  editingId = id;

  db.collection("bills").doc(id).get().then(doc => {
    const data = doc.data();

    document.getElementById("imageUrl").value = data.imageUrl;

    const container = document.getElementById("itemsContainer");
    container.innerHTML = "";

    data.items.forEach(item => {
      addItem(item.name, item.price);
    });

    calculateTotal();

    window.scrollTo(0, 0);
  });
}


// 💾 SAVE
function saveBill() {
  const imageUrl = document.getElementById("imageUrl").value;
  const date = document.getElementById("selectedDate").value;

  const names = document.querySelectorAll(".item-name");
  const prices = document.querySelectorAll(".item-price");

  let items = [];
  let total = 0;

  for (let i = 0; i < names.length; i++) {
    const name = names[i].value;
    const price = Number(prices[i].value);

    if (name && price) {
      items.push({ name, price });
      total += price;
    }
  }

  if (editingId) {
    db.collection("bills").doc(editingId).update({
      imageUrl,
      items,
      total
    }).then(() => {
      editingId = null;
      clearForm();
    });

  } else {
    db.collection("bills").add({
      date,
      items,
      total,
      imageUrl
    }).then(() => {
      clearForm();
    });
  }
}


// 🧹 CLEAR FORM
function clearForm() {
  document.getElementById("imageUrl").value = "";
  document.getElementById("itemsContainer").innerHTML = "";
  document.getElementById("totalAmount").innerText = "0";
}


// 👑 OWNER PAGE
function showOwnerPage() {
  document.getElementById("app").innerHTML = `
    <h2>Owner Dashboard</h2>

    <div class="date-row">
      <input type="date" id="date" onchange="loadBills()">
    </div>

    <div id="list"></div>

    <button onclick="logout()">Logout</button>
  `;
}


// 📊 OWNER LOAD
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

        let itemsHtml = "";
        data.items.forEach(item => {
          itemsHtml += `<p>${item.name} - ₹${item.price}</p>`;
        });

        html += `
          <div class="bill-card">
            <img src="${data.imageUrl}">
            ${itemsHtml}
            <p><strong>Total:</strong> ₹${data.total}</p>
          </div>
        `;
      });

      html += `<div class="total-box">Daily Total: ₹${total}</div>`;

      document.getElementById("list").innerHTML = html;
    });
}


// 🚪 LOGOUT
function logout() {
  localStorage.removeItem("role");
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("app").innerHTML = "";
}


// 🔄 AUTO LOGIN
window.onload = function () {
  if (localStorage.getItem("role")) {
    loadApp();
  }
};
