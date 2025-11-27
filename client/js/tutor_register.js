// tutor_register.js
const API_BASE = "http://localhost:3000";

// ===== Auth (từ localStorage) =====
const token = localStorage.getItem("token");
const role = localStorage.getItem("role"); // optional

if (!token) {
  window.location.href = "./Login.html";
}

// Nếu muốn chặn không cho student vào trang tutor:
if (role && role !== "tutor") {
  window.location.href = "./HomePage.html";
}

// ===== Map elements (contract) =====
const dateEl = document.getElementById("tutor-session-date");
const buildingEl = document.getElementById("tutor-session-building");
const roomEl = document.getElementById("tutor-session-room");
const shiftEl = document.getElementById("tutor-session-shift");
const subjectEl = document.getElementById("tutor-session-subject");
const maxStudentsEl = document.getElementById("tutor-session-max-students");
const createBtn = document.getElementById("tutor-session-create");
const messageEl = document.getElementById("tutor-session-message");

// ===== UI helpers =====
function setMessage(msg, isError = true) {
  if (!messageEl) return;
  messageEl.textContent = msg || "";
  messageEl.style.color = isError ? "red" : "green";
}

function getTrimmedValue(el) {
  return (el?.value ?? "").trim();
}

// ===== API =====
async function apiCreateSession(payload) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  // 409 Conflict
  if (!res.ok || data?.success === false || data?.error) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

// ===== Event: Create session =====
createBtn?.addEventListener("click", async () => {
  setMessage("");

  const date = getTrimmedValue(dateEl);
  const building = getTrimmedValue(buildingEl);
  const room = getTrimmedValue(roomEl);
  const timeRange = getTrimmedValue(shiftEl);
  const subjectId = getTrimmedValue(subjectEl);
  const maxStudents = getTrimmedValue(maxStudentsEl);

  if (!date || !building || !room || !timeRange || !subjectId || !maxStudents) {
    setMessage("Vui lòng nhập đầy đủ: Ngày, Tòa nhà, Phòng, Ca học, Môn học, Số lượng sinh viên.", true);
    return;
  }

  const payload = {
    subjectId,
    date,
    building,
    room,
    timeRange,
    maxStudents,
  };

  createBtn.disabled = true;
  const oldText = createBtn.textContent;
  createBtn.textContent = "Đang tạo...";

  try {
    const result = await apiCreateSession(payload);

    // success
    const id = result.sessionId;
    setMessage(`Mở lớp thành công! sessionId: ${id}`, false);

    // reset form
    if (dateEl) dateEl.value = "";
    if (buildingEl) buildingEl.value = "";
    if (roomEl) roomEl.value = "";
    if (shiftEl) shiftEl.value = "";
    if (subjectEl) subjectEl.value = "";
    if (maxStudents) maxStudentsEl.value = "";

  } catch (e) {
    setMessage("Mở lớp thất bại: " + e.message, true);
  } finally {
    createBtn.disabled = false;
    createBtn.textContent = oldText || "Đăng ký";
  }
});
