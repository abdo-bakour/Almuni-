let workplaces = {};
let currentWorkplace = null;
let currentDepartment = null;

function loadData() {
    const dbRef = window.firebaseDatabase.ref('workplaces');

    window.firebaseDatabase.onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        workplaces = data || {
            "karl-olga-krankenhaus": {
                name: "Karl-Olga-Krankenhaus",
                departments: {
                    "c5.2": {
                        name: "C5.2",
                        employees: [
                            { name: "Abdullah", telefonNr: "0155555555" },
                            { name: "Ali", telefonNr: "0155555556" }
                        ]
                    }
                }
            }
        };
        updateUI();
    });
}

function saveData() {
    window.firebaseDatabase.set(window.firebaseDatabase.ref('workplaces'), workplaces)
        .then(() => console.log("تم الحفظ بنجاح"))
        .catch(error => {
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
        if (query === "" || key.includes(query) || workplaces[key].name.toLowerCase().includes(query)) {
            resultsDiv.innerHTML += `
                <div class="workplace-item" onclick="showDepartments('${key}')">
                    <span>${workplaces[key].name}</span>
                    <button onclick="event.stopPropagation(); deleteWorkplace('${key}')">حذف</button>
                </div>
            `;
        }
    }

    if (resultsDiv.innerHTML === "") {
        resultsDiv.innerHTML = "<p>لا توجد نتائج</p>";
    }

    document.getElementById("results").style.display = "block";
    document.getElementById("department-details").style.display = "none";
    document.getElementById("employee-details").style.display = "none";
}

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
            </li>
        `;
    }

    document.getElementById("results").style.display = "none";
    departmentDetails.style.display = "block";
    document.getElementById("employee-details").style.display = "none";
}

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
            </li>
        `;
    });

    document.getElementById("department-details").style.display = "none";
    employeeDetails.style.display = "block";
}

function showAddWorkplaceForm() {
    document.getElementById("add-workplace-form").style.display = "flex";
}

function addWorkplace() {
    const nameInput = document.getElementById("new-workplace-name");
    const name = nameInput.value.trim();

    if (!name) return alert("الرجاء إدخال اسم مكان العمل");

    const key = name.toLowerCase().replace(/\s+/g, '-');

    if (workplaces[key]) return alert("مكان العمل موجود بالفعل!");

    workplaces[key] = {
        name,
        departments: {}
    };

    saveData();
    hideAddForms();
    nameInput.value = "";
    searchWorkplace();
    alert("تمت الإضافة بنجاح!");
}

function showAddDepartmentForm() {
    if (!currentWorkplace) return alert("يرجى اختيار مكان العمل أولاً.");
    document.getElementById("add-department-form").style.display = "flex";
}

function addDepartment() {
    const input = document.getElementById("new-department-name");
    const name = input.value.trim();

    if (!name) return alert("يرجى إدخال اسم القسم");

    const key = name.toLowerCase().replace(/\s+/g, '-');
    const workplace = workplaces[currentWorkplace];

    if (workplace.departments[key]) return alert("القسم موجود بالفعل!");

    workplace.departments[key] = {
        name,
        employees: []
    };

    saveData();
    hideAddForms();
    input.value = "";
    showDepartments(currentWorkplace);
    alert("تمت إضافة القسم بنجاح!");
}

function showAddEmployeeForm() {
    if (!currentWorkplace || !currentDepartment) return alert("يرجى اختيار القسم أولاً.");
    document.getElementById("add-employee-form").style.display = "flex";
}

function addEmployee() {
    const nameInput = document.getElementById("new-employee-name");
    const phoneInput = document.getElementById("new-employee-phone");
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) return alert("يرجى إدخال اسم الموظف ورقم الهاتف");

    const department = workplaces[currentWorkplace].departments[currentDepartment];
    department.employees.push({ name, telefonNr: phone });

    saveData();
    hideAddForms();
    nameInput.value = "";
    phoneInput.value = "";
    showEmployees(currentWorkplace, currentDepartment);
    alert("تمت إضافة الموظف بنجاح!");
}

function deleteWorkplace(key) {
    if (confirm(`حذف ${workplaces[key].name}؟`)) {
        delete workplaces[key];
        currentWorkplace = null;
        currentDepartment = null;
        saveData();
        searchWorkplace();
    }
}

function deleteDepartment(key) {
    const workplace = workplaces[currentWorkplace];
    if (confirm(`حذف القسم ${workplace.departments[key].name}؟`)) {
        delete workplace.departments[key];
        currentDepartment = null;
        saveData();
        showDepartments(currentWorkplace);
    }
}

function deleteEmployee(index) {
    const employees = workplaces[currentWorkplace].departments[currentDepartment].employees;
    if (confirm(`حذف الموظف ${employees[index].name}؟`)) {
        employees.splice(index, 1);
        saveData();
        showEmployees(currentWorkplace, currentDepartment);
    }
}

function hideAddForms() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = "none";
    });
}

window.onload = function() {
    document.getElementById("search").addEventListener("input", searchWorkplace);
    document.getElementById("add-workplace-btn").addEventListener("click", showAddWorkplaceForm);
    document.getElementById("confirm-add-workplace").addEventListener("click", addWorkplace);
    document.getElementById("add-department-btn").addEventListener("click", showAddDepartmentForm);
    document.getElementById("confirm-add-department").addEventListener("click", addDepartment);
    document.getElementById("add-employee-btn").addEventListener("click", showAddEmployeeForm);
    document.getElementById("confirm-add-employee").addEventListener("click", addEmployee);
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', hideAddForms);
    });

    loadData();
};
