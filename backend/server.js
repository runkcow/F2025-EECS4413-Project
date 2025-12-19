
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import cartService from "./controller/CartService.js";
import catalogService from "./controller/CatalogService.js";
import orderingService from "./controller/OrderingService.js";
import userService from "./controller/UserService.js";

dotenv.config();

const app = express();
const PORT = 80;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json()); // parse JSON bodies

app.use("/api", cartService);
app.use("/api", catalogService);
app.use("/api", orderingService);
app.use("/api", userService);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`) 
});
