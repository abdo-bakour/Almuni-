// الكود القديم
function oldSearchWorkplace() {
    let query = document.getElementById("search").value;
    let oldResultsDiv = document.getElementById("old-results");
    oldResultsDiv.innerHTML = "<p>نتيجة البحث القديم: " + query + "</p>";
}

// الكود الجديد
const workplaces = {
    "karl-olga-krankenhaus": {
        name: "Karl-Olga-Krankenhaus",
        departments: {
            "c5.2": {
                name: "C5.2",
                employees: [
                    { name: "Abdul", telefonNr: "0155555555" },
                    { name: "Ali", telefonNr: "0155555556" },
                    { name: "Sara", telefonNr: "0155555557" }
                ]
            },
            // يمكن إضافة أقسام أخرى هنا
        }
    },
    // يمكن إضافة أماكن عمل أخرى هنا
};

function searchWorkplace() {
    let query = document.getElementById("search").value.toLowerCase();
    let resultsDiv = document.getElementById("results");
    let oldResultsDiv = document.getElementById("old-results");

    // مسح النتائج القديمة والجديدة
    resultsDiv.innerHTML = "";
    oldResultsDiv.innerHTML = "";

    // البحث القديم
    oldSearchWorkplace();

    // البحث الجديد
    if (workplaces[query]) {
        // عرض اسم مكان العمل كخيار قابل للتحديد
        resultsDiv.innerHTML = `<li onclick="showDepartments('${query}')">${workplaces[query].name}</li>`;
    } else {
        resultsDiv.innerHTML = "<p>لم يتم العثور على نتائج لـ " + query + ".</p>";
    }
}

function showDepartments(workplaceKey) {
    let workplace = workplaces[workplaceKey];
    let departmentDetails = document.getElementById("department-details");
    let departmentList = document.getElementById("department-list");

    // عرض اسم مكان العمل
    document.getElementById("department-name").innerText = workplace.name;

    // عرض الأقسام
    departmentList.innerHTML = "";
    for (let key in workplace.departments) {
        let department = workplace.departments[key];
        departmentList.innerHTML += `<li onclick="showEmployees('${workplaceKey}', '${key}')">${department.name}</li>`;
    }

    // إظهار قسم التفاصيل
    departmentDetails.style.display = "block";
    document.getElementById("results").style.display = "none";
}

function showEmployees(workplaceKey, departmentKey) {
    let department = workplaces[workplaceKey].departments[departmentKey];
    let employeeDetails = document.getElementById("employee-details");
    let employeeList = document.getElementById("employee-list");

    // عرض اسم القسم
    document.getElementById("employee-department-name").innerText = department.name;

    // عرض الموظفين
    employeeList.innerHTML = "";
    department.employees.forEach(employee => {
        employeeList.innerHTML += `<li>${employee.name} - ${employee.telefonNr}</li>`;
    });

    // إظهار قسم تفاصيل الموظفين
    employeeDetails.style.display = "block";
    document.getElementById("department-details").style.display = "none";
}