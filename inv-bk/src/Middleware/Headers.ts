import { Elysia } from "elysia";

const Headers = new Elysia().onRequest(({ set }) => {
	set.headers = {
		"x-xss-protection": "1; mode=block",
		"x-content-type-options": "nosniff",
		"x-frame-options": "DENY",
		"content-security-policy": "default-src 'self'",
		"strict-transport-security": "max-age=31536000; includeSubDomains; preload",
		"upgrade-insecure-requests": "1",
    "access-control-allow-origin": Bun.env.DOMAIN_ORIGIN as string,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "Content-Type, Authorization",
	};
});

export default Headers;
