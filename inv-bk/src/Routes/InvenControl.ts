import { Elysia, t } from "elysia";
import type { JwtPayload } from "jsonwebtoken";
import AuthUser from "../Middleware/Auth";
import Inventory_In from "../Models/Inven_In";
import Inventory_Out from "../Models/Inven_Out";
import ProductChange from "../Models/stockChange";

export const inventory = new Elysia({ prefix: "/inventory" })
	.use(AuthUser)
	//Barang masuk
	.get("/in", async ({ user, set }) => {
		try {
			if (!user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			const invenIn = await Inventory_In.find();

			set.status = 200;
			return { invenIn };
		} catch (error) {
			return { message: error };
		}
	})
	//Barang keluar
	.get("/out", async ({ user, set }) => {
		try {
			if (!user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			const invenOut = await Inventory_Out.find();

			set.status = 200;
			return { invenOut };
		} catch (error) {
			return { message: error };
		}
	})
	//Log perubahan stok
	.get("/logs", async ({ user, set }) => {
		try {
			if (!user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			const stockChange = await ProductChange.find();

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
			const { product_id, product_name, quantity } = body;
			if (!user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			try {
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
				quantity: t.String(),
				date_out: t.String(),
			}),
		},
	);

export default inventory;
