// Student Result Management System: no backend, everything runs in the browser.

const PASS_MARK = 40;        // minimum marks needed in each subject
const MAX_PER_SUBJECT = 100;

const form = document.getElementById("resultForm");
const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const markInputs = ["m1", "m2", "m3", "m4", "m5"].map(id => document.getElementById(id));
const tbody = document.getElementById("resultBody");
const emptyMsg = document.getElementById("emptyMsg");

const students = []; // array of result objects

// ---------- Step 5: validation ----------
function setError(input, message) {
  const field = input.closest(".field");
  field.querySelector(".error").textContent = message;
  field.classList.toggle("invalid", Boolean(message));
  return !message;
}

function validate() {
  let ok = true;

  const name = nameInput.value.trim();
  if (!name) ok = setError(nameInput, "Enter the student's name.") && ok;
  else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(name)) ok = setError(nameInput, "Use letters and spaces only.") && ok;
  else setError(nameInput, "");

  const roll = rollInput.value.trim();
  if (!roll) ok = setError(rollInput, "Enter the roll number.") && ok;
  else if (students.some(s => s.roll.toLowerCase() === roll.toLowerCase())) ok = setError(rollInput, "This roll number is already added.") && ok;
  else setError(rollInput, "");

  markInputs.forEach(input => {
    const raw = input.value.trim();
    const value = Number(raw);
    if (raw === "") ok = setError(input, "Enter marks.") && ok;
    else if (Number.isNaN(value)) ok = setError(input, "Marks must be a number.") && ok;
    else if (value < 0 || value > MAX_PER_SUBJECT) ok = setError(input, "Enter 0 to " + MAX_PER_SUBJECT + ".") && ok;
    else setError(input, "");
  });

  return ok;
}

// ---------- Step 6: calculations ----------
function getGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  if (percentage >= 40) return "E";
  return "F";
}

function calculate(marks) {
  const total = marks.reduce((sum, m) => sum + m, 0);
  const percentage = total / (marks.length * MAX_PER_SUBJECT) * 100;
  const passedAll = marks.every(m => m >= PASS_MARK);
  return {
    total,
    percentage,
    grade: passedAll ? getGrade(percentage) : "F",
    status: passedAll ? "Pass" : "Fail"
  };
}

// ---------- Step 7: render table ----------
function cell(text, className) {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function render() {
  tbody.replaceChildren();
  students.forEach((s, index) => {
    const tr = document.createElement("tr");
    tr.append(cell(s.roll), cell(s.name), cell(s.total, "num"), cell(s.percentage.toFixed(2) + "%", "num"), cell(s.grade));

    const statusTd = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge " + s.status.toLowerCase();
    badge.textContent = s.status;
    statusTd.append(badge);
    tr.append(statusTd);

    const actionTd = document.createElement("td");
    const del = document.createElement("button");
    del.type = "button";
    del.className = "row-del";
    del.textContent = "Remove";
    del.setAttribute("aria-label", "Remove " + s.name);
    del.addEventListener("click", () => { students.splice(index, 1); render(); });
    actionTd.append(del);
    tr.append(actionTd);

    tbody.append(tr);
  });
  emptyMsg.hidden = students.length > 0;
}

// ---------- Step 8: clear / next student ----------
function clearForm() {
  form.reset();
  form.querySelectorAll(".field").forEach(f => {
    f.classList.remove("invalid");
    f.querySelector(".error").textContent = "";
  });
  nameInput.focus();
}

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!validate()) return;

  const marks = markInputs.map(i => Number(i.value));
  students.push({
    name: nameInput.value.trim(),
    roll: rollInput.value.trim(),
    ...calculate(marks)
  });
  render();
  clearForm(); // ready for the next student
});

document.getElementById("clearForm").addEventListener("click", clearForm);
document.getElementById("clearAll").addEventListener("click", () => {
  if (students.length && confirm("Remove all results from the table?")) {
    students.length = 0;
    render();
  }
});

render();
