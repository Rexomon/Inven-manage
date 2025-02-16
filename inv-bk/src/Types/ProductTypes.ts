import { t } from "elysia";

export const ProductTypes = t.Object({
	name: t.String(),
	price: t.Number(),
	brand: t.String(),
	category: t.String(),
	countInStock: t.Number(),
	description: t.String(),
});
