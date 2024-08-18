import mongoose from "mongoose";

const invenIn = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		username_pembuat: {
			type: String,
			required: true,
		},
		product_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Product",
		},
		product_name: {
			type: String,
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
		},
		date_in: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

const Inventory_In = mongoose.model("Inventory_In", invenIn);
export default Inventory_In;
