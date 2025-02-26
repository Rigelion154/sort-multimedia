import express from 'express';
import cors from 'cors'
import {sortRouter} from "./routes/sort";

const PORT = process.env.PORT || 8535;

const runApp = () => {
    const app = express();
    app.use(express.json())
    app.use(cors())
    app.use('/api/v1/sort', sortRouter)
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

runApp()