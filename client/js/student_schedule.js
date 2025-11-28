// student_schedule.js
const API_BASE = "http://localhost:3000";

// ===== Auth =====
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId"); // studentId

if (!token || !userId) {
  window.location.href = "./Login.html";
}

// ===== Map elements (contract) =====
const listBody = document.getElementById("student-registered-session-list"); // tbody
const messageEl = document.getElementById("student-registered-message");

// ===== UI helpers =====
function setMessage(msg, isError = true) {
  if (!messageEl) return;
  messageEl.textContent = msg || "";
  messageEl.style.color = isError ? "red" : "green";
}

// ===== API =====
async function apiGetRegisteredSessions() {
  const res = await fetch(`${API_BASE}/sessions/registered?studentId=${encodeURIComponent(userId)}`, {
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

async function apiCancelSession(sessionId) {
  const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(sessionId)}/cancel`, {
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

// ===== Render =====
function renderRegisteredSessions(rows) {
  if (!listBody) return;

  if (!Array.isArray(rows) || rows.length === 0) {
    listBody.innerHTML =
      `<tr><td colspan="999" style="text-align:center; padding:12px;">
        Bạn chưa đăng ký buổi học nào.
      </td></tr>`;
    return;
  }

  listBody.innerHTML = rows
    .map(
      (s) => `
    <tr>
      <td>${s.sessionId}</td>
      <td>${s.subject}</td>
      <td>${s.tutorName}</td>
      <td>${s.date}</td>
      <td>${s.timeRange}</td>
      <td>${s.building}</td>
      <td>${s.room}</td>
      <td>${s.currentStudents}/${s.maxStudents}</td>
      <td>
        <button class="student-session-cancel-btn" data-session-id="${s.sessionId}">
          Xóa
        </button>
      </td>
    </tr>
  `
    )
    .join("");
}

// ===== Events: Hủy đăng ký =====
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".student-session-cancel-btn");
  if (!btn) return;

  const sessionId = btn.getAttribute("data-session-id");
  if (!sessionId) return;

  setMessage("");

  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = "Đang hủy...";

  try {
    await apiCancelSession(sessionId);
    setMessage("Hủy đăng ký thành công!", false);

    // reload list
    const rows = await apiGetRegisteredSessions();
    renderRegisteredSessions(rows);
  } catch (err) {
    setMessage("Hủy đăng ký thất bại: " + err.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = oldText || "Xóa";
  }
});

// ===== Kickoff =====
(async function init() {
  setMessage("Đang tải danh sách đã đăng ký...", false);
  try {
    const rows = await apiGetRegisteredSessions();
    renderRegisteredSessions(rows);
    setMessage("", false);
  } catch (err) {
    setMessage("Không tải được danh sách: " + err.message, true);
  }
})();
