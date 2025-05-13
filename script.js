// الوصول إلى دوال Firebase من window
const { db, ref, set, onValue } = window.firebaseDatabase;

// متغيرات التطبيق
let workplaces = {};
let currentWorkplace = null;
let currentDepartment = null;

// دالة جلب البيانات من Firebase
function loadData() {
    const dbRef = ref(db, 'workplaces');
    
    onValue(dbRef, (snapshot) => {
        workplaces = snapshot.val() || {
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
    }, {
        onlyOnce: false // لمراقبة التغييرات في الوقت الحقيقي
    });
}

// دالة حفظ البيانات في Firebase
function saveData() {
    set(ref(db, 'workplaces'), workplaces)
        .then(() => console.log("تم الحفظ بنجاح"))
        .catch(error => {
            console.error("خطأ في الحفظ:", error);
            alert("حدث خطأ أثناء حفظ البيانات");
        });
}

// تحديث واجهة المستخدم
function updateUI() {
    searchWorkplace();
    if (currentWorkplace) showDepartments(currentWorkplace);
    if (currentDepartment) showEmployees(currentWorkplace, currentDepartment);
}

// عرض أماكن العمل
function searchWorkplace() {
    let query = document.getElementById("search").value.toLowerCase();
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (query === "") {
        // عرض كل أماكن العمل إن لم يكن هناك بحث
        for (let key in workplaces) {
            resultsDiv.innerHTML += `
                <div class="workplace-item" onclick="showDepartments('${key}')">
                    <span>${workplaces[key].name}</span>
                    <button onclick="event.stopPropagation(); deleteWorkplace('${key}')">حذف</button>
                </div>
            `;
        }
    } else if (workplaces[query]) {
        // عرض نتائج البحث
        resultsDiv.innerHTML = `
            <div class="workplace-item" onclick="showDepartments('${query}')">
                <span>${workplaces[query].name}</span>
                <button onclick="event.stopPropagation(); deleteWorkplace('${query}')">حذف</button>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = "<p>لا توجد نتائج</p>";
    }
}

// عرض الأقسام
function showDepartments(workplaceKey) {
    currentWorkplace = workplaceKey;
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

// عرض الموظفين
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

// دوال الإضافة
function showAddWorkplaceForm() {
    document.getElementById("add-workplace-form").style.display = "block";
}

function showAddDepartmentForm() {
    document.getElementById("add-department-form").style.display = "block";
}

function showAddEmployeeForm() {
    document.getElementById("add-employee-form").style.display = "block";
}

function hideAddForms() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = "none";
    });
}

function addWorkplace() {
    const name = document.getElementById("new-workplace-name").value;
    if (name && !workplaces[name.toLowerCase()]) {
        workplaces[name.toLowerCase()] = {
            name: name,
            departments: {}
        };
        saveData();
        hideAddForms();
        searchWorkplace();
    }
}

function addDepartment() {
    const name = document.getElementById("new-department-name").value;
    if (name && currentWorkplace) {
        const key = name.toLowerCase().replace(/\s+/g, '-');
        workplaces[currentWorkplace].departments[key] = {
            name: name,
            employees: []
        };
        saveData();
        hideAddForms();
        showDepartments(currentWorkplace);
    }
}

function addEmployee() {
    const name = document.getElementById("new-employee-name").value;
    const phone = document.getElementById("new-employee-phone").value;
    if (name && phone && currentWorkplace && currentDepartment) {
        workplaces[currentWorkplace].departments[currentDepartment].employees.push({
            name: name,
            telefonNr: phone
        });
        saveData();
        hideAddForms();
        showEmployees(currentWorkplace, currentDepartment);
    }
}

// دوال الحذف
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
    if (confirm("حذف هذا القسم؟")) {
        delete workplaces[currentWorkplace].departments[key];
        currentDepartment = null;
        saveData();
        showDepartments(currentWorkplace);
    }
}

function deleteEmployee(index) {
    if (confirm("حذف هذا الموظف؟")) {
        workplaces[currentWorkplace].departments[currentDepartment].employees.splice(index, 1);
        saveData();
        showEmployees(currentWorkplace, currentDepartment);
    }
}

// تهيئة الصفحة عند التحميل
window.onload = function() {
    // تهيئة الأحداث
    document.getElementById("search").addEventListener("input", searchWorkplace);
    document.getElementById("add-workplace-btn").addEventListener("click", showAddWorkplaceForm);
    document.getElementById("add-department-btn").addEventListener("click", showAddDepartmentForm);
    document.getElementById("add-employee-btn").addEventListener("click", showAddEmployeeForm);
    document.getElementById("confirm-add-workplace").addEventListener("click", addWorkplace);
    document.getElementById("confirm-add-department").addEventListener("click", addDepartment);
    document.getElementById("confirm-add-employee").addEventListener("click", addEmployee);
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', hideAddForms);
    });

    // تحميل البيانات الأولية
    loadData();
};

// اختبار الاتصال
function testConnection() {
    const connectedRef = ref(db, '.info/connected');
    onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === true) {
            console.log("متصل بـ Firebase بنجاح");
        } else {
            console.log("غير متصل بـ Firebase");
        }
    });
}

// تشغيل اختبار الاتصال
testConnection();
