import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import UserController from "./Routes/UserControl";
import ProductController from "./Routes/ProductControl";
import InventoryController from "./Routes/InvenControl";
import { safelyCloseRedis } from "./Config/Redis";
import { conToDatabase, safelyCloseMongoDB } from "./Database/DatabaseConn";

await conToDatabase();

// Set up environment variables
const port = Number(Bun.env.PORT) || 3000;
const nodeEnv = Bun.env.NODE_ENV;
const corsDomainOrigin = Bun.env.DOMAIN_ORIGIN;

if (nodeEnv === "production" && !corsDomainOrigin) {
	console.error("DOMAIN_ORIGIN is not set in environment variables");
	process.exit(1);
}

// Initialize Elysia application
const app = new Elysia({ prefix: "/v1" });

if (nodeEnv !== "production") {
	app.use(swagger());
}

app
	.use(
		cors({
			origin: Bun.env.DOMAIN_ORIGIN || "*",
			credentials: true,
			methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type"],
			preflight: true,
			maxAge: 86400,
		}),
	)
	.get("/", async ({ set }) => {
		set.status = 200;
		return { message: "Hai!" };
	})
	.use(UserController)
	.use(ProductController)
	.use(InventoryController)
	.listen(port);

console.log(
	`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);

// Graceful shutdown handling
let isShutDown = false;
const shutdownServer = async (signal: string) => {
	if (isShutDown) return;
	isShutDown = true;

	console.log(`Received ${signal}. Shutting down gracefully...`);
	try {
		await Promise.all([safelyCloseMongoDB(), safelyCloseRedis(), app.stop()]);
		console.log("Elysia server closed safely");
		process.exit(0);
	} catch (error) {
		console.error(`Error during shutdown: ${error}`);
	}
};

const closeSignals = ["SIGINT", "SIGTERM", "SIGQUIT", "SIGHUP"];
for (const signalType of closeSignals) {
	process.on(signalType, () => shutdownServer(signalType));
}
