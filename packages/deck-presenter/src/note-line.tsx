// The notes doc marks up provenance: _draft wording_, **labels**, `[clearances]`.
const INLINE_TOKENS = /_[^_]+_|\*\*[^*]+\*\*|`[^`]+`|[^_*`]+|./g;
const SOFT = "text-white/60";

/** One line of a slide's notes: a beat, or a cue when it has no `- `. */
export function NoteLine({ line }: { line: string }) {
  const isBeat = line.startsWith("- ");
  const parts = (isBeat ? line.slice(2) : line).match(INLINE_TOKENS) ?? [];

  return (
    <p className={isBeat ? undefined : `${SOFT} text-lg`}>
      {parts.map((part, index) => {
        // Tokens have no identity beyond their position in the line.
        const key = `${index}-${part}`;
        if (part.startsWith("_")) {
          return (
            <em className={SOFT} key={key}>
              {part.slice(1, -1)}
            </em>
          );
        }
        if (part.startsWith("**")) {
          return <strong key={key}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`")) {
          return (
            <span className={`${SOFT} text-base`} key={key}>
              {part.slice(1, -1)}
            </span>
          );
        }
        return part;
      })}
    </p>
  );
}
