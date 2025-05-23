import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import conToDatabase from "./Database/DatabaseConn";
import inventory from "./Routes/InvenControl";
import products from "./Routes/ProductControl";
import userHandling from "./Routes/UserHandling";

conToDatabase();

const app = new Elysia()
	.use(
		cors({
			origin: Bun.env.DOMAIN_ORIGIN,
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
