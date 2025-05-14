// متغيرات التطبيق
let workplaces = {};
let currentWorkplace = null;
let currentDepartment = null;

// تحميل البيانات من Firebase
function loadData() {
  const dbRef = window.firebaseDatabase.ref("workplaces");
  window.firebaseDatabase.onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    workplaces = data || {};
    updateUI();
  });
}

// حفظ البيانات على Firebase
function saveData() {
  window.firebaseDatabase
    .set(window.firebaseDatabase.ref("workplaces"), workplaces)
    .then(() => console.log("تم الحفظ بنجاح"))
    .catch((error) => {
      console.error("خطأ في الحفظ:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
    });
}

// تحديث واجهة المستخدم الرئيسية (أماكن العمل)
function updateUI() {
  searchWorkplace();
  if (currentWorkplace) showDepartments(currentWorkplace);
  if (currentDepartment) showEmployees(currentWorkplace, currentDepartment);
}

// عرض أماكن العمل والبحث عنها
function searchWorkplace() {
  let query = document.getElementById("search").value.toLowerCase();
  let resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (query === "") {
    for (let key in workplaces) {
      resultsDiv.innerHTML += `
        <div class="workplace-item" onclick="showDepartments('${key}')">
          <span>${workplaces[key].name}</span>
          <button onclick="event.stopPropagation(); deleteWorkplace('${key}')">حذف</button>
        </div>`;
    }
  } else {
    let found = false;
    for (let key in workplaces) {
      if (
        key.includes(query) ||
        workplaces[key].name.toLowerCase().includes(query)
      ) {
        found = true;
        resultsDiv.innerHTML += `
          <div class="workplace-item" onclick="showDepartments('${key}')">
            <span>${workplaces[key].name}</span>
            <button onclick="event.stopPropagation(); deleteWorkplace('${key}')">حذف</button>
          </div>`;
      }
    }
    if (!found) {
      resultsDiv.innerHTML = "<p>لا توجد نتائج</p>";
    }
  }
  document.getElementById("results").style.display = "block";
  document.getElementById("department-details").style.display = "none";
  document.getElementById("employee-details").style.display = "none";
}

// عرض الأقسام لمكان العمل المحدد
function showDepartments(workplaceKey) {
  currentWorkplace = workplaceKey;
  currentDepartment = null;
  let workplace = workplaces[workplaceKey];
  let departmentDetails = document.getElementById("department-details");
  let departmentList = document.getElementById("department-list");

  document.getElementById("department-name").innerText = workplace.name;
  departmentList.innerHTML = "";

  for (let key in workplace.departments) {
    departmentList.innerHTML += `
      <li onclick="showEmployees('${workplaceKey}', '${key}')">
        <span>${workplace.departments[key].name}</span>
        <button onclick="event.stopPropagation(); deleteDepartment('${key}')">حذف</button>
      </li>`;
  }

  document.getElementById("results").style.display = "none";
  departmentDetails.style.display = "block";
  document.getElementById("employee-details").style.display = "none";
}

// عرض الموظفين لقسم محدد
function showEmployees(workplaceKey, departmentKey) {
  currentDepartment = departmentKey;
  let department = workplaces[workplaceKey].departments[departmentKey];
  let employeeDetails = document.getElementById("employee-details");
  let employeeList = document.getElementById("employee-list");

  document.getElementById("employee-department-name").innerText = department.name;
  employeeList.innerHTML = "";

  department.employees.forEach((employee, index) => {
    employeeList.innerHTML += `
      <li>
        <span>${employee.name} - ${employee.telefonNr}</span>
        <button onclick="deleteEmployee(${index})">حذف</button>
      </li>`;
  });

  document.getElementById("department-details").style.display = "none";
  employeeDetails.style.display = "block";
}

// دوال الإضافة

function showAddWorkplaceForm() {
  document.getElementById("add-workplace-form").style.display = "flex";
}

function addWorkplace() {
  const nameInput = document.getElementById("new-workplace-name");
  const name = nameInput.value.trim();

  if (!name) {
    alert("الرجاء إدخال اسم مكان العمل");
    return;
  }

  const key = name.toLowerCase().replace(/\s+/g, "-");

  if (workplaces[key]) {
    alert("مكان العمل موجود بالفعل!");
    return;
  }

  workplaces[key] = {
    name: name,
    departments: {},
  };

  saveData();
  hideAddForms();
  nameInput.value = "";
  searchWorkplace();
  alert("تمت الإضافة بنجاح!");
}

function showAddDepartmentForm() {
  if (!currentWorkplace) {
    alert("يرجى اختيار مكان العمل أولاً.");
    return;
  }
  document.getElementById("add-department-form").style.display = "flex";
}

function addDepartment() {
  const departmentNameInput = document.getElementById("new-department-name");
  const departmentName = departmentNameInput.value.trim();

  if (!departmentName) {
    alert("يرجى إدخال اسم القسم");
    return;
  }

  const workplace = workplaces[currentWorkplace];
  const key = departmentName.toLowerCase().replace(/\s+/g, "-");

  if (workplace.departments[key]) {
    alert("القسم موجود بالفعل!");
    return;
  }

  workplace.departments[key] = {
    name: departmentName,
    employees: [],
  };

  saveData();
  hideAddForms();
  departmentNameInput.value = "";
  showDepartments(currentWorkplace);
  alert("تمت إضافة القسم بنجاح!");
}

function showAddEmployeeForm() {
  if (!currentWorkplace || !currentDepartment) {
    alert("يرجى اختيار القسم أولاً.");
    return;
  }
  document.getElementById("add-employee-form").style.display = "flex";
}

function addEmployee() {
  const employeeNameInput = document.getElementById("new-employee-name");
  const employeePhoneInput = document.getElementById("new-employee-phone");
  const name = employeeNameInput.value.trim();
  const phone = employeePhoneInput.value.trim();

  if (!name || !phone) {
    alert("يرجى إدخال اسم الموظف ورقم الهاتف");
    return;
  }

  const department =
    workplaces[currentWorkplace].departments[currentDepartment];
  department.employees.push({
    name: name,
    telefonNr: phone,
  });

  saveData();
  hideAddForms();
  employeeNameInput.value = "";
  employeePhoneInput.value = "";
  showEmployees(currentWorkplace, currentDepartment);
  alert("تمت إضافة الموظف بنجاح!");
}

// دوال الحذف

function deleteWorkplace(key) {
  if (confirm(`حذف ${workplaces[key].name}؟`)) {
    delete workplaces[key];
    currentWorkplace = null;
    currentDepartment = null;
    saveData();
    document.getElementById("results").style.display = "block";
    document.getElementById("department-details").style.display = "none";
    document.getElementById("employee-details").style.display = "none";
    searchWorkplace();
  }
}

function deleteDepartment(key) {
  if (!currentWorkplace) return;
  const workplace = workplaces[currentWorkplace];
  if (confirm(`حذف القسم ${workplace.departments[key].name}؟`)) {
    delete workplace.departments[key];
    currentDepartment = null;
    saveData();
    showDepartments(currentWorkplace);
  }
}

function deleteEmployee(index) {
  if (!currentWorkplace || !currentDepartment) return;
  const employees =
    workplaces[currentWorkplace].departments[currentDepartment].employees;
  if (confirm(`حذف الموظف ${employees[index].name}؟`)) {
    employees.splice(index, 1);
    saveData();
    showEmployees(currentWorkplace, currentDepartment);
  }
}

// إخفاء النماذج
function hideAddForms() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.style.display = "none";
  });
}

// التهيئة عند تحميل الصفحة
window.onload = function () {
  document.getElementById("search").addEventListener("input", searchWorkplace);
  document
    .getElementById("add-workplace-btn")
    .addEventListener("click", showAddWorkplaceForm);
  document
    .getElementById("confirm-add-workplace")
    .addEventListener("click", addWorkplace);

  document
    .getElementById("add-department-btn")
    .addEventListener("click", showAddDepartmentForm);
  document
    .getElementById("confirm-add-department")
    .addEventListener("click", addDepartment);

  document
    .getElementById("add-employee-btn")
    .addEventListener("click", showAddEmployeeForm);
  document
    .getElementById("confirm-add-employee")
    .addEventListener("click", addEmployee);

  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", hideAddForms);
  });

  loadData();
};
