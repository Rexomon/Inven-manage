import { t } from "elysia";

export const ProductTypes = t.Object({
	name: t.String({ error: "Product name cannot be empty" }),
	price: t.Number({ error: "Price must be a valid number" }),
	brand: t.String({ error: "Brand cannot be empty" }),
	category: t.String({ error: "Category cannot be empty" }),
	countInStock: t.Number({
		error: "Count in stock must be a valid number",
		minimum: 0,
	}),
	description: t.String({ error: "Description cannot be empty" }),
});
