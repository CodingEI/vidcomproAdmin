import "dotenv/config";
import express from "express";
import configViewEngine from "./config/configEngine.js";
import routes from "./routes/web.js";
import cronJobController from "./controllers/cronJobController.js";
import socketIoController from "./controllers/socketIoController.js";
import cookieParser from "cookie-parser";
import http from "http";
import session from "express-session";
import { Server } from "socket.io";
import { exec } from "child_process"; // Add this to use child_process

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);
app.use(cookieParser());
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// setup viewEngine
configViewEngine(app);
// init Web Routes
routes.initWebRouter(app);

// Cron game 1 Phut
cronJobController.cronJobGame1p(io);

// Check xem ai connect vào sever
socketIoController.sendMessageAdmin(io);

// Route to handle PHP file execution
app.get("/index.php", (req, res) => {
  // Use exec to run PHP through command line
  exec("php ./src/views/index.php", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send("Internal Server Error");
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).send("PHP Error");
    }
    res.send(stdout); // Send the output of PHP script back to the browser
  });
});

// Optional: Fallback 404 route, if all else fails
// app.all('*', (req, res) => {
//     return res.render("404.ejs");
// });

server.listen(port, () => {
  console.log(`Connected success http://localhost:${port}`);
});
