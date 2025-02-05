import mongoose from "mongoose";

const invenIn = new mongoose.Schema(
	{
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		product_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Product",
		},
		username_pembuat: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
		brand: {
			type: String,
			required: true,
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
	}
);

const InventoryEntry = mongoose.model("Inventory_In", invenIn);
export default InventoryEntry;
