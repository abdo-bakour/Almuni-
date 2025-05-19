// تعريف المتغيرات الأساسية
let workplaces = {};
let currentWorkplace = null;
let currentDepartment = null;

// تحميل البيانات من Firebase
function loadData() {
  const dbRef = window.firebaseDatabase.ref("workplaces");
  window.firebaseDatabase.onValue(dbRef, (snapshot) => {
    workplaces = snapshot.val() || {};
    updateUI();
  });
}

// حفظ البيانات على Firebase
function saveData() {
  const dbRef = window.firebaseDatabase.ref("workplaces");
  window.firebaseDatabase
    .set(dbRef, workplaces)
    .then(() => console.log("تم الحفظ بنجاح"))
    .catch((error) => {
      console.error("خطأ في الحفظ:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    });
}

// تحديث واجهة المستخدم الرئيسية
function updateUI() {
  searchWorkplace();
  if (currentWorkplace) showDepartments(currentWorkplace);
  if (currentDepartment) showEmployees(currentWorkplace, currentDepartment);
}

// البحث وعرض أماكن العمل
function searchWorkplace() {
  const query = document.getElementById("search").value.toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  Object.entries(workplaces).forEach(([key, workplace]) => {
    if (
      query === "" ||
      key.includes(query) ||
      workplace.name.toLowerCase().includes(query)
    ) {
      resultsDiv.innerHTML += `
        <div class="workplace-item" onclick="showDepartments('${key}')">
          <span>${workplace.name}</span>
          <button onclick="event.stopPropagation(); deleteWorkplace('${key}')">Löschen</button>
        </div>`;
    }
  });

  if (resultsDiv.innerHTML === "") {
    resultsDiv.innerHTML = "<p>Keine Ergebnisse gefunden</p>";
  }

  toggleView("results");
}

// عرض الأقسام لمكان عمل معين
function showDepartments(workplaceKey) {
  currentWorkplace = workplaceKey;
  currentDepartment = null;

  const workplace = workplaces[workplaceKey];
  workplace.departments ||= {};

  document.getElementById("department-name").innerText = workplace.name;

  const departmentList = document.getElementById("department-list");
  departmentList.innerHTML = "";

  Object.entries(workplace.departments).forEach(([key, department]) => {
    departmentList.innerHTML += `
      <li onclick="showEmployees('${workplaceKey}', '${key}')">
        <span>${department.name}</span>
        <button onclick="event.stopPropagation(); deleteDepartment('${key}')">Löschen</button>
      </li>`;
  });

  toggleView("department-details");
}

// عرض الموظفين لقسم معين
function showEmployees(workplaceKey, departmentKey) {
  currentDepartment = departmentKey;

  const department = workplaces[workplaceKey].departments[departmentKey];
  const employeeList = document.getElementById("employee-list");
  employeeList.innerHTML = "";

  document.getElementById("employee-department-name").innerText = department.name;

  department.employees?.forEach((employee, index) => {
    employeeList.innerHTML += `
      <li>
        <span>${employee.name} - ${employee.telefonNr}</span>
        <button onclick="deleteEmployee(${index})">Löschen</button>
      </li>`;
  });

  toggleView("employee-details");
}

// إظهار نماذج الإضافة
function showAddWorkplaceForm() {
  document.getElementById("add-workplace-form").style.display = "flex";
}

function showAddDepartmentForm() {
  if (!currentWorkplace) return alert("Bitte zuerst einen Arbeitsplatz auswählen.");
  document.getElementById("add-department-form").style.display = "flex";
}

function showAddEmployeeForm() {
  if (!currentWorkplace || !currentDepartment) return alert("Bitte zuerst eine Abteilung auswählen.");
  document.getElementById("add-employee-form").style.display = "flex";
}

// إضافة البيانات
function addWorkplace() {
  const nameInput = document.getElementById("new-workplace-name");
  const name = nameInput.value.trim();

  if (!name) return alert("Bitte geben Sie den Namen des Arbeitsplatzes ein.");

  const key = name.toLowerCase().replace(/\s+/g, "-");

  if (workplaces[key]) return alert("Arbeitsplatz existiert bereits!");

  workplaces[key] = { name, departments: {} };

  saveData();
  nameInput.value = "";
  hideAddForms();

  currentWorkplace = key;
  showDepartments(key);
  alert("Erfolgreich hinzugefügt!");
}

function addDepartment() {
  const nameInput = document.getElementById("new-department-name");
  const name = nameInput.value.trim();

  if (!name) return alert("Bitte geben Sie den Namen der Abteilung ein.");

  const workplace = workplaces[currentWorkplace];
  const key = name.toLowerCase().replace(/\s+/g, "-");

  if (workplace.departments[key]) return alert("Abteilung existiert bereits!");

  workplace.departments[key] = { name, employees: [] };

  saveData();
  nameInput.value = "";
  hideAddForms();
  showDepartments(currentWorkplace);
  alert("Abteilung erfolgreich hinzugefügt!");
}

function addEmployee() {
  const nameInput = document.getElementById("new-employee-name");
  const phoneInput = document.getElementById("new-employee-phone");

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!name || !phone) return alert("Bitte geben Sie Name und Telefonnummer des Mitarbeiters ein.");

  const department = workplaces[currentWorkplace].departments[currentDepartment];
  department.employees ||= [];

  department.employees.push({ name, telefonNr: phone });

  saveData();
  nameInput.value = "";
  phoneInput.value = "";
  hideAddForms();
  showEmployees(currentWorkplace, currentDepartment);
  alert("Mitarbeiter erfolgreich hinzugefügt!");
}

// حذف البيانات
function deleteWorkplace(key) {
  if (!confirm(`Arbeitsplatz ${workplaces[key].name} löschen?`)) return;

  delete workplaces[key];
  currentWorkplace = null;
  currentDepartment = null;

  saveData();
  toggleView("results");
  searchWorkplace();
}

function deleteDepartment(key) {
  if (!currentWorkplace) return;

  const department = workplaces[currentWorkplace].departments[key];
  if (!confirm(`Abteilung ${department.name} löschen?`)) return;

  delete workplaces[currentWorkplace].departments[key];
  currentDepartment = null;

  saveData();
  showDepartments(currentWorkplace);
}

function deleteEmployee(index) {
  const employees = workplaces[currentWorkplace]?.departments[currentDepartment]?.employees;
  if (!employees) return;

  if (!confirm(`Mitarbeiter ${employees[index].name} löschen?`)) return;

  employees.splice(index, 1);
  saveData();
  showEmployees(currentWorkplace, currentDepartment);
}

// إخفاء النماذج
function hideAddForms() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none";
  });
}

// تبديل عرض الأقسام
function toggleView(sectionId) {
  ["results", "department-details", "employee-details"].forEach((id) => {
    document.getElementById(id).style.display = id === sectionId ? "block" : "none";
  });
}

// تهيئة التطبيق عند التحميل
window.onload = function () {
  document.getElementById("search").addEventListener("input", searchWorkplace);

  document.getElementById("add-workplace-btn").addEventListener("click", showAddWorkplaceForm);
  document.getElementById("confirm-add-workplace").addEventListener("click", addWorkplace);

  document.getElementById("add-department-btn").addEventListener("click", showAddDepartmentForm);
  document.getElementById("confirm-add-department").addEventListener("click", addDepartment);

  document.getElementById("add-employee-btn").addEventListener("click", showAddEmployeeForm);
  document.getElementById("confirm-add-employee").addEventListener("click", addEmployee);

  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", hideAddForms);
  });

  loadData();
};
