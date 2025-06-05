import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import products from "./Routes/ProductControl";
import inventory from "./Routes/InvenControl";
import userHandling from "./Routes/UserHandling";
import { safelyCloseRedis } from "./Config/Redis";
import conToDatabase, { safelyCloseMongoDB } from "./Database/DatabaseConn";

await conToDatabase();

// Set up environment variables
const nodeEnv = Bun.env.NODE_ENV;
const corsDomainOrigin = Bun.env.DOMAIN_ORIGIN;

if (nodeEnv === "production" && !corsDomainOrigin) {
	console.error("DOMAIN_ORIGIN is not set in environment variables");
	process.exit(1);
}

// Initialize Elysia application
const app = new Elysia();

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
	.use(userHandling)
	.use(products)
	.use(inventory)
	.listen(3000);

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
		await Promise.all([
			safelyCloseMongoDB(),
			safelyCloseRedis(),
			app.server?.stop(true),
		]);
		console.log("Elysia server closed safely");
	} catch (error) {
		console.error(`Error during shutdown: ${error}`);
	}
};

const closeSignals = ["SIGINT", "SIGTERM", "SIGQUIT", "SIGHUP"];
for (const signalType of closeSignals) {
	process.on(signalType, () => shutdownServer(signalType));
}
