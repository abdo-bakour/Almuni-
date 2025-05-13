// Data storage
let workplaces = JSON.parse(localStorage.getItem('workplaces')) || {
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

// Variables to track current workplace and department
let currentWorkplace = null;
let currentDepartment = null;

// Display functions
function searchWorkplace() {
    let query = document.getElementById("search").value.toLowerCase();
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (workplaces[query]) {
        resultsDiv.innerHTML = `
            <div class="workplace-item" onclick="showDepartments('${query}')">
                <span>${workplaces[query].name}</span>
                <button onclick="event.stopPropagation(); deleteWorkplace('${query}')">Delete</button>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = "<p>No results found</p>";
    }
}

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
                <button onclick="event.stopPropagation(); deleteDepartment('${key}')">Delete</button>
            </li>
        `;
    }

    document.getElementById("results").style.display = "none";
    departmentDetails.style.display = "block";
    employeeDetails.style.display = "none";
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
                <button onclick="deleteEmployee(${index})">Delete</button>
            </li>
        `;
    });

    document.getElementById("department-details").style.display = "none";
    employeeDetails.style.display = "block";
}

// Add functions
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

// Delete functions
function deleteWorkplace(key) {
    if (confirm(`Delete ${workplaces[key].name}?`)) {
        delete workplaces[key];
        saveData();
        searchWorkplace();
    }
}

function deleteDepartment(key) {
    if (confirm("Delete this department?")) {
        delete workplaces[currentWorkplace].departments[key];
        saveData();
        showDepartments(currentWorkplace);
    }
}

function deleteEmployee(index) {
    if (confirm("Delete this employee?")) {
        workplaces[currentWorkplace].departments[currentDepartment].employees.splice(index, 1);
        saveData();
        showEmployees(currentWorkplace, currentDepartment);
    }
}

// Save data
function saveData() {
    localStorage.setItem('workplaces', JSON.stringify(workplaces));
}

// Initialize page
window.onload = function() {
    searchWorkplace();
};
