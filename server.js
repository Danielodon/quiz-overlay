const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

let questions = [];
let currentQuestionIndex = 0;
let scores = {}; // Speichert die Punkte pro Spieler

// Fragen aus Datei laden
function loadQuestions() {
    const data = fs.readFileSync("questions.json", "utf-8");
    questions = JSON.parse(data);
}

// Aktuelle Frage abrufen
function getCurrentQuestion() {
    return questions[currentQuestionIndex] || null;
}

// Nächste Frage setzen
function nextQuestion() {
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    return getCurrentQuestion();
}

// Fragen beim Start laden
loadQuestions();

// API für aktuelle Frage
app.get("/api/quiz", (req, res) => {
    res.json(getCurrentQuestion());
});

// API für Scoreboard
app.get("/api/scoreboard", (req, res) => {
    res.json(scores);
});

// WebSocket für Echtzeit-Updates
io.on("connection", (socket) => {
    console.log("Neuer Client verbunden");

    socket.emit("updateQuestion", getCurrentQuestion());
    socket.emit("updateScoreboard", scores);

    socket.on("nextQuestion", () => {
        const newQuestion = nextQuestion();
        io.emit("updateQuestion", newQuestion);
    });

    socket.on("answer", (data) => {
        const { player, answer } = data;
        const correctAnswer = getCurrentQuestion().correct;

        if (answer === correctAnswer) {
            scores[player] = (scores[player] || 0) + 1;
        } else {
            scores[player] = (scores[player] || 0);
        }

        io.emit("updateScoreboard", scores);
    });

    socket.on("disconnect", () => {
        console.log("Client getrennt");
    });
});

// Server starten
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
