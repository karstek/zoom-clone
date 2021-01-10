//Import express from node modules
const express = require("express");
//Initialize Express
const app = express();
//Import http from node modules and initialize a http express server
const server = require("http").Server(app);
const io = require("socket.io")(server);
//Library to make random ID
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

//Set view engine to ejs
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use("/peerjs", peerServer);
//When server get home page url, response with redirect with uuid
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

//When server get the uuid url, response rendering the room html file
//And also request the param room that is used in the get, who is the uuid in the url
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});

//Server listen on port 3030
server.listen(process.env.PORT || 3030);
