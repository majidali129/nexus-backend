import { config } from "./config/env";
import { connectDB } from "./lib/connect-db";
import { httpServer } from "./server";

httpServer.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});


try {
    await connectDB();
} catch (error) {
    console.log('Database connection failed:', error);
}