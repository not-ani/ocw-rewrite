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
  // Current position along the full path (edge + arc + next edge)
  // 0 to edgeLength = on current edge
  // edgeLength to edgeLength+arcLength = on arc
  // After that = on next edge (then we reset)
  position: number;
  edgeIndex: number;
  direction: 1 | -1;
  // Pre-computed for current transition
  nextEdgeIndex: number;
  nextDirection: 1 | -1;
  arcLength: number;
  arcStartAngle: number;
  arcEndAngle: number;
}
const nodes: Node[] = [
  // Row 1 - top
  { id: "a", x: 5, y: 5, radius: 3.2 },
  { id: "b", x: 25, y: 8, radius: 3.6 },
  { id: "c", x: 50, y: 5, radius: 3.4 },
  { id: "d", x: 75, y: 8, radius: 3.8 },
  { id: "e", x: 95, y: 5, radius: 3.2 },
  // Row 2
  { id: "f", x: 12, y: 25, radius: 3.5 },
  { id: "g", x: 38, y: 22, radius: 4.0 },
  { id: "h", x: 62, y: 25, radius: 3.6 },
  { id: "i", x: 88, y: 22, radius: 3.8 },
  // Row 3 - middle
  { id: "j", x: 5, y: 42, radius: 3.4 },
  { id: "k", x: 28, y: 45, radius: 3.8 },
  { id: "l", x: 50, y: 42, radius: 3.5 },
  { id: "m", x: 72, y: 45, radius: 3.3 },
  { id: "n", x: 95, y: 42, radius: 3.6 },
  // Row 4
  { id: "o", x: 15, y: 62, radius: 3.4 },
  { id: "p", x: 40, y: 65, radius: 3.7 },
  { id: "q", x: 60, y: 62, radius: 3.3 },
  { id: "r", x: 85, y: 65, radius: 3.5 },
  // Row 5 - bottom
  { id: "s", x: 5, y: 82, radius: 3.4 },
  { id: "t", x: 25, y: 85, radius: 3.6 },
  { id: "u", x: 45, y: 82, radius: 3.7 },
  { id: "v", x: 65, y: 85, radius: 3.5 },
  { id: "w", x: 85, y: 82, radius: 3.4 },
  // Corner accents
  { id: "x", x: 18, y: 95, radius: 3.6 },
  { id: "y", x: 82, y: 95, radius: 3.5 },
];

const edges: Edge[] = [
  // Row 1 horizontal connections
  { from: "a", to: "b" },
  { from: "b", to: "c" },
  { from: "c", to: "d" },
  { from: "d", to: "e" },
  // Row 2 horizontal connections
  { from: "f", to: "g" },
  { from: "g", to: "h" },
  { from: "h", to: "i" },
  // Row 3 horizontal connections
  { from: "j", to: "k" },
  { from: "k", to: "l" },
  { from: "l", to: "m" },
  { from: "m", to: "n" },
  // Row 4 horizontal connections
  { from: "o", to: "p" },
  { from: "p", to: "q" },
  { from: "q", to: "r" },
  // Row 5 horizontal connections
  { from: "s", to: "t" },
  { from: "t", to: "u" },
  { from: "u", to: "v" },
  { from: "v", to: "w" },
  // Vertical: Row 1 to Row 2
  { from: "a", to: "f" },
  { from: "b", to: "f" },
  { from: "b", to: "g" },
  { from: "c", to: "g" },
  { from: "c", to: "h" },
  { from: "d", to: "h" },
  { from: "d", to: "i" },
  { from: "e", to: "i" },
  // Vertical: Row 2 to Row 3
  { from: "f", to: "j" },
  { from: "f", to: "k" },
  { from: "g", to: "k" },
  { from: "g", to: "l" },
  { from: "h", to: "l" },
  { from: "h", to: "m" },
  { from: "i", to: "m" },
  { from: "i", to: "n" },
  // Vertical: Row 3 to Row 4
  { from: "j", to: "o" },
  { from: "k", to: "o" },
  { from: "k", to: "p" },
  { from: "l", to: "p" },
  { from: "l", to: "q" },
  { from: "m", to: "q" },
  { from: "m", to: "r" },
  { from: "n", to: "r" },
  // Vertical: Row 4 to Row 5
  { from: "o", to: "s" },
  { from: "o", to: "t" },
  { from: "p", to: "t" },
  { from: "p", to: "u" },
  { from: "q", to: "u" },
  { from: "q", to: "v" },
  { from: "r", to: "v" },
  { from: "r", to: "w" },
  // Bottom corner connections
  { from: "s", to: "x" },
  { from: "t", to: "x" },
  { from: "v", to: "y" },
  { from: "w", to: "y" },
  // Cross connections for visual interest
  { from: "a", to: "g" },
  { from: "e", to: "h" },
  { from: "j", to: "p" },
  { from: "n", to: "q" },
  { from: "x", to: "u" },
  { from: "y", to: "v" },
];

