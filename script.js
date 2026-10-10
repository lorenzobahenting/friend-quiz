
"use strict";

// Your original quiz and correct answers.
const myQuiz = [
    { question: "What is my favorite color?", options: ["Gray", "Black", "Blue", "White"], correctIndex: 0 },
    { question: "What is my favorite food?", options: ["Pizza", "Fried chicken", "Ice cream", "Burger"], correctIndex: 2 },
    { question: "What do I do in my free time?", options: ["Gaming", "Coding", "Watching movies", "Playing sports"], correctIndex: 1 },
    { question: "What is my favorite music genre?", options: ["Rock", "Pop", "R&B", "Love songs"], correctIndex: 3 },
    { question: "What is my dream career?", options: ["Software developer", "Teacher", "Virtual assistant (VA)", "Business owner"], correctIndex: 2 },
    { question: "What is something I want to learn?", options: ["Drawing", "Dancing", "Cooking", "Playing piano"], correctIndex: 0 },
    { question: "How would I describe my personality?", options: ["Extrovert", "Introvert", "Ambivert", "Very talkative"], correctIndex: 1 },
    { question: "What makes me happiest?", options: ["Going out", "Shopping", "Sleeping", "Studying"], correctIndex: 2 },
    { question: "What is my biggest goal in life?", options: ["Travel the world", "Become famous", "Become a pro gamer", "Be a successful man"], correctIndex: 3 },
    { question: "What word describes my best friend?", options: ["Kind", "Naughty", "Quiet", "Serious"], correctIndex: 1 }
];

const $ = (id) => document.getElementById(id);

const screens = [
    "start-screen", "quiz-screen", "result-screen",
    "review-screen", "creator-screen"
];

let activeQuiz = myQuiz;
let quizOwner = "My";
let answers = [];
let currentQuestion = 0;
let lastScore = 0;
let lastPercentage = 0;
let generatedQuiz = null;
let generatedQuizLink = "";

function showScreen(id) {
    screens.forEach((screenId) => {
        $(screenId).classList.toggle("active", screenId === id);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function startQuiz(quiz, owner) {
    activeQuiz = quiz;
    quizOwner = owner;
    answers = new Array(activeQuiz.length).fill(null);
    currentQuestion = 0;
    $("quiz-owner-label").textContent = `${owner.toUpperCase()}'S QUIZ`;
    renderQuestion();
    showScreen("quiz-screen");
}

function renderQuestion() {
    const q = activeQuiz[currentQuestion];
    const total = activeQuiz.length;
    const progress = ((currentQuestion + 1) / total) * 100;

    $("question-counter").textContent = `Question ${currentQuestion + 1} of ${total}`;
    $("question-number").textContent = currentQuestion + 1;
    $("question-text").textContent = q.question;
    $("progress-fill").style.width = `${progress}%`;
    $("progress-track").setAttribute("aria-valuenow", progress);

    const container = $("options-container");
    container.replaceChildren();

    q.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "option-btn";
        button.textContent = option;
        button.setAttribute("aria-pressed", String(answers[currentQuestion] === index));

        if (answers[currentQuestion] === index) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {
            answers[currentQuestion] = index;
            renderQuestion();
        });

        container.appendChild(button);
    });

    $("back-btn").disabled = currentQuestion === 0;
    $("next-btn").hidden = currentQuestion === total - 1;
    $("finish-btn").hidden = currentQuestion !== total - 1;

    $("next-btn").disabled = answers[currentQuestion] === null;
    $("finish-btn").disabled = answers[currentQuestion] === null;
}

