import mongoose from "mongoose";

const invenOut = new mongoose.Schema({
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

const Inventory_Out = mongoose.model("Inventory_Out", invenOut);
export default Inventory_Out;
