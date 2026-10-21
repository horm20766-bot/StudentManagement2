
"use strict";

/* =========================================
   STUDENT MANAGEMENT
========================================= */

const form = document.getElementById("studentForm");
const studentIdInput = document.getElementById("studentId");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const majorInput = document.getElementById("major");
const submitBtn = document.getElementById("submitBtn");
const studentList = document.getElementById("studentList");
const searchInput = document.getElementById("search");
const count = document.getElementById("count");
const message = document.getElementById("message");

const STORAGE_KEY = "studentRecords";

let students = [];

try {
    const savedStudents = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    students = Array.isArray(savedStudents) ? savedStudents : [];
} catch (error) {
    console.error("Could not load saved students:", error);
    students = [];
}

// Save student data
function saveStudents() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(students)
        );
    } catch (error) {
        console.error("Could not save students:", error);
        message.textContent = "Could not save student data.";
    }
}

// Display student data
function displayStudents(keyword = "") {
    studentList.replaceChildren();

    const searchTerm = keyword.toLowerCase();

    const filtered = students.filter(student =>
        String(student.name || "").toLowerCase().includes(searchTerm) ||
        String(student.major || "").toLowerCase().includes(searchTerm)
    );

    filtered.forEach(student => {
        const tr = document.createElement("tr");

        function addCell(value) {
            const td = document.createElement("td");
            td.textContent = String(value ?? "");
            tr.appendChild(td);
        }

        addCell(student.id);
        addCell(student.name);
        addCell(student.age);
        addCell(student.major);

        const actions = document.createElement("td");
        const actionGroup = document.createElement("div");

        actionGroup.className = "actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.textContent = "Edit";

        editBtn.addEventListener("click", () => {
            editStudent(student.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";

        deleteBtn.addEventListener("click", () => {
            deleteStudent(student.id);
        });

        actionGroup.append(editBtn, deleteBtn);
        actions.appendChild(actionGroup);
        tr.appendChild(actions);

        studentList.appendChild(tr);
    });

    count.textContent =
        `Showing ${filtered.length} of ${students.length} students`;
}

// Add or update student
form.addEventListener("submit", event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const age = Number(ageInput.value);
    const major = majorInput.value.trim();
    const id = studentIdInput.value;

    if (
        !name ||
        !major ||
        !Number.isInteger(age) ||
        age < 1 ||
        age > 120
    ) {
        message.textContent =
            "Please enter valid student information.";
        return;
    }

    if (id) {
        const student = students.find(item => item.id === id);

        if (!student) {
            message.textContent = "Student not found.";
            return;
        }

        student.name = name;
        student.age = age;
        student.major = major;

        message.textContent = "Student updated successfully!";
    } else {
        students.push({
            id: String(Date.now()) +
                Math.random().toString(36).slice(2, 7),
            name,
            age,
            major
        });

        message.textContent = "Student added successfully!";
    }

    saveStudents();

    form.reset();
    studentIdInput.value = "";
    submitBtn.textContent = "Add Student";

    displayStudents(searchInput.value);
});

// Edit student
function editStudent(id) {
    const student = students.find(item => item.id === id);

    if (!student) {
        return;
    }

    studentIdInput.value = student.id;
    nameInput.value = student.name;
    ageInput.value = student.age;
    majorInput.value = student.major;

    submitBtn.textContent = "Update Student";

    message.textContent =
        "Edit the information, then click Update Student.";

    nameInput.focus();
}

// Delete student
function deleteStudent(id) {
    const student = students.find(item => item.id === id);

    if (!student) {
        return;
    }

    if (!confirm(`Delete student "${student.name}"?`)) {
        return;
    }

    students = students.filter(item => item.id !== id);

    saveStudents();
    displayStudents(searchInput.value);

    message.textContent = "Student deleted successfully!";
}

// Search students
searchInput.addEventListener("input", () => {
    displayStudents(searchInput.value);
});

// Load saved students
displayStudents();


/* =========================================
   CONTACT FORM → TELEGRAM
========================================= */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", async event => {
        event.preventDefault();

        const contactName = document.getElementById("contactName");
        const contactMessage = document.getElementById("contactMessage");
        const formStatus = document.getElementById("formStatus");
        const sendBtn = document.getElementById("sendBtn");

        if (!contactName || !contactMessage || !formStatus || !sendBtn) {
            console.error("Contact form elements are missing.");
            return;
        }

        const name = contactName.value.trim();
        const messageText = contactMessage.value.trim();

        if (!name || !messageText) {
            formStatus.textContent =
                "Please enter your name and message.";
            return;
        }

        if (name.length > 100 || messageText.length > 2000) {
            formStatus.textContent =
                "Name or message is too long.";
            return;
        }

        sendBtn.disabled = true;
        sendBtn.textContent = "Sending...";
        formStatus.textContent = "Sending your message...";

        try {
            const response = await fetch(
                "https://student-telegram-api.horm20766.workers.dev",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name,
                        message: messageText
                    })
                }
            );

            let result;

            try {
                result = await response.json();
            } catch {
                throw new Error(
                    `Server returned an invalid response (${response.status}).`
                );
            }

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    `Request failed (${response.status}).`
                );
            }

            formStatus.textContent =
                "Message sent successfully!";

            contactForm.reset();

        } catch (error) {
            console.error("Contact form error:", error);

            formStatus.textContent =
                "Failed to send message. Please check your connection and try again.";

        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = "Send Message";
        }
    });
}
