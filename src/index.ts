import { config } from "./config/env";
import { connectDB } from "./lib/connect-db";
import { httpServer } from "./server";


// ✅ 1. Connect to database first
try {
    await connectDB();
} catch (error) {
    console.log('Database connection failed:', error);
}


// ✅ 2. Initialize Socket.io (imports lib/socket.ts)
import "./lib/socket";

// ✅ 3. Register event listeners (imports events/listeners/index.ts)
import "./events/listeners"

httpServer.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});