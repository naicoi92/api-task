import z from "zod";

export const TaskEventSchema = z.object({
	name: z.string(),
	token: z.string(),
	input: z.unknown(),
});
