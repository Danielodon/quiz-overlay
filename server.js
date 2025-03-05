const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Erlaubt alle Domains
  },
});

app.use(cors());

let currentQuestion = "Warte auf die erste Frage...";

io.on("connection", (socket) => {
  console.log("Ein Benutzer ist verbunden");

  // Sende die aktuelle Frage an neue Clients
  socket.emit("updateQuestion", { question: currentQuestion });

  // Admin kann eine neue Frage senden
  socket.on("nextQuestion", (data) => {
    currentQuestion = data.question;
    io.emit("updateQuestion", { question: currentQuestion });
  });

  socket.on("disconnect", () => {
    console.log("Ein Benutzer hat die Verbindung getrennt");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));