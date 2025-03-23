function searchWorkplace() {
    let query = document.getElementById("search").value;
    window.location.href = `workplace.html?name=${query}`;
}function searchWorkplace() {
    let query = document.getElementById("search").value.toLowerCase(); // تحويل الإدخال إلى أحرف صغيرة لتجنب مشاكل الحالة
    let resultsDiv = document.getElementById("results");

    // مسح النتائج السابقة
    resultsDiv.innerHTML = "";

    // التحقق من الإدخال وعرض النتائج المناسبة
    if (query === "karl-olga-krankenhaus") {
        resultsDiv.innerHTML = "<p>Karl-Olga-Krankenhaus: هذا القسم متخصص في الرعاية الصحية والمستشفيات.</p>";
    } else if (query === "قسم آخر") { // يمكنك إضافة أقسام أخرى هنا
        resultsDiv.innerHTML = "<p>نتيجة لقسم آخر.</p>";
    } else {
        resultsDiv.innerHTML = "<p>لم يتم العثور على نتائج لـ " + query + ".</p>";
    }
}