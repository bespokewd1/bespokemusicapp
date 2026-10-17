/** Read image items first: some browsers expose clipboard items but not files. */
export function clipboardImages(data: Pick<DataTransfer, "items" | "files">): File[] {
  const items = Array.from(data.items ?? []).flatMap((item) => {
    if (item.kind !== "file" || !item.type.startsWith("image/")) return [];
    const file = item.getAsFile();
    return file ? [file] : [];
  });
  return items.length ? items : Array.from(data.files ?? []).filter((file) => file.type.startsWith("image/"));
}

export function insertPastedText(text: string, pasted: string, start: number, end: number) {
  return text.slice(0, start) + pasted + text.slice(end);
}