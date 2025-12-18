import type z from "zod";
import type { TaskEventSchema } from "../schemas/event.schema";

export type TaskEvent = z.infer<typeof TaskEventSchema>;
