// connect to socket server
const socket = io();

// get elements
const joinBtn = document.getElementById("joinBtn");
const voteContainer = document.getElementById("voteContainer");
const resultsContainer = document.getElementById("resultsContainer");

// join room
if (joinBtn) {
    joinBtn.addEventListener("click", () => {
        const roomCode = document.getElementById("roomCode").value;

        if (roomCode.trim() === "") {
            alert("Enter room code");
            return;
        }

        // join room
        socket.emit("joinRoom", roomCode);
    });
}

// receive poll data from server
socket.on("pollData", (data) => {
    voteContainer.innerHTML = "";

    const question = document.createElement("h2");
    question.innerText = data.question;
    voteContainer.appendChild(question);

    // create options
    data.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.innerText = option;
        btn.className = "option-btn";

        // vote click
        btn.onclick = () => {
            socket.emit("vote", {
                room: data.room,
                optionIndex: index
            });
        };

        voteContainer.appendChild(btn);
    });
});

// receive results update
socket.on("updateResults", (data) => {
    resultsContainer.innerHTML = "<h3>Results</h3>";

    data.options.forEach((opt, i) => {
        const p = document.createElement("p");
        p.innerText = `${opt} : ${data.votes[i]} votes`;
        resultsContainer.appendChild(p);
    });
});