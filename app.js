"use strict";

// -- إعداد معرف المستخدم --
const USER_ID_KEY = "billingAppUserId";
let userId = localStorage.getItem(USER_ID_KEY);
if (!userId) {
  userId = "user-" + Math.random().toString(36).slice(2, 10);
  localStorage.setItem(USER_ID_KEY, userId);
}

// -- مفاتيح التخزين --
const CLIENTS_KEY = `clients_${userId}`;

// -- العناصر الأساسية --
const screens = {
  home: document.getElementById("home-screen"),
  clients: document.getElementById("clients-screen"),
  clientDetails: document.getElementById("client-details-screen"),
  editClientName: document.getElementById("edit-client-name-screen"),
  editTransaction: document.getElementById("edit-transaction-screen"),
  addClient: document.getElementById("add-client-screen"),
  about: document.getElementById("about-screen"),
};

const navButtons = {
  home: document.getElementById("btn-home"),
  clients: document.getElementById("btn-clients"),
  about: document.getElementById("btn-about"),
};

const modalOverlay = document.getElementById("modal-overlay");
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");
const modalOkBtn = document.getElementById("modal-ok-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const loadingIndicator = document.getElementById("loading-indicator");

// -- بيانات --
let clients = []; // مصفوفة العملاء
let currentClientId = null; // العميل الحالي المعروض
let editTransactionId = null; // المعاملة التي نعدلها

// -- عناصر الشاشة الرئيسية --
const userIdDisplay = document.getElementById("user-id");
userIdDisplay.textContent = userId;

const transactionForm = document.getElementById("transaction-form");
const clientNameInput = document.getElementById("client-name");
const transactionDescInput = document.getElementById("transaction-desc");
const transactionAmountInput = document.getElementById("transaction-amount");
const transactionTypeInputs = document.getElementsByName("transaction-type");
const transactionNotesInput = document.getElementById("transaction-notes");
const clientsDatalist = document.getElementById("clients-list");

// -- شاشة العملاء --
const clientsListContainer = document.getElementById("clients-list-container");
const clientSearchInput = document.getElementById("client-search");
const addClientBtn = document.getElementById("add-client-btn");

// -- شاشة تفاصيل العميل --
const clientDetailsName = document.getElementById("client-details-name");
const backToClientsBtn = document.getElementById("back-to-clients");
const editClientNameBtn = document.getElementById("edit-client-name-btn");
const deleteClientBtn = document.getElementById("delete-client-btn");
const filterFromDateInput = document.getElementById("filter-from-date");
const filterToDateInput = document.getElementById("filter-to-date");
const filterApplyBtn = document.getElementById("filter-apply-btn");
const filterClearBtn = document.getElementById("filter-clear-btn");
const transactionsList = document.getElementById("transactions-list");
const addTransactionForm = document.getElementById("add-transaction-to-client-form");
const transactionDescClientInput = document.getElementById("transaction-desc-client");
const transactionAmountClientInput = document.getElementById("transaction-amount-client");
const transactionTypeClientSelect = document.getElementById("transaction-type-client");
const transactionNotesClientInput = document.getElementById("transaction-notes-client");
const calculateTotalBtn = document.getElementById("calculate-total-btn");
const exportCsvBtn = document.getElementById("export-csv-btn");
const totalDebtDisplay = document.getElementById("total-debt-display");

// -- شاشة تعديل اسم العميل --
const editClientNameForm = document.getElementById("edit-client-name-form");
const editClientNameInput = document.getElementById("edit-client-name-input");
const cancelEditClientNameBtn = document.getElementById("cancel-edit-client-name");

// -- شاشة تعديل المعاملة --
const editTransactionForm = document.getElementById("edit-transaction-form");
const editTransactionDescInput = document.getElementById("edit-transaction-desc");
const editTransactionAmountInput = document.getElementById("edit-transaction-amount");
const editTransactionTypeSelect = document.getElementById("edit-transaction-type");
const editTransactionNotesInput = document.getElementById("edit-transaction-notes");
const cancelEditTransactionBtn = document.getElementById("cancel-edit-transaction");

// -- شاشة إضافة عميل جديد --
const addClientScreen = document.getElementById("add-client-screen");
const addClientForm = document.getElementById("add-client-form");
const newClientNameInput = document.getElementById("new-client-name");
const newClientInitialDebtInput = document.getElementById("new-client-initial-debt");
const newClientInitialDescInput = document.getElementById("new-client-initial-desc");
const cancelAddClientBtn = document.getElementById("cancel-add-client");

// -- شاشة عن التطبيق --
const aboutScreen = document.getElementById("about-screen");
const closeAboutBtn = document.getElementById("close-about-btn");

// -- التنقل بين الشاشات --
function showScreen(name) {
  Object.keys(screens).forEach((key) => {
    screens[key].classList.toggle("active", key === name);
  });
  // تنشيط زر القائمة المناسب
  Object.keys(navButtons).forEach((key) => {
    navButtons[key].classList.toggle("active", key === name);
  });

  if(name === "clients"){
    renderClientsList();
  }
  if(name === "clientDetails" && currentClientId){
    renderClientDetails(currentClientId);
  }
  if(name === "home") {
    transactionForm.reset();
    updateClientsDatalist();
  }
}

// -- تحميل وحفظ البيانات --
function loadClients() {
  const data = localStorage.getItem(CLIENTS_KEY);
  if(data){
    try{
      clients = JSON.parse(data);
    }catch{
      clients = [];
    }
  }
}

function saveClients() {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

// -- تحديث قائمة العملاء في datalist شاشة الرئيسية --
function updateClientsDatalist() {
  clientsDatalist.innerHTML = "";
  clients.forEach(client => {
    const option = document.createElement("option");
    option.value = client.name;
    clientsDatalist.appendChild(option);
  });
}

// -- إضافة معاملة في الشاشة الرئيسية --
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = clientNameInput.value.trim();
  const desc = transactionDescInput.value.trim();
  const amount = parseFloat(transactionAmountInput.value);
  const type = [...transactionTypeInputs].find(input => input.checked).value;
  const notes = transactionNotesInput.value.trim();

  if(!name || !desc || isNaN(amount) || amount <= 0){
    showModal("يرجى إدخال جميع البيانات بشكل صحيح.");
    return;
  }

  // البحث عن العميل
  let client = clients.find(c => c.name === name);
  if(!client){
    // إنشاء عميل جديد
    client = {
      id: "client-" + Date.now() + "-" + Math.floor(Math.random()*1000),
      name: name,
      transactions: [],
    };
    clients.push(client);
  }

  // إضافة المعاملة
  const transaction = {
    id: "txn-" + Date.now() + "-" + Math.floor(Math.random()*1000),
    desc,
    amount,
    type,
    notes,
    date: new Date().toISOString(),
  };
  client.transactions.push(transaction);

  saveClients();
  showModal("تم تسجيل المعاملة بنجاح.");
  transactionForm.reset();
  updateClientsDatalist();
});

