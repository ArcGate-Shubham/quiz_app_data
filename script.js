let question_data = [
  {
    question: "When was javascript invented?",
    choices: ["1995", "1994", "1996", "None of above"],
    answer: 0,
  },
  {
    question: "What does HTML stand for?",
    choices: [
      "Hypertext Markup Language",
      "Hypertext Markdown Language",
      "HyperLoop Machine Language",
      "None",
    ],
    answer: 0,
  },
  {
    question: "Which is the full form of CSS?",
    choices: [
      "Central style sheets",
      "Cascading style sheets",
      "Central simple sheets",
      "None",
    ],
    answer: 1,
  },
  {
    question: "What language runs in a web browser?",
    choices: ["Java", "C", "C++", "Javascript"],
    answer: 3,
  },
];

let current_user_data = {};
const login_modal = document.getElementById("login_modal");
const form_data = document.getElementById("form");
const usernameInput = document.getElementById("username");
const email_data = document.getElementById("emailInput");
const usernameDisplay = document.getElementById("usernameDisplay");
let back = document.getElementById("previous");
let box_question = document.getElementById("boxquiz");
let resultPage = document.getElementById("resultPage");

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie =
    name +
    "=" +
    encodeURIComponent(JSON.stringify(value)) +
    expires +
    "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0)
      return JSON.parse(
        decodeURIComponent(c.substring(nameEQ.length, c.length))
      );
  }
  return null;
}

function set_current_state_page() {
  localStorage.setItem(
    current_user_data.email,
    JSON.stringify(current_user_data)
  );
}

function store_cookies() {
  setCookie("user", current_user_data);
}

function store_current_screen_data() {
  const cookieStorage = getCookie("user");
  const localStorageData = localStorage.getItem("user");

  if (cookieStorage) {
    current_user_data = cookieStorage;
  } else if (localStorageData) {
    current_user_data = JSON.parse(localStorageData);
  } else {
    login_modal.style.display = "inline-flex";
    box_question.style.display = "none";
    resultPage.style.display = "none";
    return;
  }

  if (current_user_data.currentQuestion !== undefined) {
    userAnswers = current_user_data.userAnswers || [];
    if (current_user_data.currentQuestion >= question_data.length) {
      show_result_page();
    } else {
      login_modal.style.display = "none";
      box_question.style.display = "block";
      resultPage.style.display = "none";
      loadQuestion();
    }
    return;
  }
  login_modal.style.display = "inline-flex";
  box_question.style.display = "none";
  resultPage.style.display = "none";
}

window.addEventListener("load", () => {
  store_current_screen_data();
});

window.addEventListener("beforeunload", () => {
  if (current_user_data.currentQuestion !== undefined) {
    store_cookies();
  }
});

form_data.addEventListener("submit", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value;

  const email_data = document.getElementById("emailInput");
  const email = email_data.value;
  const emailPattern = /^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/;

  if (!emailPattern.test(email)) {
    alert("Please enter a valid email");
    email_data.value = "";
    return;
  }

  if (localStorage.length >= 10) {
    alert("Session timeout. Maximum number of users logged in.");
    localStorage.clear();
    location.reload();
  }

  const storedUserData = JSON.parse(localStorage.getItem(email));
  if (storedUserData) {
    current_user_data = storedUserData;
    show_result_page();
    return;
  } else {
    current_user_data = {
      username,
      email,
      score: 0,
      currentQuestion: 0,
    };
    localStorage.setItem(email, JSON.stringify(current_user_data));
    set_current_state_page();
    store_cookies();
  }

  usernameDisplay.textContent = username;
  login_modal.style.display = "none";
  box_question.style.display = "block";
  resultPage.style.display = "none";
  loadQuestion();
});

const submit = document.getElementById("submit");
let userAnswers = current_user_data.userAnswers || [];
function loadQuestion() {
  if (current_user_data.currentQuestion === undefined) {
    current_user_data.currentQuestion = 0;
    current_user_data.userAnswers = [];
    set_current_state_page();
  }
  let questionElementValue = document.getElementById("question");
  let choice_element_value = document.getElementsByTagName("label");

  questionElementValue.textContent =
    question_data[current_user_data.currentQuestion].question;

  for (let i = 0; i < choice_element_value.length; i++) {
    choice_element_value[i].textContent =
      question_data[current_user_data.currentQuestion].choices[i];
  }

  let previousAnswer = userAnswers[current_user_data.currentQuestion];

  if (previousAnswer !== undefined) {
    let choices = document.getElementsByName("choice");
    choices[previousAnswer].checked = true;
  }

  if (current_user_data.currentQuestion == 0) {
    back.style.display = "none";
  } else {
    back.style.display = "inline-flex";
  }
}

function updateOptions() {
  let choices = document.getElementsByName("choice");
  let select_value = -1;

  for (let i = 0; i < choices.length; i++) {
    if (choices[i].checked) {
      select_value = parseInt(choices[i].value);
      for (let j = 0; j < choices.length; j++) {
        choices[j].checked = false;
      }
      break;
    }
  }

  userAnswers[current_user_data.currentQuestion] = select_value;
  current_user_data.userAnswers = userAnswers;
  set_current_state_page();
  store_cookies();

  if (select_value == -1) {
    alert("Please select option!!!");
    return;
  }

  current_user_data.currentQuestion++;

  if (current_user_data.currentQuestion === question_data.length) {
    add_score();
    show_result_page();
  } else {
    loadQuestion();
  }
}

submit.addEventListener("click", updateOptions);

function show_result_page() {
  login_modal.style.display = "none";
  box_question.style.display = "none";
  resultPage.style.display = "block";

  const allUserData = Object.values(localStorage);
  const scoreTableBody = document.getElementById("scoreTableBody");
  scoreTableBody.innerHTML = "";
  allUserData.forEach((userDataJSON) => {
    const user = JSON.parse(userDataJSON);
    const row = document.createElement("tr");

    const usernameCell = document.createElement("td");
    usernameCell.textContent = user.username;
    row.appendChild(usernameCell);

    const emailCell = document.createElement("td");
    emailCell.textContent = user.email;
    row.appendChild(emailCell);

    const scoreCell = document.createElement("td");
    scoreCell.textContent = user.score;
    row.appendChild(scoreCell);

    scoreTableBody.appendChild(row);
  });
}

function add_score() {
  let score = 0;
  for (let i = 0; i < question_data.length; i++) {
    if (userAnswers[i] === question_data[i].answer) {
      score++;
    }
  }
  current_user_data.score = score;
  set_current_state_page();
  store_cookies();
}

function PreviousQuestion() {
  current_user_data.currentQuestion--;
  set_current_state_page();
  store_cookies();
  loadQuestion();
}

back.addEventListener("click", PreviousQuestion);

function restartApp() {
  if (localStorage.length >= 10) {
    alert("Session timeout. Maximum number of users logged in.");
    localStorage.clear();
    window.close();
  }

  document.getElementById("form").reset();
  current_user_data = {};
  userAnswers = [];

  login_modal.style.display = "inline-flex";
  box_question.style.display = "none";
  resultPage.style.display = "none";
}

document.getElementById("restart").addEventListener("click", restartApp);
