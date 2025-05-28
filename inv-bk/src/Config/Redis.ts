import Redis from "ioredis";

const RedisPort = process.env.REDIS_PORT;

if (!RedisPort) {
	console.error("REDIS_PORT is not set in environment variables");
	process.exit(1);
}

const redis = new Redis(RedisPort, {
	maxRetriesPerRequest: null,
	enableReadyCheck: true,
	connectTimeout: 10000,
});

export const safelyCloseRedis = async () => {
	try {
		await redis.quit();
		console.log("Redis connection closed safely.");
	} catch (error) {
		console.error("Error closing Redis connection:", error);
	}
};

redis.on("connect", () => {
	console.log("Redis Connected");
});

redis.on("error", (error) => {
	console.log("Redis Error", error);
});

export default redis;
