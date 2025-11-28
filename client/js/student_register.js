// student_schedule.js
const API_BASE = "http://localhost:3000";

// ===== Auth (từ localStorage) =====
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId"); // studentId

if (!token || !userId) {
  window.location.href = "./Login.html";
}

// ===== Map elements (contract) =====
const listBody = document.getElementById("sched-session-list"); // tbody
const messageEl = document.getElementById("sched-message");

// ===== UI helpers =====
function setMessage(msg, isError = true) {
  if (!messageEl) return;
  messageEl.textContent = msg || "";
  messageEl.style.color = isError ? "red" : "green";
}

// ===== API =====
async function apiGetAvailableSessions() {
  const res = await fetch(`${API_BASE}/sessions/available`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);

  return Array.isArray(data) ? data : (data.data || []);
}

async function apiRegisterSession(sessionId) {
  const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentId: userId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

// ===== Render (đổ data vào thẳng body sched-session-list ở HTML luôn nha) =====
function renderSessions(rows) {
  if (!listBody) return;

  if (!Array.isArray(rows) || rows.length === 0) {
    listBody.innerHTML =
      `<tr><td colspan="999" style="text-align:center; padding:12px;">
        Không có buổi học đang mở.
      </td></tr>`;
    return;
  }

  listBody.innerHTML = rows.map((s) => `
    <tr>
      <td>${s.subject}</td>
      <td>${s.building}</td>
      <td>${s.room}</td>
      <td>${s.currentStudents}/${s.maxStudents}</td>
      <td>${s.tutorName}</td>
      <td>${s.date}</td>
      <td>${s.timeRange}</td>
      <td>
        <button class="sched-register-btn" data-session-id="${s.sessionId}">
          Chọn
        </button>
      </td>
    </tr>
  `).join("");
}

// ===== Events =====
// Đăng ký buổi học
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".sched-register-btn");
  if (!btn) return;

  const sessionId = btn.getAttribute("data-session-id");
  if (!sessionId) return;

  setMessage("");

  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = "Đang đăng ký...";

  try {
    const result = await apiRegisterSession(sessionId);

    setMessage("Đăng ký thành công!", false);

    // reload list để cập nhật currentStudents/maxStudents
    const rows = await apiGetAvailableSessions();
    renderSessions(rows);
  } catch (err) {
    setMessage("Đăng ký thất bại: " + err.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = oldText || "Chọn";
  }
});

// ===== Kickoff: vào trang auto load =====
(async function init() {
  setMessage("Đang tải danh sách buổi học...", false);
  try {
    const rows = await apiGetAvailableSessions();
    renderSessions(rows);
    setMessage("", false);
  } catch (err) {
    setMessage("Không tải được danh sách: " + err.message, true);
  }
})();
