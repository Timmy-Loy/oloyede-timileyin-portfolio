// COS 106 Lab Assessment - script.js
// This file controls: the mobile menu, footer year, greeting,
// skill bars, the academic planner and the contact form validation.


// ---------- Mobile menu ----------
const menuButton = document.querySelector(".nav-toggle");
const menu = document.getElementById("nav");

if (menuButton) {
  menuButton.addEventListener("click", function () {
    menu.classList.toggle("open");
  });
}


// ---------- Background ambient sound ----------
const ambient = document.getElementById("ambient");
const soundButton = document.getElementById("soundButton");

// changes the button text to match the sound (on or off)
function updateSoundButton() {
  if (ambient.paused) {
    soundButton.textContent = "Sound: Off";
    soundButton.classList.remove("on");
  } else {
    soundButton.textContent = "Sound: On";
    soundButton.classList.add("on");
  }
}

if (ambient && soundButton) {
  ambient.volume = 0.3; // keep it quiet in the background

  // pick up where the last page stopped
  ambient.addEventListener("loadedmetadata", function () {
    const savedTime = sessionStorage.getItem("ambientTime");
    if (savedTime) {
      ambient.currentTime = Number(savedTime);
    }
  });

  ambient.addEventListener("play", updateSoundButton);
  ambient.addEventListener("pause", updateSoundButton);

  // if the sound was on in the previous page, try to turn it on again
  // (some browsers block this until the user clicks, so we catch the error)
  if (sessionStorage.getItem("ambientOn") === "yes") {
    ambient.play().catch(function () {
      updateSoundButton();
    });
  }

  soundButton.addEventListener("click", function () {
    if (ambient.paused) {
      ambient.play();
      sessionStorage.setItem("ambientOn", "yes");
    } else {
      ambient.pause();
      sessionStorage.setItem("ambientOn", "no");
    }
  });

  // remember the position before the page closes
  window.addEventListener("beforeunload", function () {
    sessionStorage.setItem("ambientTime", ambient.currentTime);
  });
}


// ---------- Footer year ----------
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}


// ---------- Greeting on the homepage ----------
const greeting = document.getElementById("greeting");
if (greeting) {
  const hour = new Date().getHours();
  let timeOfDay = "evening";

  if (hour < 12) {
    timeOfDay = "morning";
  } else if (hour < 17) {
    timeOfDay = "afternoon";
  }

  greeting.textContent = "Good " + timeOfDay + ", and welcome to my portfolio!";
}


// ---------- Skill bars (About page) ----------
const bars = document.querySelectorAll(".bar div");

// small delay so the bar animation can be seen
setTimeout(function () {
  for (let i = 0; i < bars.length; i++) {
    const level = bars[i].getAttribute("data-level");
    bars[i].style.width = level + "%";
  }
}, 200);


// ---------- Academic Planner ----------
// All tasks are stored in this array.
// Each task looks like: { text: "Study networking", due: "2026-11-20", completed: false }
let tasks = [];
let currentFilter = "all";

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");

// save the tasks so they are still there after a page refresh
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (error) {
      tasks = [];
    }
  }
}

function addTask(text, dueDate) {
  const newTask = {
    text: text,
    due: dueDate,
    completed: false
  };
  tasks.push(newTask);
  saveTasks();
  showTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  showTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  showTasks();
}

// draws all the tasks on the page
function showTasks() {
  taskList.innerHTML = "";
  let doneCount = 0;
  let shownCount = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    if (task.completed) {
      doneCount++;
    }

    // skip tasks that do not match the chosen filter
    if (currentFilter === "active" && task.completed) {
      continue;
    }
    if (currentFilter === "completed" && !task.completed) {
      continue;
    }

    shownCount++;

    const li = document.createElement("li");
    li.className = "task";
    if (task.completed) {
      li.classList.add("done");
    }

    // checkbox to mark the task as completed
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", function () {
      toggleTask(i);
    });

    // task text and due date
    const textSpan = document.createElement("span");
    textSpan.className = "task-text";
    textSpan.textContent = task.text;

    if (task.due) {
      const small = document.createElement("small");
      small.textContent = "Due: " + task.due;
      textSpan.appendChild(small);
    }

    // delete button
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteTask(i);
    });

    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteButton);
    taskList.appendChild(li);
  }

  if (shownCount === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty";
    emptyItem.textContent = "No tasks to show. Add one above!";
    taskList.appendChild(emptyItem);
  }

  taskCounter.textContent =
    tasks.length + " total | " + doneCount + " completed | " + (tasks.length - doneCount) + " remaining";
}

// only run the planner code if we are on the planner page
if (taskForm) {
  loadTasks();
  showTasks();

  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskInput = document.getElementById("taskInput");
    const taskDate = document.getElementById("taskDate");
    const taskError = document.getElementById("taskError");
    const text = taskInput.value.trim();

    if (text === "") {
      taskError.textContent = "Please enter a task before adding.";
      return;
    }

    taskError.textContent = "";
    addTask(text, taskDate.value);
    taskInput.value = "";
    taskDate.value = "";
    taskInput.focus();
  });

  // All / Active / Completed buttons
  const filterButtons = document.querySelectorAll(".filters button");

  for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener("click", function () {
      currentFilter = filterButtons[i].getAttribute("data-filter");

      for (let j = 0; j < filterButtons.length; j++) {
        filterButtons[j].classList.remove("active");
      }
      filterButtons[i].classList.add("active");

      showTasks();
    });
  }
}


// ---------- Contact form validation ----------
const contactForm = document.getElementById("contactForm");
const fieldIds = ["name", "email", "phone", "message"];

// shows or clears the error message under a field
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(fieldId + "Error");
  errorSpan.textContent = message;

  if (message === "") {
    field.classList.remove("invalid");
    field.classList.add("valid");
  } else {
    field.classList.remove("valid");
    field.classList.add("invalid");
  }
}

// checks one field and returns true if it is OK
function checkField(fieldId) {
  const value = document.getElementById(fieldId).value.trim();

  // 1. no field should be empty
  if (value === "") {
    showError(fieldId, "This field cannot be empty.");
    return false;
  }

  // 2. email must look like name@site.com
  if (fieldId === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      showError(fieldId, "Please enter a valid email address.");
      return false;
    }
  }

  // 3. phone number must have digits only
  if (fieldId === "phone") {
    const digitsOnly = /^[0-9]+$/;
    if (!digitsOnly.test(value)) {
      showError(fieldId, "Phone number must contain digits only.");
      return false;
    }
  }

  showError(fieldId, "");
  return true;
}

if (contactForm) {
  // check each field when the user leaves it
  for (let i = 0; i < fieldIds.length; i++) {
    document.getElementById(fieldIds[i]).addEventListener("blur", function () {
      checkField(fieldIds[i]);
    });
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let allGood = true;
    for (let i = 0; i < fieldIds.length; i++) {
      if (!checkField(fieldIds[i])) {
        allGood = false;
      }
    }

    const status = document.getElementById("formStatus");

    if (allGood) {
      const name = document.getElementById("name").value.trim();
      status.textContent = "Thank you, " + name + "! Your message has been sent.";
      status.className = "form-status ok";
      contactForm.reset();

      for (let i = 0; i < fieldIds.length; i++) {
        document.getElementById(fieldIds[i]).classList.remove("valid");
      }
    } else {
      status.className = "form-status";
    }
  });
}
