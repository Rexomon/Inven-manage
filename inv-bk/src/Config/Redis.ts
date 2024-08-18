import Redis from "ioredis";

const RedisPort = process.env.REDIS_PORT as unknown as number;

const redis = new Redis({
	host: "localhost",
	port: RedisPort,
});

redis.on("connect", () => {
	console.log("Redis Connected");
});

redis.on("error", (error) => {
	console.log("Redis Error", error);
});

export default redis;
