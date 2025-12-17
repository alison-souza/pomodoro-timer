const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const intervalButtons = document.querySelectorAll(".intervals button");
const completedEl = document.getElementById("completedPomodoros");
const progressCircle = document.querySelector(".progress-circle .progress");
const alarmSound = document.getElementById("alarmSound");
const historyEl = document.getElementById("pomodoroHistory");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const toggleThemeBtn = document.getElementById("toggleTheme");

let currentInterval = 25; // minutos
let totalSeconds = currentInterval * 60;
let timer = null;
let isRunning = false;
let completedPomodoros =
  parseInt(localStorage.getItem("completedPomodoros")) || 0;

completedEl.textContent = completedPomodoros;

// Círculo de progresso
const radius = 90;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = circumference;
progressCircle.style.strokeDashoffset = circumference;

// Histórico
let history = JSON.parse(localStorage.getItem("pomodoroHistory")) || [];
updateHistoryDisplay();

// Atualiza timer
function updateDisplay() {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  minutesEl.textContent = mins.toString().padStart(2, "0");
  secondsEl.textContent = secs.toString().padStart(2, "0");

  const offset = circumference * (1 - totalSeconds / (currentInterval * 60));
  progressCircle.style.strokeDashoffset = offset;
}

// Timer
function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timer = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      updateDisplay();
    } else {
      clearInterval(timer);
      isRunning = false;
      completedPomodoros++;
      completedEl.textContent = completedPomodoros;
      localStorage.setItem("completedPomodoros", completedPomodoros);

      alarmSound.play();
      notify("Pomodoro concluído! 🍅");

      // Salvar histórico
      const time = new Date().toLocaleTimeString();
      history.unshift(`Pomodoro concluído às ${time}`);
      localStorage.setItem("pomodoroHistory", JSON.stringify(history));
      updateHistoryDisplay();

      resetTimer(true);
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function stopTimer() {
  if (isRunning && totalSeconds > 0) {
    clearInterval(timer);
    isRunning = false;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeStr = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
    history.unshift(
      `Pomodoro parado em ${timeStr} às ${new Date().toLocaleTimeString()}`
    );
    localStorage.setItem("pomodoroHistory", JSON.stringify(history));
    updateHistoryDisplay();
    resetTimer(true);
  }
}

function resetTimer(skipAlert = false) {
  clearInterval(timer);
  isRunning = false;
  totalSeconds = currentInterval * 60;
  updateDisplay();
}

// Botões
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);

intervalButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentInterval = parseInt(btn.dataset.time);
    totalSeconds = currentInterval * 60;
    updateDisplay();
  });
});

// Histórico
clearHistoryBtn.addEventListener("click", () => {
  if (confirm("Deseja realmente limpar todo o histórico?")) {
    history = [];
    localStorage.setItem("pomodoroHistory", JSON.stringify(history));
    updateHistoryDisplay();
  }
});

function updateHistoryDisplay() {
  historyEl.innerHTML = "";
  history.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.addEventListener("click", () => {
      history.splice(index, 1);
      localStorage.setItem("pomodoroHistory", JSON.stringify(history));
      updateHistoryDisplay();
    });

    li.appendChild(deleteBtn);
    historyEl.appendChild(li);
  });
}

// Notificação
function notify(message) {
  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") new Notification(message);
    });
  }
}

// Tema claro/escuro
toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

updateDisplay();
