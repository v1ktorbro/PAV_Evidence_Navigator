let rows = [];

const byId = (id) => document.getElementById(id);
const selectedIds = () => [...document.querySelectorAll("input[data-experiment]:checked")].map((input) => input.value);

function statusClass(status) { return status === "comparable" ? "comparable" : status === "limited" ? "limited" : "not_comparable"; }
function statusLabel(status) { return status === "comparable" ? "сопоставимо" : status === "limited" ? "ограниченно" : "нельзя сравнить"; }

function render(data) {
  rows = data.items;
  byId("evidenceRows").innerHTML = rows.map((row) => `<tr>
    <td><input type="checkbox" data-experiment value="${row.id}" checked></td>
    <td><strong>${row.formulation.name}</strong><br><small>${row.formulation.surfactant_class}, ${row.formulation.concentration_wt_pct}%</small></td>
    <td>${row.conditions.temperature_c ?? "—"} °C · ${row.conditions.salinity_g_l ?? "—"} г/л<br><small>${row.conditions.rock_type}; ${row.conditions.permeability_md ?? "—"} мД</small></td>
    <td><strong>${row.result.value} ${row.result.unit}</strong><br><small>${row.result.label}</small></td>
    <td><span class="badge ${statusClass(row.comparability.status)}">${statusLabel(row.comparability.status)}</span><br><small>${row.comparability.reason}</small></td>
    <td class="source"><strong>${row.source.document}</strong><br><small>${row.source.location}</small></td>
  </tr>`).join("");
  byId("stats").innerHTML = [
    [data.summary.total, "опытов в выборке"], [data.summary.comparable, "сопоставимы"], [data.summary.limited, "с ограничениями"], [data.summary.not_comparable, "не сопоставимы"]
  ].map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`).join("");
  byId("gaps").innerHTML = data.summary.missing_fields.length ? data.summary.missing_fields.map((field) => `<li>${field}</li>`).join("") : "<li>В текущей выборке обязательные поля заполнены.</li>";
  document.querySelectorAll("input[data-experiment]").forEach((input) => input.addEventListener("change", updateCount));
  updateCount();
}

function updateCount() { byId("selectedCount").textContent = `Выбрано: ${selectedIds().length}`; }
function queryPayload() { return { question: byId("question").value.trim(), experiment_ids: selectedIds() }; }
function showResult(title, value) { byId("resultPanel").hidden = false; byId("resultTitle").textContent = title; byId("resultText").textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2); }

async function loadEvidence() {
  const params = new URLSearchParams();
  const fields = [["minTemp", "min_temperature"], ["maxTemp", "max_temperature"], ["maxSalinity", "max_salinity"]];
  fields.forEach(([id, key]) => { if (byId(id).value) params.set(key, byId(id).value); });
  if (byId("comparableOnly").checked) params.set("comparable_only", "true");
  const response = await fetch(`/api/evidence?${params}`);
  render(await response.json());
}

async function post(path, payload) {
  const response = await fetch(path, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.detail || "Не удалось выполнить запрос");
  return body;
}

byId("applyFilters").addEventListener("click", loadEvidence);
byId("localAnalysis").addEventListener("click", async () => {
  const payload = queryPayload();
  if (payload.question.length < 5) return showResult("Нужен вопрос", "Сформулируйте инженерный вопрос длиннее пяти символов.");
  const data = await post("/api/analysis", payload);
  showResult("Проверяемая подборка", { summary:data.summary, source_fragments:data.items.map((row) => ({ experiment:row.id, excerpt:row.source.excerpt })) });
});
byId("synapseResearch").addEventListener("click", async () => {
  try {
    const payload = queryPayload();
    const project = await post("/api/synapse/projects", payload);
    const message = `${project.status}${project.awaiting_approval ? " · ожидается утверждение" : ""}\n${project.synapse_url || ""}\n\n${project.result_preview || "Проект создан. Нажмите ссылку, чтобы открыть его в Synapse."}`;
    showResult("Проект Synapse", message);
  } catch (error) { showResult("Synapse недоступен", error.message); }
});

(async () => {
  try {
    const config = await (await fetch("/api/synapse/config")).json();
    byId("synapseState").textContent = config.configured ? `Synapse · ${config.approval_mode}` : "Synapse не настроен";
    byId("synapseState").classList.add(config.configured ? "ready" : "off");
    await loadEvidence();
  } catch (error) { showResult("Ошибка загрузки", error.message); }
})();
