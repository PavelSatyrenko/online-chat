const server = require("express")()
    .use((req, res) => res.sendFile("/index.html", { root: __dirname }))
    .listen(3000, () => console.log(`Listening on 3000`));
const io = require("socket.io")(server);
const mongo = require("mongodb").MongoClient;

// Connect to MongoDB
mongo.connect(
    "mongodb+srv://zevsp09:Utsz419luXY3FELn@cluster.xqq5msk.mongodb.net/?retryWrites=true&w=majority",
    function (error, db) {
        if (error) {
            throw error;
        }

        console.log("MongoDB connected!");

        // Connect to socket.io
        io.on("connection", (socket) => {
            console.log("A socket connected");

            // Load previous history
            db.db("chat")
                .collection("messages")
                .find()
                .forEach((x) => {
                    socket.emit("chat_history", x);
                });

            // Send a message
            socket.on("send_message", (item) => {
                let id = require("mongodb").ObjectId().str;
                db.db("chat").collection("messages").insertOne({
                    _id: id,
                    sender: item.sender,
                    message: item.message,
                });

                // Update other clients chat history
                io.sockets.emit("get_message", {
                    _id: id,
                    sender: item.sender,
                    message: item.message,
                });
            });
        });
    }
);
