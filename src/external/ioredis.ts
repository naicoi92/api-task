import IORedis from "ioredis";
import { once } from "lodash-es";

export const ioredis = once(() => new IORedis(process.env.REDIS_URL as string));
