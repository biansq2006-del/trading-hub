(() => {
  const menuButton = document.getElementById("menuButton");
  const sidebar = document.getElementById("sidebar");
  if (menuButton && sidebar) {
    menuButton.addEventListener("click", () => sidebar.classList.toggle("open"));
  }

  const accountTabs = [...document.querySelectorAll(".account-tab")];
  accountTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      accountTabs.forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".account-panel").forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`[data-account-panel="${tab.dataset.panel}"]`)?.classList.add("active");
    });
  });

  const stockTable = document.getElementById("stockTable");
  if (!stockTable) return;

  const rows = [...stockTable.tBodies[0].rows];
  const tabs = [...document.querySelectorAll("[data-strategy]")];
  const search = document.getElementById("stockSearch");
  const grade = document.getElementById("gradeFilter");
  const count = document.getElementById("resultCount");
  let strategy = new URLSearchParams(location.search).get("strategy") || "all";

  function applyFilters() {
    const query = (search?.value || "").trim().toLowerCase();
    const selectedGrade = grade?.value || "";
    let visible = 0;
    rows.forEach((row) => {
      const text = `${row.dataset.code} ${row.dataset.name} ${row.dataset.industry}`.toLowerCase();
      const strategyMatch = strategy === "all" || row.dataset.strategies.split(" ").includes(strategy);
      const show = strategyMatch && (!selectedGrade || row.dataset.grade === selectedGrade) && (!query || text.includes(query));
      row.hidden = !show;
      if (show) visible += 1;
    });
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.strategy === strategy));
    if (count) count.textContent = `显示 ${visible} / ${rows.length} 只`;
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => {
    strategy = tab.dataset.strategy;
    history.replaceState(null, "", strategy === "all" ? "stocks.html" : `stocks.html?strategy=${strategy}`);
    applyFilters();
  }));
  search?.addEventListener("input", applyFilters);
  grade?.addEventListener("change", applyFilters);
  applyFilters();

  document.getElementById("downloadCsv")?.addEventListener("click", () => {
    const headers = [...stockTable.tHead.rows[0].cells].map((cell) => cell.textContent.trim());
    const visibleRows = rows.filter((row) => !row.hidden);
    const lines = [headers, ...visibleRows.map((row) => [...row.cells].map((cell) => cell.textContent.trim()))]
      .map((values) => values.map((value) => `"${value.replaceAll('"', '""')}"`).join(","));
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `策略选股_${strategy}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
})();
