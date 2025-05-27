import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		name: { type: String, required: true },
		price: { type: Number, required: true },
		brand: { type: String, required: true },
		category: { type: String, required: true },
		countInStock: { type: Number, required: true },
		description: { type: String, required: true },
	},
	{
		timestamps: true,
	},
);

productSchema.index({countInStock: 1})
const SkemaProduk = mongoose.model("product", productSchema);
export default SkemaProduk;
