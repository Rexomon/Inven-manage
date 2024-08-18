import mongoose from "mongoose";

const stockChange = new mongoose.Schema(
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

const ProductChange = mongoose.model("Product-Logs", stockChange);
export default ProductChange;