function nextQuestion() {
    if (answers[currentQuestion] === null) return;
    if (currentQuestion < activeQuiz.length - 1) {
        currentQuestion++;
        renderQuestion();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
}

function finishQuiz() {
    if (answers.some((answer) => answer === null)) {
        currentQuestion = answers.findIndex((answer) => answer === null);
        renderQuestion();
        return;
    }

    lastScore = activeQuiz.reduce((score, q, index) =>
        score + (answers[index] === q.correctIndex ? 1 : 0), 0);

    lastPercentage = Math.round((lastScore / activeQuiz.length) * 100);

    $("score-value").textContent = `${lastScore}/${activeQuiz.length}`;
    $("score-percentage").textContent = `${lastPercentage}%`;
    $("score-fill").style.width = `${lastPercentage}%`;

    if (lastPercentage === 100) {
        $("result-emoji").textContent = "🏆";
        $("result-title").textContent = "Perfect Score!";
        $("result-description").textContent = "Amazing! You know them so well!";
    } else if (lastPercentage >= 80) {
        $("result-emoji").textContent = "💙";
        $("result-title").textContent = "Almost Perfect!";
        $("result-description").textContent = "You know them really well!";
    } else if (lastPercentage >= 60) {
        $("result-emoji").textContent = "😊";
        $("result-title").textContent = "Pretty Good!";
        $("result-description").textContent = "You know quite a lot about them!";
    } else if (lastPercentage >= 40) {
        $("result-emoji").textContent = "🤔";
        $("result-title").textContent = "Not Bad!";
        $("result-description").textContent = "There's still more to learn about them!";
    } else {
        $("result-emoji").textContent = "😂";
        $("result-title").textContent = "Try Again!";
        $("result-description").textContent = "Maybe another round will help!";
    }

    $("share-message").textContent = "";
    $("create-after-btn").hidden = Boolean(location.hash.startsWith("#quiz="));
    showScreen("result-screen");
}

function renderReview() {
    const list = $("review-list");
    list.replaceChildren();

    activeQuiz.forEach((q, index) => {
        const item = document.createElement("article");
        const correct = answers[index] === q.correctIndex;
        item.className = `review-item ${correct ? "correct" : "incorrect"}`;

        const heading = document.createElement("h3");
        heading.textContent = `${index + 1}. ${q.question}`;

        const yourAnswer = document.createElement("p");
        yourAnswer.textContent = `Your answer: ${q.options[answers[index]]}`;

        const correctAnswer = document.createElement("p");
        correctAnswer.textContent = `Correct answer: ${q.options[q.correctIndex]}`;

        const status = document.createElement("p");
        status.className = "review-status";
        status.textContent = correct ? "✓ Correct" : "✗ Incorrect";

        item.append(heading, yourAnswer, correctAnswer, status);
        list.appendChild(item);
    });

    showScreen("review-screen");
}

function goHome() {
    $("share-message").textContent = "";
    showScreen("start-screen");
}

// Build the quiz creator form.
function buildCreatorForm() {
    const container = $("creator-questions");
    container.replaceChildren();

    for (let i = 0; i < 10; i++) {
        const block = document.createElement("fieldset");
        block.className = "creator-question";

        const legend = document.createElement("legend");
        legend.textContent = `Question ${i + 1}`;
        block.appendChild(legend);

        const questionLabel = document.createElement("label");
        questionLabel.textContent = "Question";
        const questionInput = document.createElement("input");
        questionInput.type = "text";
        questionInput.maxLength = 160;
        questionInput.required = true;
        questionInput.placeholder = "Write your question";
        questionInput.className = "custom-question";
        questionLabel.appendChild(questionInput);
        block.appendChild(questionLabel);

        const optionsTitle = document.createElement("p");
        optionsTitle.className = "select-hint";
        optionsTitle.textContent = "Four choices — select the correct answer:";
        block.appendChild(optionsTitle);

        for (let j = 0; j < 4; j++) {
            const row = document.createElement("div");
            row.className = "creator-option-row";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `correct-${i}`;
            radio.value = j;
            radio.required = j === 0;
            radio.setAttribute("aria-label", `Mark choice ${j + 1} as correct`);

            const optionInput = document.createElement("input");
            optionInput.type = "text";
            optionInput.maxLength = 100;
            optionInput.required = true;
            optionInput.placeholder = `Choice ${j + 1}`;
            optionInput.className = "custom-option";

            row.append(radio, optionInput);
            block.appendChild(row);
        }

        container.appendChild(block);
    }
}

function encodeQuiz(quizData) {
    const bytes = new TextEncoder().encode(JSON.stringify(quizData));
    let binary = "";
    bytes.forEach((byte) => binary += String.fromCharCode(byte));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeQuiz(encoded) {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
}

function createQuiz(event) {
    event.preventDefault();
    $("creator-error").textContent = "";
    const name = $("creator-name").value.trim();

    if (!name) {
        $("creator-error").textContent = "Please enter your name or nickname.";
        return;
    }

    const blocks = [...$("creator-questions").querySelectorAll(".creator-question")];

    const quiz = [];

    for (let i = 0; i < blocks.length; i++) {
        const question = blocks[i].querySelector(".custom-question").value.trim();
        const optionInputs = [...blocks[i].querySelectorAll(".custom-option")];
        const selectedRadio = blocks[i].querySelector('input[type="radio"]:checked');
        const options = optionInputs.map((input) => input.value.trim());

        if (!question || options.some((option) => !option) || !selectedRadio) {
            $("creator-error").textContent =
                `Please complete question ${i + 1}, all four choices, and select its correct answer.`;
            blocks[i].scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        quiz.push({
            question,
            options,
            correctIndex: Number(selectedRadio.value)
        });
    }

    generatedQuiz = { name, questions: quiz };

    const encoded = encodeQuiz(generatedQuiz);
    generatedQuizLink = `${location.href.split("#")[0]}#quiz=${encoded}`;

    $("generated-link").value = generatedQuizLink;
    $("link-result").hidden = false;
    $("link-result").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyQuizLink() {
    try {
        await navigator.clipboard.writeText(generatedQuizLink);
        $("copy-link-btn").textContent = "Copied! ✓";
    } catch {
        $("generated-link").focus();
        $("generated-link").select();
        const copied = document.execCommand("copy");
        $("copy-link-btn").textContent = copied ? "Copied! ✓" : "Select and copy the link";
    }
}

function previewGeneratedQuiz() {
    if (generatedQuiz) {
        startQuiz(generatedQuiz.questions, generatedQuiz.name);
    }
}

async function shareScore() {
    const message =
        `I scored ${lastScore}/${activeQuiz.length} (${lastPercentage}%) on ${quizOwner}'s Friend Quiz! 💙`;

    try {
        if (navigator.share) {
            await navigator.share({ title: "Friend Quiz Results", text: message });
        } else {
            await navigator.clipboard.writeText(message);
            $("share-message").textContent = "Score copied! Paste it into your chat.";
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            $("share-message").textContent = message;
        }
    }
}

// Buttons.
$("start-btn").addEventListener("click", () => startQuiz(myQuiz, "My"));
$("create-btn").addEventListener("click", () => {
    $("creator-form").reset();
    $("link-result").hidden = true;
    $("creator-error").textContent = "";
    buildCreatorForm();
    showScreen("creator-screen");
});
$("create-after-btn").addEventListener("click", () => $("create-btn").click());
$("back-btn").addEventListener("click", previousQuestion);
$("next-btn").addEventListener("click", nextQuestion);
$("finish-btn").addEventListener("click", finishQuiz);
$("review-btn").addEventListener("click", renderReview);
$("restart-btn").addEventListener("click", goHome);
$("review-restart-btn").addEventListener("click", goHome);
$("creator-home-btn").addEventListener("click", goHome);
$("creator-form").addEventListener("submit", createQuiz);
$("copy-link-btn").addEventListener("click", copyQuizLink);
$("test-link-btn").addEventListener("click", previewGeneratedQuiz);
$("share-btn").addEventListener("click", shareScore);

// If someone opens a friend's generated link, load that quiz.
function loadSharedQuiz() {
    if (!location.hash.startsWith("#quiz=")) {
        showScreen("start-screen");
        return;
    }

    try {
        const data = decodeQuiz(location.hash.slice(6));

        if (
            !data ||
            typeof data.name !== "string" ||
            !Array.isArray(data.questions) ||
            data.questions.length !== 10 ||
            !data.questions.every((q) =>
                typeof q.question === "string" &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                q.options.every((option) => typeof option === "string") &&
                Number.isInteger(q.correctIndex) &&
                q.correctIndex >= 0 &&
                q.correctIndex <= 3
            )
        ) {
            throw new Error("Invalid quiz data");
        }

        $("start-btn").textContent = `Take ${data.name}'s Quiz →`;
        $("create-btn").hidden = false;
        $("start-btn").onclick = () => startQuiz(data.questions, data.name);
        showScreen("start-screen");
    } catch {
        history.replaceState(null, "", location.pathname + location.search);
        $("share-message").textContent = "";
        showScreen("start-screen");
    }
}

loadSharedQuiz();
