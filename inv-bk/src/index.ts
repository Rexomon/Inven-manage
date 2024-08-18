import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import conToDatabase from "./Database/DatabaseConn";
import cors from "@elysiajs/cors";
import inventory from "./Routes/InvenControl";
import userHandling from "./Routes/UserHandling";
import products from "./Routes/ProductControl";

conToDatabase();

const corsOption = {
	origin: "https://inventory.riylunz.website",
	credentials: true,
};

const app = new Elysia()
	.use(cors(corsOption)) //Memanggil Cors
	.use(userHandling) //Memanggil userHandling
	.use(products) //Memanggil product
	.use(inventory) //Memanggil inventory
	.use(swagger()) //Memanggil Swagger
	.listen(3000);

console.log(
	`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`,
);
