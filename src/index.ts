import "reflect-metadata";
import { container } from "./internal/container";
import type { BunServer } from "./internal/servers/bun.server";
import { TOKEN } from "./internal/token";

async function main() {
	const server = container.resolve<BunServer>(TOKEN.Server);
	await server.start();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

