// Firebase إعداد
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";
import {
  getDatabase,
  ref,
  onValue,
  set
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBk1rSF0rrV-UAv09Zls-KlZuheW6bCW3o",
  authDomain: "alumni-ib.firebaseapp.com",
  databaseURL: "https://alumni-ib-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "alumni-ib",
  storageBucket: "alumni-ib.appspot.com",
  messagingSenderId: "390800579797",
  appId: "1:390800579797:web:71e797973aa3932a4bd65c",
  measurementId: "G-E7K0288XZM"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

window.firebaseDatabase = {
  db,
  ref: (path) => ref(db, path),
  onValue,
  set
};

// الكود الرئيسي لتطبيق إدارة أماكن العمل
let workplaces = {};
let currentWorkplace = null;
let currentDepartment = null;

function loadData() {
  const dbRef = window.firebaseDatabase.ref("workplaces");
  window.firebaseDatabase.onValue(dbRef, (snapshot) => {
    workplaces = snapshot.val() || {};
    updateUI();
  });
}

function saveData() {
  window.firebaseDatabase
    .set(window.firebaseDatabase.ref("workplaces"), workplaces)
    .then(() => console.log("تم الحفظ بنجاح"))
    .catch((error) => {
      console.error("خطأ في الحفظ:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    });
}

function updateUI() {
  searchWorkplace();
  if (currentWorkplace) showDepartments(currentWorkplace);
  if (currentDepartment) showEmployees(currentWorkplace, currentDepartment);
}

function searchWorkplace() {
  let query = document.getElementById("search").value.toLowerCase();
  let resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  for (let key in workplaces) {
    if (
      query === "" ||
      key.includes(query) ||
      workplaces[key].name.toLowerCase().includes(query)
    ) {
      resultsDiv.innerHTML += `
        <div class="workplace-item" onclick="showDepartments('${key}')">
          <span>${workplaces[key].name}</span>
          <button onclick="event.stopPropagation(); deleteWorkplace('${key}')">حذف</button>
        </div>`;
    }
  }

  if (resultsDiv.innerHTML === "") {
    resultsDiv.innerHTML = "<p>لا توجد نتائج</p>";
  }

  document.getElementById("results").style.display = "block";
  document.getElementById("department-details").style.display = "none";
  document.getElementById("employee-details").style.display = "none";
}

window.showDepartments = function (workplaceKey) {
  currentWorkplace = workplaceKey;
  currentDepartment = null;
  const workplace = workplaces[workplaceKey];
  const departmentList = document.getElementById("department-list");

  document.getElementById("department-name").innerText = workplace.name;
  departmentList.innerHTML = "";

  if (workplace.departments) {
    for (let key in workplace.departments) {
      departmentList.innerHTML += `
        <li onclick="showEmployees('${workplaceKey}', '${key}')">
          <span>${workplace.departments[key].name}</span>
          <button onclick="event.stopPropagation(); deleteDepartment('${key}')">حذف</button>
        </li>`;
    }
  }

  document.getElementById("results").style.display = "none";
  document.getElementById("department-details").style.display = "block";
  document.getElementById("employee-details").style.display = "none";
};

window.showEmployees = function (workplaceKey, departmentKey) {
  currentDepartment = departmentKey;
  const department = workplaces[workplaceKey].departments[departmentKey];
  const employeeList = document.getElementById("employee-list");

  document.getElementById("employee-department-name").innerText = department.name;
  employeeList.innerHTML = "";

  department.employees?.forEach((employee, index) => {
    employeeList.innerHTML += `
      <li>
        <span>${employee.name} - ${employee.telefonNr}</span>
        <button onclick="deleteEmployee(${index})">حذف</button>
      </li>`;
  });

  document.getElementById("department-details").style.display = "none";
  document.getElementById("employee-details").style.display = "block";
};

window.deleteWorkplace = function (key) {
  if (confirm(`حذف ${workplaces[key].name}؟`)) {
    delete workplaces[key];
    currentWorkplace = null;
    currentDepartment = null;
    saveData();
    searchWorkplace();
  }
};

window.deleteDepartment = function (key) {
  const workplace = workplaces[currentWorkplace];
  if (confirm(`حذف القسم ${workplace.departments[key].name}؟`)) {
    delete workplace.departments[key];
    currentDepartment = null;
    saveData();
    showDepartments(currentWorkplace);
  }
};

window.deleteEmployee = function (index) {
  const employees = workplaces[currentWorkplace].departments[currentDepartment].employees;
  if (confirm(`حذف الموظف ${employees[index].name}؟`)) {
    employees.splice(index, 1);
    saveData();
    showEmployees(currentWorkplace, currentDepartment);
  }
};

function showAddWorkplaceForm() {
  document.getElementById("add-workplace-form").style.display = "flex";
}

function addWorkplace() {
  const nameInput = document.getElementById("new-workplace-name");
  const name = nameInput.value.trim();
  if (!name) return alert("الرجاء إدخال اسم مكان العمل");

  const key = name.toLowerCase().replace(/\s+/g, "-");
  if (workplaces[key]) return alert("مكان العمل موجود بالفعل!");

  workplaces[key] = { name, departments: {} };
  saveData();
  hideAddForms();
  nameInput.value = "";
  currentWorkplace = key;
  showDepartments(key);
}

function showAddDepartmentForm() {
  if (!currentWorkplace) return alert("اختر مكان العمل أولاً.");
  document.getElementById("add-department-form").style.display = "flex";
}

function addDepartment() {
  const input = document.getElementById("new-department-name");
  const name = input.value.trim();
  if (!name) return alert("يرجى إدخال اسم القسم");

  const workplace = workplaces[currentWorkplace];
  if (!workplace.departments) workplace.departments = {};

  const key = name.toLowerCase().replace(/\s+/g, "-");
  if (workplace.departments[key]) return alert("القسم موجود بالفعل!");

  workplace.departments[key] = { name, employees: [] };
  saveData();
  hideAddForms();
  input.value = "";
  showDepartments(currentWorkplace);
}

function showAddEmployeeForm() {
  if (!currentDepartment) return alert("اختر قسماً أولاً.");
  document.getElementById("add-employee-form").style.display = "flex";
}

function addEmployee() {
  const name = document.getElementById("new-employee-name").value.trim();
  const phone = document.getElementById("new-employee-phone").value.trim();
  if (!name || !phone) return alert("يرجى إدخال الاسم ورقم الهاتف");

  const dept = workplaces[currentWorkplace].departments[currentDepartment];
  dept.employees.push({ name, telefonNr: phone });
  saveData();
  hideAddForms();
  document.getElementById("new-employee-name").value = "";
  document.getElementById("new-employee-phone").value = "";
  showEmployees(currentWorkplace, currentDepartment);
}

function hideAddForms() {
  document.querySelectorAll(".modal").forEach((el) => (el.style.display = "none"));
}

window.onload = function () {
  document.getElementById("search").addEventListener("input", searchWorkplace);
  document.getElementById("add-workplace-btn").addEventListener("click", showAddWorkplaceForm);
  document.getElementById("confirm-add-workplace").addEventListener("click", addWorkplace);
  document.getElementById("add-department-btn").addEventListener("click", showAddDepartmentForm);
  document.getElementById("confirm-add-department").addEventListener("click", addDepartment);
  document.getElementById("add-employee-btn").addEventListener("click", showAddEmployeeForm);
  document.getElementById("confirm-add-employee").addEventListener("click", addEmployee);
  document.querySelectorAll(".cancel-btn").forEach((btn) =>
    btn.addEventListener("click", hideAddForms)
  );

  loadData();
};
