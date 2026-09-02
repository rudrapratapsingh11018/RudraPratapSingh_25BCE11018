const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend
app.use(express.static("public"));

const PORT = 3000;

// Store rooms
let rooms = {};

// Generate random room code
function generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Admin creates poll
    socket.on("createPoll", ({ question, options }) => {
        const roomCode = generateRoomCode();

        rooms[roomCode] = {
            question,
            options: options.map(opt => ({ text: opt, votes: 0 })),
            participants: 0,
            started: false
        };

        socket.join(roomCode);

        socket.emit("roomCreated", roomCode);
    });

    // Participant joins
    socket.on("joinRoom", (roomCode) => {
        if (!rooms[roomCode]) {
            socket.emit("errorMsg", "Room not found");
            return;
        }

        socket.join(roomCode);
        rooms[roomCode].participants++;

        io.to(roomCode).emit("updateParticipants", rooms[roomCode].participants);

        if (rooms[roomCode].started) {
            socket.emit("startVoting", rooms[roomCode]);
        }
    });

    // Start voting (Admin)
    socket.on("startPoll", (roomCode) => {
        if (!rooms[roomCode]) return;

        rooms[roomCode].started = true;

        io.to(roomCode).emit("startVoting", rooms[roomCode]);
    });

    // Vote
    socket.on("vote", ({ roomCode, optionIndex }) => {
        if (!rooms[roomCode]) return;

        rooms[roomCode].options[optionIndex].votes++;

        io.to(roomCode).emit("updateResults", rooms[roomCode].options);
    });

    // Disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});