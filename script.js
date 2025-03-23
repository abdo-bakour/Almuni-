// Old code
function oldSearchWorkplace() {
    let query = document.getElementById("search").value;
    let oldResultsDiv = document.getElementById("old-results");
    oldResultsDiv.innerHTML = "<p>Old search result: " + query + "</p>";
}

// New code
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
            // Add more departments here
        }
    },
    // Add more workplaces here
};

function searchWorkplace() {
    let query = document.getElementById("search").value.toLowerCase();
    let resultsDiv = document.getElementById("results");
    let oldResultsDiv = document.getElementById("old-results");

    // Clear old and new results
    resultsDiv.innerHTML = "";
    oldResultsDiv.innerHTML = "";

    // Old search
    oldSearchWorkplace();

    // New search
    if (workplaces[query]) {
        // Display workplace name as a clickable option
        resultsDiv.innerHTML = `<li onclick="showDepartments('${query}')">${workplaces[query].name}</li>`;
    } else {
        resultsDiv.innerHTML = "<p>No results found for " + query + ".</p>";
    }
}

function showDepartments(workplaceKey) {
    let workplace = workplaces[workplaceKey];
    let departmentDetails = document.getElementById("department-details");
    let departmentList = document.getElementById("department-list");

    // Display workplace name
    document.getElementById("department-name").innerText = workplace.name;

    // Display departments
    departmentList.innerHTML = "";
    for (let key in workplace.departments) {
        let department = workplace.departments[key];
        departmentList.innerHTML += `<li onclick="showEmployees('${workplaceKey}', '${key}')">${department.name}</li>`;
    }

    // Show department details section
    departmentDetails.style.display = "block";
    document.getElementById("results").style.display = "none";
}

function showEmployees(workplaceKey, departmentKey) {
    let department = workplaces[workplaceKey].departments[departmentKey];
    let employeeDetails = document.getElementById("employee-details");
    let employeeList = document.getElementById("employee-list");

    // Display department name
    document.getElementById("employee-department-name").innerText = department.name;

    // Display employees
    employeeList.innerHTML = "";
    department.employees.forEach(employee => {
        employeeList.innerHTML += `<li>${employee.name} - ${employee.telefonNr}</li>`;
    });

    // Show employee details section
    employeeDetails.style.display = "block";
    document.getElementById("department-details").style.display = "none";
}