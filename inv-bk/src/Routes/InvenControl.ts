import { Elysia } from "elysia";
import redis from "../Config/Redis";
import AuthUser from "../Middleware/Auth";
import InventoryEntry from "../Models/Inven_In";
import InventoryOut from "../Models/Inven_Out";
import InventoryProductLog from "../Models/productLogs";
import { InventoryOutTypes } from "../Types/InventoryTypes";

const inventory = new Elysia({ prefix: "/inventory" })
	.use(AuthUser)
	//Barang masuk
	.get("/in", async ({ user, set }) => {
		if (!user) {
			set.status = 401;
			return { message: "Unauthorized" };
		}

		try {
			const cacheDataIn = await redis.get("inventory_in");

			if (cacheDataIn) {
				return { invenIn: JSON.parse(cacheDataIn) };
			}

			const invenIn = await InventoryEntry.find();

			await redis.set("inventory_in", JSON.stringify(invenIn), "EX", 900);

			set.status = 200;
			return { invenIn };
		} catch (error) {
			set.status = 500;
			console.error(error);
		}
	})
	//Barang keluar
	.get("/out", async ({ user, set }) => {
		if (!user) {
			set.status = 401;
			return { message: "Unauthorized" };
		}

		try {
			const cacheDataOut = await redis.get("inventory_out");

			if (cacheDataOut) {
				return { invenOut: JSON.parse(cacheDataOut) };
			}

			const invenOut = await InventoryOut.find();

			await redis.set("inventory_out", JSON.stringify(invenOut), "EX", 900);

			set.status = 200;
			return { invenOut };
		} catch (error) {
			set.status = 500;
			console.error(error);
		}
	})
	//Log perubahan stok
	.get("/logs", async ({ user, set }) => {
		if (!user) {
			set.status = 401;
			return { message: "Unauthorized" };
		}

		try {
			const cacheProductLog = await redis.get("stock_change");

			if (cacheProductLog) {
				return { stockChange: JSON.parse(cacheProductLog) };
			}

			const stockChange = await InventoryProductLog.find();

			await redis.set("stock_change", JSON.stringify(stockChange), "EX", 900);

			set.status = 200;
			return { stockChange };
		} catch (error) {
			set.status = 500;
			console.error(error);
		}
	})
	//Membuat barang keluar secara manual
	.post(
		"/out",
		async ({ user, body, set }) => {
			if (!user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			try {
				const { product_id, product_name, quantity } = body;
				const userID: string = user.id as string;
				const username: string = user.username as string;

				await InventoryOut.create({
					user_id: userID,
					username_pembuat: username,
					product_id,
					product_name,
					quantity,
					date_out: new Date(),
				});

				set.status = 201;
				return { message: "Inventory out created" };
			} catch (error) {
				set.status = 500;
				console.error(error);
			}
		},
		{
			body: InventoryOutTypes,
		},
	);

export default inventory;