const nodeMap = new Map(nodes.map((n) => [n.id, n]));

function getNode(id: string): Node {
  const node = nodeMap.get(id);
  if (!node) throw new Error(`Node ${id} not found`);
  return node;
}

function getEdgeEndpoints(fromId: string, toId: string) {
  const from = getNode(fromId);
  const to = getNode(toId);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;

  return {
    x1: from.x + ux * from.radius,
    y1: from.y + uy * from.radius,
    x2: to.x - ux * to.radius,
    y2: to.y - uy * to.radius,
    length: dist - from.radius - to.radius,
    ux,
    uy,
    fromNode: from,
    toNode: to,
  };
}

const adjacencyList = new Map<string, { nodeId: string; edgeIndex: number }[]>();
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
  const validNeighbors = neighbors.filter((n) => n.edgeIndex !== currentEdgeIndex);
  const choices = validNeighbors.length > 0 ? validNeighbors : neighbors;
  const chosen = choices[Math.floor(Math.random() * choices.length)];
  if (!chosen) return { edgeIndex: 0, direction: 1 };
  const edge = edges[chosen.edgeIndex];
  if (!edge) return { edgeIndex: 0, direction: 1 };
  return {
    edgeIndex: chosen.edgeIndex,
    direction: edge.from === currentNodeId ? 1 : -1,
  };
}

function computeArc(
  nodeId: string,
  fromEdgeIndex: number,
  fromDirection: 1 | -1,
  toEdgeIndex: number,
  toDirection: 1 | -1,
): { arcLength: number; startAngle: number; endAngle: number } {
  const node = getNode(nodeId);
  const fromEdge = edges[fromEdgeIndex]!;
  const toEdge = edges[toEdgeIndex]!;

  // Angle where we arrive (pointing into the node)
  const fromNode = fromDirection === 1 ? getNode(fromEdge.from) : getNode(fromEdge.to);
  const arriveAngle = Math.atan2(node.y - fromNode.y, node.x - fromNode.x) + Math.PI;

  // Angle where we leave (pointing out of the node)
  const toNode = toDirection === 1 ? getNode(toEdge.to) : getNode(toEdge.from);
  const leaveAngle = Math.atan2(toNode.y - node.y, toNode.x - node.x);

  // Normalize angles and find shortest arc
  let diff = leaveAngle - arriveAngle;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;

  const arcLength = Math.abs(diff) * node.radius;

  return {
    arcLength,
    startAngle: arriveAngle,
    endAngle: arriveAngle + diff,
  };
}

