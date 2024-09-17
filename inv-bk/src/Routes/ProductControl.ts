import { Elysia, t } from "elysia";
import AuthUser from "../Middleware/Auth";
import SkemaProduk from "../Models/productModel";
import ProductChange from "../Models/stockChange";
import Inventory_In from "../Models/Inven_In";
import Inventory_Out from "../Models/Inven_Out";
import redis from "../Config/Redis";
import type { JwtPayload } from "jsonwebtoken";

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

			//Jika data tidak ada di cache, maka akan diambil dari
			const products = await SkemaProduk.find();

			//Menyimpan data ke cache
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

				//Menambahkan data ke tabel SkemaProduk
				const userID = (user as JwtPayload).id;
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
				await redis.del("all_products");
				await redis.del("product_summary");
				await redis.del("inventory_in");

				//Menambahkan data ke tabel Inventory_In
				await Inventory_In.create({
					user_id: userID,
					username_pembuat: (user as JwtPayload).username,
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

				if (!searchProduct) {
					set.status = 404;
					return { message: "Product not found" };
				}

				//Mengambil data persediaan sebelum diperbarui
				const stockSebelumUpdate = searchProduct?.countInStock as number;

				//Memperbarui data di tabel SkemaProduk
				const updateProduct = await SkemaProduk.findByIdAndUpdate(
					searchProduct,
					body,
					{ new: true },
				);

				//Menghapus data di cache agar data yang di cache bisa diperbarui
				await redis.del("all_products");
				await redis.del("product_summary");
				await redis.del("inventory_in");
				await redis.del("inventory_out");
				await redis.del("stock_change");

				//Mengambil data persediaan setelah diperbarui
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
					await ProductChange.create({
						user_id: (user as JwtPayload).id,
						username: (user as JwtPayload).username,
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
						await Inventory_In.create({
							user_id: (user as JwtPayload).id,
							username_pembuat: (user as JwtPayload).username,
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
						await Inventory_Out.create({
							user_id: (user as JwtPayload).id,
							username_pembuat: (user as JwtPayload).username,
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
				// 			/////////////////////////////////////////////////////////////////////////////////////////////////////////
				// 			// Juga bisa menggunakan if seperti ini, tapi lebih baik menggunakan if di atas agar lebih efisien
				// 			/////////////////////////////////////////////////////////////////////////////////////////////////////////
				// 			// if (stockSebelumUpdate < stockSetelahUpdate) {
				// 			// 	await ProductChange.create({
				// 			// 		product_id: updateProduct?.id,
				// 			// 		product_name: updateProduct?.name,
				// 			//         change_type:"Penambahan",
				// 			// 		quantity_change: stockSetelahUpdate - stockSebelumUpdate,
				// 			// 		date_change: new Date(),
				// 			// 	});
				// 			//     return res.status(200).json({ message: "Logs Created"});
				// 			// }

				// 			// if (stockSebelumUpdate > stockSetelahUpdate) {
				// 			// 	await ProductChange.create({
				// 			// 		product_id: updateProduct?.id,
				// 			// 		product_name: updateProduct?.name,
				// 			//         change_type:"Pengurangan",
				// 			// 		quantity_change: stockSebelumUpdate - stockSetelahUpdate,
				// 			// 		date_change: new Date(),
				// 			// 	});
				// 			//     return res.status(200).json({ message: "Logs Created"});
				// 			// }
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

			const menghapus = await SkemaProduk.findByIdAndDelete(searchProduct);

			if (menghapus) {
				await Inventory_Out.create({
					user_id: (user as JwtPayload).id,
					username_pembuat: (user as JwtPayload).username,
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
			await redis.del("all_products");
			await redis.del("product_summary");
			await redis.del("inventory_out");

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