// -- عرض قائمة العملاء --
function renderClientsList(filter="") {
  clientsListContainer.innerHTML = "";

  let filteredClients = clients;
  if(filter){
    const f = filter.trim().toLowerCase();
    filteredClients = clients.filter(c => c.name.toLowerCase().includes(f));
  }

  if(filteredClients.length === 0){
    const li = document.createElement("li");
    li.textContent = "لا يوجد عملاء مطابقين.";
    clientsListContainer.appendChild(li);
    return;
  }

  filteredClients.forEach(client => {
    const li = document.createElement("li");
    li.dataset.clientId = client.id;

    const spanName = document.createElement("span");
    spanName.className = "client-name";
    spanName.textContent = client.name;
    li.appendChild(spanName);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-client";
    deleteBtn.title = "حذف العميل";
    deleteBtn.innerHTML = "🗑️";
    li.appendChild(deleteBtn);

    clientsListContainer.appendChild(li);

    // النقر على اسم العميل للانتقال لتفاصيله
    spanName.addEventListener("click", () => {
      currentClientId = client.id;
      showScreen("clientDetails");
    });

    // حذف العميل مع التأكيد
    deleteBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      confirmModal(`هل أنت متأكد من حذف العميل "${client.name}" وكل معاملاته؟`, () => {
        clients = clients.filter(c => c.id !== client.id);
        saveClients();
        renderClientsList(clientSearchInput.value);
        if(currentClientId === client.id){
          currentClientId = null;
          showScreen("clients");
        }
      });
    });
  });
}

// -- البحث في العملاء --
clientSearchInput.addEventListener("input", () => {
  renderClientsList(clientSearchInput.value);
});

// -- إضافة عميل جديد من شاشة قائمة العملاء --
addClientBtn.addEventListener("click", () => {
  addClientForm.reset();
  showScreen("addClient");
});

