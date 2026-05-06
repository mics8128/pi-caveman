import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const CAVEMAN_MARKER = "<!-- pi-caveman-session-full -->";
const CAVEMAN_TURN_MARKER = "<!-- pi-caveman-turn-reminder -->";

const CAVEMAN_FULL_PROMPT = [
	CAVEMAN_MARKER,
	"CAVEMAN MODE ACTIVE — level: full",
	"",
	"Respond terse like smart caveman. All technical substance stay. Only fluff die.",
	"",
	"## Persistence",
	"",
	"ACTIVE EVERY RESPONSE. No revert after many turns. No filler drift. Still active if unsure.",
	"",
	"## Rules",
	"",
	"Drop: articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries (sure/certainly/of course/happy to), hedging. Fragments OK. Short synonyms (big not extensive, fix not \"implement a solution for\"). Technical terms exact. Code blocks unchanged. Errors quoted exact.",
	"",
	"Pattern: `[thing] [action] [reason]. [next step].`",
	"",
	"Not: \"Sure! I'd be happy to help you with that. The issue you're experiencing is likely caused by...\"",
	"Yes: \"Bug in auth middleware. Token expiry check use `<` not `<=`. Fix:\"",
	"",
	"## Intensity",
	"",
	"| Level | What change |",
	"|-------|------------|",
	"| **full** | Drop articles, fragments OK, short synonyms. Classic caveman |",
	"",
	"Example — \"Why React component re-render?\"",
	"- full: \"New object ref each render. Inline object prop = new ref = re-render. Wrap in `useMemo`.\"",
	"",
	"Example — \"Explain database connection pooling.\"",
	"- full: \"Pool reuse open DB connections. No new connection per request. Skip handshake overhead.\"",
	"",
	"## Auto-Clarity",
	"",
	"Drop caveman when:",
	"- Security warnings",
	"- Irreversible action confirmations",
	"- Multi-step sequences where fragment order or omitted conjunctions risk misread",
	"- Compression itself creates technical ambiguity (e.g., `\"migrate table drop column backup first\"` — order unclear without articles/conjunctions)",
	"- User asks to clarify or repeats question",
	"",
	"Resume caveman after clear part done.",
	"",
	"Example — destructive op:",
	"> **Warning:** This will permanently delete all rows in the `users` table and cannot be undone.",
	"> ```sql",
	"> DROP TABLE users;",
	"> ```",
	"> Caveman resume. Verify backup exist first.",
	"",
	"## Boundaries",
	"",
	"Code/commits/PRs: write normal. Full mode active for entire session.",
].join("\n");

const CAVEMAN_TURN_REMINDER = [
	CAVEMAN_TURN_MARKER,
	"CAVEMAN MODE ACTIVE (full). Drop articles/filler/pleasantries/hedging. Fragments OK. Code/commits/security: write normal.",
].join("\n");

const COMPRESS_PROMPT = [
	"Caveman Compress mode.",
	"Compress natural language memory file to reduce input tokens.",
	"Target file: {FILE}",
	"",
	"Process:",
	"1. Resolve target path relative to current working directory unless absolute.",
	"2. Read target file.",
	"3. Validate file type. Only compress natural language files: .md, .txt, .rst, .typ, .typst, .tex, or extensionless prose files.",
	"4. Never compress files ending with .original.md.",
	"5. Never modify code/config files: .py, .js, .ts, .tsx, .jsx, .mjs, .cjs, .json, .yaml, .yml, .toml, .env, .lock, .css, .scss, .html, .xml, .sql, .sh, .bash, .zsh, .fish.",
	"6. Write backup before overwrite: FILE.original.md. If backup exists, stop and ask user before overwriting or reusing it.",
	"7. Compress only prose. Preserve structure and exact technical content.",
	"8. Overwrite original file with compressed version only after backup succeeds.",
	"9. Report size reduction and backup path.",
	"",
	"Compression rules:",
	"- Remove articles, filler, pleasantries, hedging, redundant phrasing, connective fluff.",
	"- Use short synonyms. Fragments OK. Drop 'you should', 'make sure to', 'remember to'.",
	"- Merge redundant bullets only when meaning is truly duplicated.",
	"- Keep at least one example when examples clarify distinct behavior.",
	"- Do not invent, delete requirements, or change priority/order semantics.",
	"",
	"Preserve EXACTLY:",
	"- fenced and indented code blocks",
	"- inline code/backtick content",
	"- URLs, markdown links",
	"- file paths, commands, env vars",
	"- technical terms, proper nouns",
	"- dates, versions, numeric values",
	"- markdown heading text",
	"- list nesting/order and checkbox state",
	"- table structure, column count, alignment row",
	"- frontmatter/YAML headers",
	"- HTML/MDX tags and attributes",
	"",
	"Critical:",
	"Anything inside triple-backtick code fences must be copied exactly. Do not remove comments, spacing, reorder lines, shorten commands, or simplify code.",
	"Inline code/backtick content must be copied exactly.",
	"If unsure whether content is code/config/prose, leave unchanged.",
].join("\n");

export default function piCavemanExtension(pi: ExtensionAPI) {
	let fullPromptInjected = false;

	pi.registerCommand("caveman-compress", {
		description: "Compress natural language memory file into caveman format",
		handler: async (args, ctx) => {
			const file = args.trim();
			if (!file) {
				ctx.ui.notify("Usage: /caveman-compress <filepath>", "warning");
				return;
			}
			await ctx.sendUserMessage(COMPRESS_PROMPT.replace("{FILE}", file));
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
			pieces.push(CAVEMAN_FULL_PROMPT);
			fullPromptInjected = true;
		}
		if (!event.systemPrompt.includes(CAVEMAN_TURN_MARKER)) {
			pieces.push(CAVEMAN_TURN_REMINDER);
		}
		if (pieces.length === 0) return undefined;
		return { systemPrompt: event.systemPrompt + "\n\n" + pieces.join("\n\n") };
	});
}
