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
          <button onclick="event.stopPropagation(); deleteWorkplace('${key}')">حذف</button>
        </div>`;
    }
  });

  if (resultsDiv.innerHTML === "") {
    resultsDiv.innerHTML = "<p>لا توجد نتائج</p>";
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
        <button onclick="event.stopPropagation(); deleteDepartment('${key}')">حذف</button>
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
        <button onclick="deleteEmployee(${index})">حذف</button>
      </li>`;
  });

  toggleView("employee-details");
}

// إظهار نماذج الإضافة
function showAddWorkplaceForm() {
  document.getElementById("add-workplace-form").style.display = "flex";
}

function showAddDepartmentForm() {
  if (!currentWorkplace) return alert("يرجى اختيار مكان العمل أولاً.");
  document.getElementById("add-department-form").style.display = "flex";
}

function showAddEmployeeForm() {
  if (!currentWorkplace || !currentDepartment) return alert("يرجى اختيار القسم أولاً.");
  document.getElementById("add-employee-form").style.display = "flex";
}

// إضافة البيانات
function addWorkplace() {
  const nameInput = document.getElementById("new-workplace-name");
  const name = nameInput.value.trim();

  if (!name) return alert("الرجاء إدخال اسم مكان العمل");

  const key = name.toLowerCase().replace(/\s+/g, "-");

  if (workplaces[key]) return alert("مكان العمل موجود بالفعل!");

  workplaces[key] = { name, departments: {} };

  saveData();
  nameInput.value = "";
  hideAddForms();

  currentWorkplace = key;
  showDepartments(key);
  alert("تمت الإضافة بنجاح!");
}

function addDepartment() {
  const nameInput = document.getElementById("new-department-name");
  const name = nameInput.value.trim();

  if (!name) return alert("يرجى إدخال اسم القسم");

  const workplace = workplaces[currentWorkplace];
  const key = name.toLowerCase().replace(/\s+/g, "-");

  if (workplace.departments[key]) return alert("القسم موجود بالفعل!");

  workplace.departments[key] = { name, employees: [] };

  saveData();
  nameInput.value = "";
  hideAddForms();
  showDepartments(currentWorkplace);
  alert("تمت إضافة القسم بنجاح!");
}

function addEmployee() {
  const nameInput = document.getElementById("new-employee-name");
  const phoneInput = document.getElementById("new-employee-phone");

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!name || !phone) return alert("يرجى إدخال اسم الموظف ورقم الهاتف");

  const department = workplaces[currentWorkplace].departments[currentDepartment];
  department.employees ||= [];

  department.employees.push({ name, telefonNr: phone });

  saveData();
  nameInput.value = "";
  phoneInput.value = "";
  hideAddForms();
  showEmployees(currentWorkplace, currentDepartment);
  alert("تمت إضافة الموظف بنجاح!");
}

// حذف البيانات
function deleteWorkplace(key) {
  if (!confirm(`حذف ${workplaces[key].name}؟`)) return;

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
  if (!confirm(`حذف القسم ${department.name}؟`)) return;

  delete workplaces[currentWorkplace].departments[key];
  currentDepartment = null;

  saveData();
  showDepartments(currentWorkplace);
}

function deleteEmployee(index) {
  const employees = workplaces[currentWorkplace]?.departments[currentDepartment]?.employees;
  if (!employees) return;

  if (!confirm(`حذف الموظف ${employees[index].name}؟`)) return;

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
