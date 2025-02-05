import mongoose from "mongoose";

const invenOut = new mongoose.Schema({
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
    category:{
        type: String,
        required: true,
    },
    brand:{
        type: String,
        required: true,
    },
	username_pembuat: {
		type: String,
		required: true,
	},
    alasannya:{
        type: String,
    },
	product_name: {
		type: String,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
	},
	date_out: {
		type: Date,
		required: true,
	},
});

const InventoryOut = mongoose.model("Inventory_Out", invenOut);
export default InventoryOut;
