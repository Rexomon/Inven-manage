import { Elysia, t } from "elysia";
import type { JwtPayload } from "jsonwebtoken";
import redis from "../Config/Redis";
import AuthUser from "../Middleware/Auth";
import Inventory_In from "../Models/Inven_In";
import Inventory_Out from "../Models/Inven_Out";
import ProductChange from "../Models/stockChange";

export const inventory = new Elysia({ prefix: "/inventory" })
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

			const invenIn = await Inventory_In.find();

			await redis.set("inventory_in", JSON.stringify(invenIn), "EX", 900);

			set.status = 200;
			return { invenIn };
		} catch (error) {
			return { message: error };
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

			const invenOut = await Inventory_Out.find();

			await redis.set("inventory_out", JSON.stringify(invenOut), "EX", 900);

			set.status = 200;
			return { invenOut };
		} catch (error) {
			return { message: error };
		}
	})
	//Log perubahan stok
	.get("/logs", async ({ user, set }) => {
		if (!user) {
			set.status = 401;
			return { message: "Unauthorized" };
		}

		try {
			const cacheStockChange = await redis.get("stock_change");

			if (cacheStockChange) {
				return { stockChange: JSON.parse(cacheStockChange) };
			}

			const stockChange = await ProductChange.find();

			await redis.set("stock_change", JSON.stringify(stockChange), "EX", 900);

			set.status = 200;
			return { stockChange };
		} catch (error) {
			return { message: error };
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

				await Inventory_Out.create({
					user_id: (user as JwtPayload).id,
					username_pembuat: (user as JwtPayload).username,
					product_id,
					product_name,
					quantity,
					date_out: new Date(),
				});

				set.status = 201;
				return { message: "Inventory out created" };
			} catch (error) {
				set.status = 400;
				return { message: error };
			}
		},
		{
			body: t.Object({
				user_id: t.String(),
				username_pembuat: t.String(),
				product_id: t.String(),
				product_name: t.String(),
				quantity: t.Number(),
				date_out: t.String(),
			}),
		},
	);

export default inventory;
