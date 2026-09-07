export interface GraphPoint { x: number; y: number; radius: number; cluster: number; }

export function nearestNode<T extends GraphPoint>(nodes: T[], x: number, y: number, cluster: number | null, touch: boolean): T | null {
  let nearest: T | null = null;
  let distance = Infinity;
  for (const node of nodes) {
    if (cluster !== null && node.cluster !== cluster) continue;
    const d = Math.hypot(x - node.x, y - node.y);
    if (d <= Math.max(touch ? 24 : 14, node.radius + 6) && d < distance) {
      nearest = node;
      distance = d;
    }
  }
  return nearest;
}

export function constrainPoint(x: number, y: number, radius: number, width: number, height: number) {
  const padding = radius + 12;
  return {
    x: Math.max(Math.min(padding, width / 2), Math.min(width - padding, x)),
    y: Math.max(Math.min(padding, height / 2), Math.min(height - padding - 18, y)),
  };
}
