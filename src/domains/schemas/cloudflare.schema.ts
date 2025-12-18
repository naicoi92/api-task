import z from "zod";
import { TaskStatus } from "../enums/status.enum";
import { CookieSchema } from "./cookie.schema";

export const CloudflareInputSchema = z.object({
	proxy: z.url(),
	url: z.url(),
	selector: z.string(),
});

export const CloudflareOutputSchema = z.discriminatedUnion("status", [
	z.object({
		status: z.literal(TaskStatus.success),
		userAgent: z.string(),
		cookies: z
			.string()
			.transform((val) => z.array(CookieSchema).parse(JSON.parse(val)))
			.default([]),
	}),
	z.object({
		status: z.literal(TaskStatus.pending),
	}),
	z.object({
		status: z.literal(TaskStatus.error),
		message: z.string(),
	}),
]);
