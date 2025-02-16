import { t } from "elysia";

export const InventoryOutTypes = t.Object({
	user_id: t.String(),
	username_pembuat: t.String(),
	product_id: t.String(),
	product_name: t.String(),
	quantity: t.Number(),
	date_out: t.String(),
});
