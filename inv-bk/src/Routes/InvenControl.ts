import { Elysia } from "elysia";
import Redis from "../Config/Redis";
import AuthUser from "../Middleware/Auth";
import InventoryOut from "../Models/Inven_Out";
import InventoryEntry from "../Models/Inven_In";
import InventoryProductLog from "../Models/ProductLogs";
import { InventoryTypes } from "../Types/InventoryTypes";

const Inventory = new Elysia({ prefix: "/inventory" })

	//==Authenticated Routes==
	//Barang masuk
	.use(AuthUser)
	.get("/in", async ({ set }) => {
		try {
			const cacheInventoryIn = await Redis.get("inventory_in");

			if (cacheInventoryIn) {
				return { invenIn: JSON.parse(cacheInventoryIn) };
			}

			const invenIn = await InventoryEntry.find();

			await Redis.setex("inventory_in", 900, JSON.stringify(invenIn));

			set.status = 200;
			return { invenIn };
		} catch (error) {
			set.status = 500;
			console.error(error);
		}
	})
	//Barang keluar
	.get("/out", async ({ set }) => {
		try {
			const cacheInventoryOut = await Redis.get("inventory_out");

			if (cacheInventoryOut) {
				return { invenOut: JSON.parse(cacheInventoryOut) };
			}

			const invenOut = await InventoryOut.find();

			await Redis.setex("inventory_out", 900, JSON.stringify(invenOut));

			set.status = 200;
			return { invenOut };
		} catch (error) {
			set.status = 500;
			console.error(error);
		}
	})
	//Log perubahan stok
	.get("/logs", async ({ set }) => {
		try {
			const cacheProductLog = await Redis.get("stock_change");

			if (cacheProductLog) {
				return { stockChange: JSON.parse(cacheProductLog) };
			}

			const stockChange = await InventoryProductLog.find();

			await Redis.setex("stock_change", 900, JSON.stringify(stockChange));

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
			try {
				const { product_id, product_name, quantity } = body;
				const userID = user.id;
				const username = user.username;

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
			body: InventoryTypes,
		},
	);

export default Inventory;
