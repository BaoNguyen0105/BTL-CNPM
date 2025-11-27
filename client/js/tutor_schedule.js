// tutor_schedule.js
const API_BASE = "http://localhost:3000";

// ===== Auth =====
const token = localStorage.getItem("token");
if (!token) window.location.href = "./Login.html";

// ===== Map elements (contract) =====
const listBody = document.getElementById("tutor-session-list"); // tbody
const messageEl = document.getElementById("tutor-session-list-msg");

// ===== UI helpers =====
function setMessage(msg, isError = true) {
  if (!messageEl) return;
  messageEl.textContent = msg || "";
  messageEl.style.color = isError ? "red" : "green";
}

// ===== API =====
async function apiGetTutorSessions() {
  const res = await fetch(`${API_BASE}/sessions/of-tutor`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);

  return data;
}

// ===== Render =====
function renderTutorSessions(rows) {
  if (!listBody) return;

  if (!Array.isArray(rows) || rows.length === 0) {
    listBody.innerHTML =
      `<tr><td colspan="999" style="text-align:center; padding:12px;">Chưa có buổi học nào.</td></tr>`;
    return;
  }

  listBody.innerHTML = rows
    .map(
      (s) => `
    <tr>
      <td>${s.sessionId}</td>  
      <td>${s.subject}</td>
      <td>${s.date}</td>
      <td>${s.timeRange}</td>
      <td>${s.building} - ${s.room}</td>
      <td>${s.currentStudents}/${s.maxStudents}</td>
    </tr>
  `
    )
    .join("");
}

// ===== Kickoff =====
(async function init() {
  setMessage("Đang tải lịch dạy...", false);
  try {
    const rows = await apiGetTutorSessions();
    renderTutorSessions(rows);
    setMessage("", false);
  } catch (err) {
    setMessage("Không tải được lịch dạy: " + err.message, true);
  }
})();
