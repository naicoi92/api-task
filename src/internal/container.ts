import { container } from "tsyringe";
import { CamoufoxProvider } from "@/external/providers/camoufox.provider";
import { TaskEventService } from "@/external/task-event";
import { BunServer } from "./servers/bun.server";
import { TOKEN } from "./token";

container.registerSingleton(TOKEN.TaskCreateProvider, CamoufoxProvider);
container.registerSingleton(TOKEN.TaskStatusProvider, CamoufoxProvider);
container.registerSingleton(TOKEN.TaskEvent, TaskEventService);
container.registerSingleton(TOKEN.Server, BunServer);
export { container };
