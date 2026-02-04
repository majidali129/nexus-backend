
import express from 'express'
import { createServer } from 'node:http'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { CorsOptions } from 'cors';
import { config } from './config/env';
import { appRouter } from './routes';
import { globalErrorHandler } from './middlewares/global-error-handler';


const app = express();
const httpServer = createServer(app);

const corsOptions: CorsOptions = {
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests or API testing tools)
        };
        if (config.ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        };

        throw new Error(`CORS ERROR: Origin ${origin} is not allowed by the CORS policy`)
    },
}

app.use(cors(corsOptions)).use(cookieParser()).use(morgan('dev')).use(express.json()).use(express.urlencoded({ extended: true }));


app.get('/health', (_, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Server is healthy'
    });
});

// App routes
app.use('/api', appRouter);


// Global error handler
app.use(globalErrorHandler);

export { app, httpServer };