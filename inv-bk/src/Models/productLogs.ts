import mongoose from "mongoose";

const productLogs = new mongoose.Schema(
	{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Product",
		},
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        username: {
            type: String,
            required: true,
        },
        category:{
            type: String,
            required: true,
        },
        brand:{
            type: String,
            required: true,
        },
		change_type: {
			type: String,
			required: true,
		},
		product_name: {
			type: String,
			required: true,
		},
		quantity_change: {
			type: Number,
			required: true,
		},
		date_change: {
			type: Date,
			required: true,
		},
	},
);

const InventoryProductLog = mongoose.model("Product-Logs", productLogs);
export default InventoryProductLog;
