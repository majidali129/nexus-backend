import mongoose, { ConnectOptions } from 'mongoose'
import { config } from '@/config/env';



const connOptions: ConnectOptions = {
    dbName: config.DB_NAME,
    appName: config.APP_NAME,
}

export const connectDB = async () => {

    try {
        const connectionInstance = await mongoose.connect(config.DATABASE_URI, connOptions);
        console.log(`Connected to database🚀 at: `, {
            ...connOptions,
            host: connectionInstance.connection.host,
            port: connectionInstance.connection.port,
            uri: config.DATABASE_URI
        });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}