function searchWorkplace() {
    let query = document.getElementById("search").value;
    window.location.href = `workplace.html?name=${query}`;
}
