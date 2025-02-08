import { Elysia, t } from "elysia";
import redis from "../Config/Redis";
import AuthUser from "../Middleware/Auth";
import InventoryEntry from "../Models/Inven_In";
import InventoryOut from "../Models/Inven_Out";
import InventoryProductLog from "../Models/productLogs";
import SkemaProduk from "../Models/productModel";

const products = new Elysia({ prefix: "/products" })
	.use(AuthUser)
	//Mengambil semua produk
	.get("/", async ({ set, user }) => {
		if (!user) {
			set.status = 401;
			return { message: "Unauthorized" };
		}

		try {
			//Memeriksa apakah data ada di cache atau tidak
			const cacheData = await redis.get("all_products");

			if (cacheData) {
				return { products: JSON.parse(cacheData) };
			}

			//Menyimpan data ke cache
			const products = await SkemaProduk.find();

			await redis.set("all_products", JSON.stringify(products), "EX", 900);

			set.status = 200;
			return { products };
		} catch (error) {
			set.status = 400;
			return { message: error };
		}
	})
	//Membuat produk baru
	.post(
		"/create",
		async ({ body, user, set }) => {
			if (!user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			try {
				const { name, price, brand, category, countInStock, description } =
					body;
				const userID: string = user.id as string;
				const username: string = user.username as string;

				//Menambahkan data ke tabel SkemaProduk
				const product = await SkemaProduk.create({
					user_id: userID,
					name,
					price,
					brand,
					category,
					countInStock,
					description,
				});

				//Menghapus data di cache
				const redisCache = ["all_products", "product_summary", "inventory_in"];
				await redis.del(redisCache);

				//Menambahkan data ke tabel Inventory_In
				await InventoryEntry.create({
					user_id: userID,
					username_pembuat: username,
					product_id: product?._id,
					product_name: product?.name,
					category: product?.category,
					brand: product?.brand,
					quantity: product?.countInStock,
					date_in: new Date(),
				});
				set.status = 201;
				return { message: "Product created" };
			} catch (error) {
				set.status = 400;
				return { message: error };
			}
		},
		{
			body: t.Object({
				name: t.String(),
				price: t.Number(),
				brand: t.String(),
				category: t.String(),
				countInStock: t.Number(),
				description: t.String(),
			}),
		},
	)
	//Mengupdate produk
	.patch(
		"/update/:id",
		async ({ params: { id }, body, user, set }) => {
			if (!user) {
				set.status = 401;
				return { message: "Unauthorized" };
			}

			try {
				const searchProduct = await SkemaProduk.findById(id);
				const userID: string = user.id as string;
				const username: string = user.username as string;

				if (!searchProduct) {
					set.status = 404;
					return { message: "Product not found" };
				}

				const stockSebelumUpdate = searchProduct?.countInStock as number;

				const updateProduct = await SkemaProduk.findByIdAndUpdate(
					searchProduct,
					body,
					{ new: true },
				);

				const redisCache = [
					"all_products",
					"product_summary",
					"inventory_in",
					"inventory_out",
					"stock_change",
				];
				await redis.del(redisCache);

				const stockSetelahUpdate = updateProduct?.countInStock as number;

				//Perkondisian membandingkan jumlah persediaan barang
				if (stockSebelumUpdate !== stockSetelahUpdate) {
					const changeType =
						stockSebelumUpdate < stockSetelahUpdate
							? "Penambahan"
							: "Pengurangan";
					const quantityChange = Math.abs(
						stockSetelahUpdate - stockSebelumUpdate,
					);

					//Membuat log ketika ada perubahan pada jumlah produk
					await InventoryProductLog.create({
						user_id: userID,
						username: username,
						product_id: updateProduct?.id,
						product_name: updateProduct?.name,
						category: updateProduct?.category,
						brand: updateProduct?.brand,
						change_type: changeType,
						quantity_change: quantityChange,
						date_change: new Date(),
					});

					//Jika persediaan bertambah, maka akan menambahkan data ke tabel Inventory_In
					if (changeType === "Penambahan") {
						await InventoryEntry.create({
							user_id: userID,
							username_pembuat: username,
							product_id: updateProduct?.id,
							product_name: updateProduct?.name,
							category: updateProduct?.category,
							brand: updateProduct?.brand,
							quantity: quantityChange,
							date_in: new Date(),
						});
					}

					//Jika persediaan berkurang, maka akan menambahkan data ke tabel Inventory_Out
					if (changeType === "Pengurangan") {
						await InventoryOut.create({
							user_id: userID,
							username_pembuat: username,
							product_id: updateProduct?.id,
							product_name: updateProduct?.name,
							category: updateProduct?.category,
							brand: updateProduct?.brand,
							quantity: quantityChange,
							date_out: new Date(),
						});
					}
				}
				set.status = 200;
				return { message: "Product updated" };
			} catch (error) {
				return { message: error };
			}
		},
		{
			body: t.Object({
				name: t.String(),
				price: t.Number(),
				brand: t.String(),
				category: t.String(),
				countInStock: t.Number(),
				description: t.String(),
			}),
		},
	)
	//Menghapus produk
	.delete("/delete/:id", async ({ params: { id }, user, set }) => {
		if (!user) {
			set.status = 401;
			return { message: "Unauthorized" };
		}

		try {
			const searchProduct = await SkemaProduk.findById(id);

			const deletedProduct = await SkemaProduk.findByIdAndDelete(searchProduct);

			const userID: string = user.id as string;
			const username: string = user.username as string;

			if (deletedProduct) {
				await InventoryOut.create({
					user_id: userID,
					username_pembuat: username,
					alasannya: "Dihapus",
					product_id: searchProduct?.id,
					product_name: searchProduct?.name,
					category: searchProduct?.category,
					brand: searchProduct?.brand,
					quantity: searchProduct?.countInStock,
					date_out: new Date(),
				});
			}

			//Menghapus data di cache
			const redisCache = ["all_products", "product_summary", "inventory_out"];
			await redis.del(redisCache);

			set.status = 200;
			return { message: "Product deleted" };
		} catch (error) {
			set.status = 400;
			return { message: error };
		}
	})
	.get("/summary", async ({ set }) => {
		try {
			//Memeriksa apakah data ada di cache atau tidak
			const cachedSummary = await redis.get("product_summary");

			if (cachedSummary) {
				set.status = 200;
				return { summary: JSON.parse(cachedSummary) };
			}

			//Jika data tidak ada di cache, maka akan diambil dari database
			const productCount = await SkemaProduk.countDocuments();
			const lowStock = await SkemaProduk.find({ countInStock: { $lt: 10 } });
			const outOfStock = await SkemaProduk.find({ countInStock: 0 });

			const summary = { productCount, lowStock, outOfStock };

			//Menyimpan data ke cache
			await redis.set("product_summary", JSON.stringify(summary), "EX", 900);

			set.status = 200;
			return { summary };
		} catch (error) {
			set.status = 400;
			return { message: error };
		}
	});

export default products;
