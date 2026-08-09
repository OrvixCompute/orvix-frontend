/** What to call a node in the UI: its name, else its GPU, else a short id. */
export function nodeLabel(node: {
  id: string;
  name: string | null;
  gpu_model: string | null;
}): string {
  if (node.name?.trim()) return node.name.trim();
  if (node.gpu_model?.trim()) return node.gpu_model.trim();
  return `Node ${node.id.slice(0, 8)}`;
}
