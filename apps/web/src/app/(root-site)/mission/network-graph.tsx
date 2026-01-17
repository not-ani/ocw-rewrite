"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface Node {
  id: string;
  x: number;
  y: number;
  radius: number;
}

interface Edge {
  from: string;
  to: string;
}

interface Pulse {
  id: number;
  edgeIndex: number;
  progress: number; // 0-1 along edge, then 1-2 for orbiting
  direction: 1 | -1; // traveling direction on edge
}

// 12 nodes in a pleasing constellation-like arrangement
const nodes: Node[] = [
  // Core cluster (center-ish)
  { id: "a", x: 45, y: 42, radius: 4.5 },
  { id: "b", x: 58, y: 35, radius: 3.8 },
  { id: "c", x: 52, y: 55, radius: 4.2 },
  { id: "d", x: 35, y: 52, radius: 3.5 },

  // Outer ring
  { id: "e", x: 22, y: 28, radius: 4.0 },
  { id: "f", x: 72, y: 22, radius: 3.6 },
  { id: "g", x: 82, y: 48, radius: 4.3 },
  { id: "h", x: 75, y: 72, radius: 3.8 },
  { id: "i", x: 48, y: 78, radius: 4.0 },
  { id: "j", x: 20, y: 68, radius: 3.5 },

  // Extremities
  { id: "k", x: 12, y: 45, radius: 3.2 },
  { id: "l", x: 88, y: 32, radius: 3.4 },
];

// Dense connections for a true network feel
const edges: Edge[] = [
  // Core interconnections
  { from: "a", to: "b" },
  { from: "a", to: "c" },
  { from: "a", to: "d" },
  { from: "b", to: "c" },
  { from: "c", to: "d" },
  { from: "d", to: "a" },

  // Core to outer
  { from: "a", to: "e" },
  { from: "b", to: "f" },
  { from: "b", to: "g" },
  { from: "c", to: "g" },
  { from: "c", to: "h" },
  { from: "c", to: "i" },
  { from: "d", to: "j" },
  { from: "d", to: "e" },
  { from: "a", to: "k" },

  // Outer ring connections
  { from: "e", to: "k" },
  { from: "f", to: "g" },
  { from: "f", to: "l" },
  { from: "g", to: "l" },
  { from: "g", to: "h" },
  { from: "h", to: "i" },
  { from: "i", to: "j" },
  { from: "j", to: "k" },

  // Cross connections for density
  { from: "e", to: "f" },
  { from: "h", to: "c" },
  { from: "k", to: "d" },
];

const nodeMap = new Map(nodes.map((n) => [n.id, n]));

function getNode(id: string): Node {
  const node = nodeMap.get(id);
  if (!node) throw new Error(`Node ${id} not found`);
  return node;
}

// Calculate edge endpoints that stop at circle boundaries
function getEdgeEndpoints(fromId: string, toId: string) {
  const from = getNode(fromId);
  const to = getNode(toId);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / length;
  const uy = dy / length;

  return {
    x1: from.x + ux * from.radius,
    y1: from.y + uy * from.radius,
    x2: to.x - ux * to.radius,
    y2: to.y - uy * to.radius,
    length: length - from.radius - to.radius,
    ux,
    uy,
    fromNode: from,
    toNode: to,
  };
}

// Build adjacency for path traversal
const adjacencyList = new Map<
  string,
  { nodeId: string; edgeIndex: number }[]
>();
for (const node of nodes) {
  adjacencyList.set(node.id, []);
}
edges.forEach((edge, idx) => {
  adjacencyList.get(edge.from)?.push({ nodeId: edge.to, edgeIndex: idx });
  adjacencyList.get(edge.to)?.push({ nodeId: edge.from, edgeIndex: idx });
});

function getNextEdge(
  currentNodeId: string,
  currentEdgeIndex: number,
): { edgeIndex: number; direction: 1 | -1 } {
  const neighbors = adjacencyList.get(currentNodeId) ?? [];
  // Pick a random neighbor that isn't the edge we just came from
  const validNeighbors = neighbors.filter(
    (n) => n.edgeIndex !== currentEdgeIndex,
  );
  const choices = validNeighbors.length > 0 ? validNeighbors : neighbors;
  const chosen = choices[Math.floor(Math.random() * choices.length)];

  if (!chosen) {
    return { edgeIndex: 0, direction: 1 };
  }

  // Determine direction based on which end of the edge we're at
  const edge = edges[chosen.edgeIndex];
  if (!edge) {
    return { edgeIndex: 0, direction: 1 };
  }
  const direction: 1 | -1 = edge.from === currentNodeId ? 1 : -1;

  return { edgeIndex: chosen.edgeIndex, direction };
}