// -- إلغاء إضافة عميل جديد --
cancelAddClientBtn.addEventListener("click", () => {
  showScreen("clients");
});

// -- معالجة إضافة عميل جديد --
addClientForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = newClientNameInput.value.trim();
  if(!name){
    showModal("يرجى إدخال اسم العميل.");
    return;
  }
  if(clients.find(c => c.name === name)){
    showModal("هذا الاسم موجود بالفعل. يرجى اختيار اسم آخر.");
    return;
  }

  const initialDebt = parseFloat(newClientInitialDebtInput.value) || 0;
  const initialDesc = newClientInitialDescInput.value.trim();

  const newClient = {
    id: "client-" + Date.now() + "-" + Math.floor(Math.random()*1000),
    name,
    transactions: [],
  };

  if(initialDebt > 0){
    newClient.transactions.push({
      id: "txn-" + Date.now() + "-" + Math.floor(Math.random()*1000),
      desc: initialDesc || "دين مبدئي",
      amount: initialDebt,
      type: "purchase",
      notes: "",
      date: new Date().toISOString(),
    });
  }

  clients.push(newClient);
  saveClients();
  showModal("تم إضافة العميل بنجاح.");
  showScreen("clients");
  renderClientsList();
});

// -- عرض تفاصيل العميل --
function renderClientDetails(clientId, filterFrom=null, filterTo=null) {
  const client = clients.find(c => c.id === clientId);
  if(!client) {
    showModal("العميل غير موجود.");
    showScreen("clients");
    return;
  }

  clientDetailsName.textContent = client.name;

  // فلترة المعاملات
  let txns = client.transactions.slice();
  if(filterFrom) {
    const fromDate = new Date(filterFrom);
    txns = txns.filter(t => new Date(t.date) >= fromDate);
  }
  if(filterTo) {
    const toDate = new Date(filterTo);
    txns = txns.filter(t => new Date(t.date) <= toDate);
  }

  // مسح القائمة ثم عرض المعاملات
  transactionsList.innerHTML = "";

  if(txns.length === 0){
    const li = document.createElement("li");
    li.textContent = "لا توجد معاملات في النطاق الزمني المحدد.";
    transactionsList.appendChild(li);
  } else {
    txns.sort((a,b) => new Date(b.date) - new Date(a.date));
    txns.forEach(txn => {
      const li = document.createElement("li");

      const descSpan = document.createElement("span");
      descSpan.className = "transaction-desc";
      descSpan.textContent = txn.desc;

      const dateSpan = document.createElement("span");
      dateSpan.className = "transaction-date";
      dateSpan.textContent = new Date(txn.date).toLocaleDateString("ar-EG");

      const amountSpan = document.createElement("span");
      amountSpan.className = "transaction-amount " + (txn.type === "purchase" ? "transaction-type-purchase" : "transaction-type-payment");
      amountSpan.textContent = (txn.type === "payment" ? "-" : "+") + txn.amount.toFixed(2);

      const notesSpan = document.createElement("span");
      notesSpan.className = "transaction-notes";
      notesSpan.textContent = txn.notes || "";

      const actionsSpan = document.createElement("span");
      actionsSpan.className = "transaction-actions";

      // زر تعديل
      const editBtn = document.createElement("button");
      editBtn.title = "تعديل المعاملة";
      editBtn.innerHTML = "✏️";
      editBtn.addEventListener("click", () => {
        openEditTransaction(txn);
      });

      // زر حذف
      const deleteBtn = document.createElement("button");
      deleteBtn.title = "حذف المعاملة";
      deleteBtn.innerHTML = "🗑️";
      deleteBtn.addEventListener("click", () => {
        confirmModal("هل أنت متأكد من حذف هذه المعاملة؟", () => {
          client.transactions = client.transactions.filter(t => t.id !== txn.id);
          saveClients();
          renderClientDetails(clientId, filterFromDateInput.value || null, filterToDateInput.value || null);
        });
      });

      actionsSpan.appendChild(editBtn);
      actionsSpan.appendChild(deleteBtn);

      li.appendChild(descSpan);
      li.appendChild(dateSpan);
      li.appendChild(amountSpan);
      li.appendChild(notesSpan);
      li.appendChild(actionsSpan);

      transactionsList.appendChild(li);
    });
  }
}

// -- العودة لقائمة العملاء من تفاصيل العميل --
backToClientsBtn.addEventListener("click", () => {
  currentClientId = null;
  showScreen("clients");
