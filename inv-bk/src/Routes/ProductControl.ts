import { Elysia } from "elysia";
import Redis from "../Config/Redis";
import AuthUser from "../Middleware/Auth";
import ProductModel from "../Models/ProductModel";
import InventoryOut from "../Models/Inven_Out";
import InventoryEntry from "../Models/Inven_In";
import InventoryProductLog from "../Models/ProductLogs";
import { ProductTypes } from "../Types/ProductTypes";

const Products = new Elysia({ prefix: "/products" })

	.get("/summary", async ({ set }) => {
		try {
			//Memeriksa apakah data ada di cache atau tidak
			const cachedSummary = await Redis.get("product_summary");

			if (cachedSummary) {
				set.status = 200;
				return { summary: JSON.parse(cachedSummary) };
			}

			//Jika data tidak ada di cache, maka akan diambil dari database
			const [productCount, lowStock, outOfStock] = await Promise.all([
				ProductModel.countDocuments(),

				ProductModel.find(
					{ countInStock: { $lte: 10 } },
					{ name: 1, countInStock: 1, _id: 0 },
				),

				ProductModel.find(
					{ countInStock: 0 },
					{ name: 1, countInStock: 1, _id: 0 },
				),
			]);

			const summary = { productCount, lowStock, outOfStock };

			//Menyimpan data ke cache
			await Redis.setex("product_summary", 900, JSON.stringify(summary));

			set.status = 200;
			return { summary };
		} catch (error) {
			set.status = 500;
			console.error(error);
		}
	})

	//==Authenticated Routes==
	//Mengambil semua produk
	.use(AuthUser)
	.get("/", async ({ set }) => {
		try {
			//Memeriksa apakah data ada di cache atau tidak
			const cacheData = await Redis.get("all_products");

			if (cacheData) {
				return { products: JSON.parse(cacheData) };
			}

			//Menyimpan data ke cache
			const products = await ProductModel.find();

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
			try {
				const { name, price, brand, category, countInStock, description } =
					body;
				const userID = user.id;
				const username = user.username;

				//Menambahkan data ke tabel SkemaProduk
				const product = await ProductModel.create({
					user_id: userID,
					name,
					price,
					brand,
					category,
					countInStock,
					description,
				});

				const redisCache = ["all_products", "product_summary", "inventory_in"];

				await Promise.all([
					InventoryEntry.create({
						user_id: userID,
						username_pembuat: username,
						product_id: product._id,
						product_name: product.name,
						category: product.category,
						brand: product.brand,
						quantity: product.countInStock,
						date_in: new Date(),
					}),

					Redis.del(...redisCache),
				]);

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
			try {
				const userID = user.id;
				const username = user.username;

				const [originalProduct, updatedProduct] = await Promise.all([
					ProductModel.findById(id),

					ProductModel.findByIdAndUpdate(id, body, {
						new: true,
					}),
				]);

				if (!originalProduct || !updatedProduct) {
					set.status = 404;
					return { message: "Product not found" };
				}

				const stockBeforeUpdate = originalProduct.countInStock;

				const stockAfterUpdate = updatedProduct.countInStock;

				const changeType =
					stockBeforeUpdate < stockAfterUpdate ? "Penambahan" : "Pengurangan";

				//Perkondisian membandingkan jumlah persediaan barang
				if (stockBeforeUpdate !== stockAfterUpdate) {
					const quantityChange = Math.abs(stockAfterUpdate - stockBeforeUpdate);

					await InventoryProductLog.create({
						user_id: userID,
						username: username,
						product_id: updatedProduct.id,
						product_name: updatedProduct.name,
						category: updatedProduct.category,
						brand: updatedProduct.brand,
						change_type: changeType,
						quantity_change: quantityChange,
						date_change: new Date(),
					});

					if (changeType === "Penambahan") {
						await InventoryEntry.create({
							user_id: userID,
							username_pembuat: username,
							product_id: updatedProduct.id,
							product_name: updatedProduct.name,
							category: updatedProduct.category,
							brand: updatedProduct.brand,
							quantity: quantityChange,
							date_in: new Date(),
						});
					}

					if (changeType === "Pengurangan") {
						await InventoryOut.create({
							user_id: userID,
							username_pembuat: username,
							product_id: updatedProduct.id,
							product_name: updatedProduct.name,
							category: updatedProduct.category,
							brand: updatedProduct.brand,
							quantity: quantityChange,
							date_out: new Date(),
						});
					}
				}

				const redisCache = ["all_products", "product_summary", "stock_change"];

				if (changeType === "Pengurangan") {
					redisCache.push("inventory_out");
				}

				if (changeType === "Penambahan") {
					redisCache.push("inventory_in");
				}

				await Redis.del(...redisCache);

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
		try {
			const userID = user.id;
			const username = user.username;

			const deletedProduct = await ProductModel.findByIdAndDelete(id);
			if (!deletedProduct) {
				set.status = 404;
				return { message: "Product not found" };
			}

			const redisCache = ["all_products", "product_summary", "inventory_out"];

			await Promise.all([
				InventoryOut.create({
					user_id: userID,
					username_pembuat: username,
					alasannya: "Dihapus",
					product_id: deletedProduct.id,
					product_name: deletedProduct.name,
					category: deletedProduct.category,
					brand: deletedProduct.brand,
					quantity: deletedProduct.countInStock,
					date_out: new Date(),
				}),

				//Menghapus data di cache
				Redis.del(...redisCache),
			]);

			set.status = 200;
			return { message: "Product deleted" };
		} catch (error) {
			set.status = 500;
			console.error(error);
		}
	});

export default Products;