export function NetworkGraph() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Pre-calculate edge data
  const edgeData = useMemo(
    () => edges.map((e) => getEdgeEndpoints(e.from, e.to)),
    [],
  );

  useEffect(() => {
    // Initialize 3 pulses at different edges
    const initialPulses: Pulse[] = [
      { id: 0, edgeIndex: 0, progress: 0, direction: 1 },
      { id: 1, edgeIndex: 8, progress: 0.3, direction: 1 },
      { id: 2, edgeIndex: 15, progress: 0.6, direction: -1 },
    ];
    setPulses(initialPulses);

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setPulses((prev) =>
        prev.map((pulse): Pulse => {
          const speed = 0.55 + pulse.id * 0.15;
          const orbitSpeed = 1.2;

          if (pulse.progress >= 1) {
            // Orbiting phase (progress 1-2 represents orbit around destination node)
            const orbitProgress = pulse.progress - 1;
            const newOrbitProgress = orbitProgress + delta * orbitSpeed;

            if (newOrbitProgress >= 1) {
              // Done orbiting, pick next edge
              const edge = edges[pulse.edgeIndex]!;
              const currentNodeId = pulse.direction === 1 ? edge.to : edge.from;
              const { edgeIndex, direction } = getNextEdge(
                currentNodeId,
                pulse.edgeIndex,
              );

              return {
                ...pulse,
                edgeIndex,
                direction,
                progress: 0,
              };
            }

            return { ...pulse, progress: 1 + newOrbitProgress };
          }

          // Traveling along edge
          const newProgress = pulse.progress + delta * speed;

          if (newProgress >= 1) {
            return { ...pulse, progress: 1 };
          }

          return { ...pulse, progress: newProgress };
        }),
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Get pulse line segment coordinates
  const getPulseSegment = (pulse: Pulse) => {
    const edge = edgeData[pulse.edgeIndex]!;
    const segmentLength = 8; // Length of the glowing segment

    if (pulse.progress >= 1) {
      // Orbiting around destination node
      const orbitProgress = pulse.progress - 1;
      const edgeDef = edges[pulse.edgeIndex]!;
      const node =
        pulse.direction === 1 ? getNode(edgeDef.to) : getNode(edgeDef.from);

      // Calculate position on circumference
      // Start angle based on where the edge connects
      const incomingAngle = Math.atan2(
        pulse.direction === 1 ? -edge.uy : edge.uy,
        pulse.direction === 1 ? -edge.ux : edge.ux,
      );
      const angle = incomingAngle + orbitProgress * Math.PI * 2;

      const arcLength = segmentLength / 2;
      const angleSpan = arcLength / node.radius;

      return {
        type: "arc" as const,
        cx: node.x,
        cy: node.y,
        r: node.radius,
        startAngle: angle - angleSpan / 2,
        endAngle: angle + angleSpan / 2,
      };
    }

    // Traveling along edge
    const actualProgress =
      pulse.direction === 1 ? pulse.progress : 1 - pulse.progress;
    const startProgress = Math.max(
      0,
      actualProgress - segmentLength / edge.length / 2,
    );
    const endProgress = Math.min(
      1,
      actualProgress + segmentLength / edge.length / 2,
    );

    return {
      type: "line" as const,
      x1: edge.x1 + (edge.x2 - edge.x1) * startProgress,
      y1: edge.y1 + (edge.y2 - edge.y1) * startProgress,
      x2: edge.x1 + (edge.x2 - edge.x1) * endProgress,
      y2: edge.y1 + (edge.y2 - edge.y1) * endProgress,
    };
  };

  return (
    <div className="relative h-full w-full min-h-[280px]">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glow filter for pulses */}
          <filter id="pulseGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines - stopping at circle edges */}
        {edgeData.map((edge, idx) => (
          <line
            key={`edge-${idx}`}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="currentColor"
            strokeWidth="0.4"
            className="text-muted-foreground/25"
          />
        ))}

        {/* Nodes - white/foreground hollow circles */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="0.6"
            className="text-foreground/60"
          />
        ))}

        {/* Animated pulse segments */}
        {pulses.map((pulse) => {
          const segment = getPulseSegment(pulse);

          if (segment.type === "arc") {
            // Arc around node circumference
            const { cx, cy, r, startAngle, endAngle } = segment;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

            return (
              <path
                key={`pulse-${pulse.id}`}
                d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                className="text-primary"
                filter="url(#pulseGlow)"
              />
            );
          }

          // Line segment along edge
          return (
            <line
              key={`pulse-${pulse.id}`}
              x1={segment.x1}
              y1={segment.y1}
              x2={segment.x2}
              y2={segment.y2}
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="text-primary"
              filter="url(#pulseGlow)"
            />
          );
        })}
      </svg>
    </div>
  );
}