export function NetworkGraph() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  const edgeData = useMemo(
    () => edges.map((e) => getEdgeEndpoints(e.from, e.to)),
    [],
  );

  // Initialize a pulse with pre-computed arc info
  const initPulse = (
    id: number,
    edgeIndex: number,
    direction: 1 | -1,
    position: number,
  ): Pulse => {
    const edge = edges[edgeIndex]!;
    const nodeId = direction === 1 ? edge.to : edge.from;
    const { edgeIndex: nextIdx, direction: nextDir } = getNextEdge(nodeId, edgeIndex);
    const arc = computeArc(nodeId, edgeIndex, direction, nextIdx, nextDir);

    return {
      id,
      position,
      edgeIndex,
      direction,
      nextEdgeIndex: nextIdx,
      nextDirection: nextDir,
      arcLength: arc.arcLength,
      arcStartAngle: arc.startAngle,
      arcEndAngle: arc.endAngle,
    };
  };

  useEffect(() => {
    const initialPulses: Pulse[] = [
      initPulse(0, 0, 1, 2),
      initPulse(1, 18, -1, 5),
      initPulse(2, 32, 1, 8),
    ];
    setPulses(initialPulses);

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setPulses((prev) =>
        prev.map((pulse): Pulse => {
          const speed = 12 + pulse.id * 3;
          const edgeLen = edgeData[pulse.edgeIndex]!.length;
          const totalPathLen = edgeLen + pulse.arcLength;

          let newPos = pulse.position + delta * speed;

          // If we've passed the arc, transition to next edge
          if (newPos >= totalPathLen) {
            const overflow = newPos - totalPathLen;
            const edge = edges[pulse.nextEdgeIndex]!;
            const nodeId = pulse.nextDirection === 1 ? edge.to : edge.from;
            const { edgeIndex: nextIdx, direction: nextDir } = getNextEdge(
              nodeId,
              pulse.nextEdgeIndex,
            );
            const arc = computeArc(
              nodeId,
              pulse.nextEdgeIndex,
              pulse.nextDirection,
              nextIdx,
              nextDir,
            );

            return {
              ...pulse,
              position: overflow,
              edgeIndex: pulse.nextEdgeIndex,
              direction: pulse.nextDirection,
              nextEdgeIndex: nextIdx,
              nextDirection: nextDir,
              arcLength: arc.arcLength,
              arcStartAngle: arc.startAngle,
              arcEndAngle: arc.endAngle,
            };
          }

          return { ...pulse, position: newPos };
        }),
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [edgeData]);

  // Convert a position along the path to x,y coordinates
  const getPointOnPath = (
    pulse: Pulse,
    pos: number,
  ): { x: number; y: number } | null => {
    const edge = edgeData[pulse.edgeIndex]!;
    const edgeLen = edge.length;

    if (pos < 0) return null;

    if (pos <= edgeLen) {
      // On the current edge
      const t = pulse.direction === 1 ? pos / edgeLen : 1 - pos / edgeLen;
      return {
        x: edge.x1 + (edge.x2 - edge.x1) * t,
        y: edge.y1 + (edge.y2 - edge.y1) * t,
      };
    }

    const arcPos = pos - edgeLen;
    if (arcPos <= pulse.arcLength) {
      // On the arc
      const edgeDef = edges[pulse.edgeIndex]!;
      const node =
        pulse.direction === 1 ? getNode(edgeDef.to) : getNode(edgeDef.from);
      const arcT = arcPos / pulse.arcLength;
      const angle =
        pulse.arcStartAngle + (pulse.arcEndAngle - pulse.arcStartAngle) * arcT;
      return {
        x: node.x + node.radius * Math.cos(angle),
        y: node.y + node.radius * Math.sin(angle),
      };
    }

    // Past the arc - on the next edge (shouldn't happen often with our update logic)
    return null;
  };

  // Build the pulse segment as a series of points
  const getPulsePoints = (pulse: Pulse): string => {
    const segmentLength = 6;
    const numPoints = 12;
    const points: string[] = [];

    const headPos = pulse.position;
    const tailPos = Math.max(0, headPos - segmentLength);

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const pos = tailPos + (headPos - tailPos) * t;
      const pt = getPointOnPath(pulse, pos);
      if (pt) {
        points.push(`${pt.x},${pt.y}`);
      }
    }

    return points.join(" ");
  };

  return (
    <div className="relative h-full w-full min-h-[280px]">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection lines */}
        {edgeData.map((edge, idx) => (
          <line
            key={`edge-${idx}`}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="currentColor"
            strokeWidth="0.35"
            className="text-muted-foreground/20"
          />
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-foreground/50"
          />
        ))}

        {/* Animated pulse segments */}
        {pulses.map((pulse) => {
          const points = getPulsePoints(pulse);
          if (!points) return null;

          return (
            <polyline
              key={`pulse-${pulse.id}`}
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
              filter="url(#pulseGlow)"
            />
          );
        })}
      </svg>
    </div>
  );
}
