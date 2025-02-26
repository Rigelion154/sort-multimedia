import express from 'express';

const PORT = process.env.PORT || 8535;

const runApp = () => {
    const app = express();
    // app.use(cors())
    app.use(express.json())

    app.get('/', (req, res) => {
        res.send('Hello, TypeScript with Express!');
    });

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

runApp()