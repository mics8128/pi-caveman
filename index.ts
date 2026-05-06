import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const baseDir = dirname(fileURLToPath(import.meta.url));
const promptDir = join(baseDir, "prompts");

const CAVEMAN_MARKER = "<!-- pi-caveman-session-full -->";
const CAVEMAN_TURN_MARKER = "<!-- pi-caveman-turn-reminder -->";

function readPrompt(name: string): string {
	return readFileSync(join(promptDir, name), "utf8").trim();
}

export default function piCavemanExtension(pi: ExtensionAPI) {
	const cavemanFullPrompt = readPrompt("caveman-full.md");
	const turnReminderPrompt = readPrompt("turn-reminder.md");
	const compressPrompt = readPrompt("compress.md");
	let fullPromptInjected = false;

	pi.registerCommand("caveman-compress", {
		description: "Compress natural language memory file into caveman format",
		handler: async (args, ctx) => {
			const file = args.trim();
			if (!file) {
				ctx.ui.notify("Usage: /caveman-compress <filepath>", "warning");
				return;
			}
			await ctx.sendUserMessage(compressPrompt.replace("{FILE}", file));
		},
	});

	pi.on("input", async (event) => {
		if (event.text.startsWith("/caveman:compress ")) {
			return { action: "transform", text: `/caveman-compress ${event.text.slice("/caveman:compress ".length).trim()}` };
		}
		return { action: "continue" };
	});

	pi.on("session_start", async () => {
		fullPromptInjected = false;
	});

	pi.on("before_agent_start", async (event) => {
		const pieces: string[] = [];
		if (!fullPromptInjected && !event.systemPrompt.includes(CAVEMAN_MARKER)) {
			pieces.push(cavemanFullPrompt);
			fullPromptInjected = true;
		}
		if (!event.systemPrompt.includes(CAVEMAN_TURN_MARKER)) {
			pieces.push(turnReminderPrompt);
		}
		if (pieces.length === 0) return undefined;
		return { systemPrompt: event.systemPrompt + "\n\n" + pieces.join("\n\n") };
	});
}
