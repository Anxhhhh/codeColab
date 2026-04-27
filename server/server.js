import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"

const app = express();
const httpServer = createServer(app);

app.use(express.json());

    const io = new Server(httpServer, {
        cors:{
            origin:"*",
            methods:["GET", "POST"],
            credentials:true
        }
    })

    io.on('connection', (socket) => {
        console.log("Client connected:", socket.id);
        socket.on('disconnect', () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    const ySocketIO = new  YSocketIO(io);
    ySocketIO.initialize();




app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello World",
        success: true
    })


});

app.get("/health", (req, res) => {

    res.status(200).json({
        message: "OK",
        success: true,

    })

})


httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});
