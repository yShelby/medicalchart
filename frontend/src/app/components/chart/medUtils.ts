export function parseMed(entry: string): { name: string; dose: string } {
  const spaceIdx = entry.indexOf(" ");
  return spaceIdx > -1
    ? { name: entry.slice(0, spaceIdx), dose: entry.slice(spaceIdx + 1) }
    : { name: entry, dose: "" };
}
