"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sort_1 = require("./routes/sort");
const open_1 = __importDefault(require("open"));
const PORT = process.env.PORT || 8535;
const runApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use('/api/v1/sort', sort_1.sortRouter);
    app.listen(PORT, async () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        await (0, open_1.default)('https://multimedia-sorter.netlify.app/');
    });
};
runApp();
