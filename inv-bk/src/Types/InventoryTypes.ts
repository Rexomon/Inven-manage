import { t } from "elysia";

export const InventoryTypes = t.Object({
	user_id: t.String({ error: "User ID cannot be empty" }),
	username_pembuat: t.String({ error: "Username cannot be empty" }),
	product_id: t.String({ error: "Product ID cannot be empty" }),
	product_name: t.String({ error: "Product name cannot be empty" }),
	quantity: t.Number({ error: "Quantity must be a valid number", minimum: 1 }),
	date_out: t.Date({ error: "Date out must be a valid date" }),
});
