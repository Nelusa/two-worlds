/** Saves text as a local file through a temporary object URL; nothing leaves the device. */
export const downloadText = (filename: string, text: string, type = "text/plain") => {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
