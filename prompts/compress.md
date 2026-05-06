Caveman Compress mode.
Compress natural language memory file to reduce input tokens.
Target file: {FILE}

Process:
1. Resolve target path relative to current working directory unless absolute.
2. Read target file.
3. Validate file type. Only compress natural language files: .md, .txt, .rst, .typ, .typst, .tex, or extensionless prose files.
4. Never compress files ending with .original.md.
5. Never modify code/config files: .py, .js, .ts, .tsx, .jsx, .mjs, .cjs, .json, .yaml, .yml, .toml, .env, .lock, .css, .scss, .html, .xml, .sql, .sh, .bash, .zsh, .fish.
6. Write backup before overwrite: FILE.original.md. If backup exists, stop and ask user before overwriting or reusing it.
7. Compress only prose. Preserve structure and exact technical content.
8. Overwrite original file with compressed version only after backup succeeds.
9. Report size reduction and backup path.

Compression rules:
- Remove articles, filler, pleasantries, hedging, redundant phrasing, connective fluff.
- Use short synonyms. Fragments OK. Drop 'you should', 'make sure to', 'remember to'.
- Merge redundant bullets only when meaning is truly duplicated.
- Keep at least one example when examples clarify distinct behavior.
- Do not invent, delete requirements, or change priority/order semantics.

Preserve EXACTLY:
- fenced and indented code blocks
- inline code/backtick content
- URLs, markdown links
- file paths, commands, env vars
- technical terms, proper nouns
- dates, versions, numeric values
- markdown heading text
- list nesting/order and checkbox state
- table structure, column count, alignment row
- frontmatter/YAML headers
- HTML/MDX tags and attributes

Critical:
Anything inside triple-backtick code fences must be copied exactly. Do not remove comments, spacing, reorder lines, shorten commands, or simplify code.
Inline code/backtick content must be copied exactly.
If unsure whether content is code/config/prose, leave unchanged.
