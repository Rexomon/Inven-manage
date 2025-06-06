import { Elysia } from "elysia";
import Redis from "../Config/Redis";
import AuthUser from "../Middleware/Auth";
import SkemaProduk from "../Models/productModel";
import InventoryOut from "../Models/Inven_Out";
import InventoryEntry from "../Models/Inven_In";
import InventoryProductLog from "../Models/productLogs";
import { ProductTypes } from "../Types/ProductTypes";

const products = new Elysia({ prefix: "/products" })
	//==Authenticated Routes==
	//Mengambil semua produk
	.use(AuthUser)
	.get("/", async ({ set, user }) => {
		if (!user) {
			set.status = 401;
			return { message: "Unauthorized" };
		}

		try {
			//Memeriksa apakah data ada di cache atau tidak
			const cacheData = await Redis.get("all_products");

			if (cacheData) {
				return { products: JSON.parse(cacheData) };
			}

			//Menyimpan data ke cache
			const products = await SkemaProduk.find();

			await Redis.setex("all_products", 900, JSON.stringify(products));

			set.status = 200;
			return { products };
		} catch (error) {
			set.status = 500;
			console.error(error);
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
				await Redis.del(redisCache);

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
				set.status = 500;
				console.error(error);
			}
		},
		{
			body: ProductTypes,
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
				const userID: string = user.id as string;
				const username: string = user.username as string;

				const searchProduct = await SkemaProduk.findById(id);
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
				await Redis.del(redisCache);

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
				set.status = 500;
				console.error(error);
			}
		},
		{
			body: ProductTypes,
		},
	)
	//Menghapus produk
	.delete("/delete/:id", async ({ params: { id }, user, set }) => {
		if (!user) {
			set.status = 401;
			return { message: "Unauthorized" };
		}

		try {
			const userID: string = user.id as string;
			const username: string = user.username as string;

			const deletedProduct = await SkemaProduk.findByIdAndDelete(id);
			if (!deletedProduct) {
				set.status = 404;
				return { message: "Product not found" };
			}

			await InventoryOut.create({
				user_id: userID,
				username_pembuat: username,
				alasannya: "Dihapus",
				product_id: deletedProduct?.id,
				product_name: deletedProduct?.name,
				category: deletedProduct?.category,
				brand: deletedProduct?.brand,
				quantity: deletedProduct?.countInStock,
				date_out: new Date(),
			});

			//Menghapus data di cache
			const redisCache = ["all_products", "product_summary", "inventory_out"];
			await Redis.del(redisCache);

			set.status = 200;
			return { message: "Product deleted" };
		} catch (error) {
			set.status = 500;
			console.error(error);
		}
	})
	.get("/summary", async ({ set }) => {
		try {
			//Memeriksa apakah data ada di cache atau tidak
			const cachedSummary = await Redis.get("product_summary");

			if (cachedSummary) {
				set.status = 200;
				return { summary: JSON.parse(cachedSummary) };
			}

			//Jika data tidak ada di cache, maka akan diambil dari database
			const productCount = await SkemaProduk.countDocuments();
			const lowStock = await SkemaProduk.find(
				{ countInStock: { $lte: 10 } },
				{ name: 1, countInStock: 1, _id: 0 },
			);
			const outOfStock = await SkemaProduk.find(
				{ countInStock: 0 },
				{ name: 1, countInStock: 1, _id: 0 },
			);

			const summary = { productCount, lowStock, outOfStock };

			//Menyimpan data ke cache
			await Redis.setex("product_summary", 900, JSON.stringify(summary));

			set.status = 200;
			return { summary };
		} catch (error) {
			set.status = 500;
			console.error(error);
		}
	});

export default products;
