import Redis from "ioredis";

const RedisPort = process.env.REDIS_PORT as string;

const redis = new Redis(RedisPort);

redis.on("connect", () => {
	console.log("Redis Connected");
});

redis.on("error", (error) => {
	console.log("Redis Error", error);
});

export default redis;
