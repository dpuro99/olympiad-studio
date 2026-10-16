import { useEffect, useMemo, useRef, useState } from 'react';
import { compileSchematic, evaluateSchematic, schematicTruthTable, layoutSchematic, GATE_ARITY, GATE_IDS } from './booleanLogic';
import TruthTable from './TruthTable';
import { Button, Card, HelpText, SectionHeading, StatusMessage } from '../../general/ui/primitives';

const NODE_W = 132;
const HEADER = 30;
const PORT_TOP = 44;
const PORT_GAP = 24;
const STORAGE_KEY = 'olympiad-studio.circuitlab-c.2027-logic-canvas';

const letters = (count) => Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index));
const arityOf = (type) => (type === 'OUT' ? 1 : GATE_ARITY[type] || 0);
const inputCountOf = (type) => (type === 'IN' ? 0 : arityOf(type));
const nodeHeight = (type) => HEADER + Math.max(1, inputCountOf(type)) * PORT_GAP + 16;

const outputPort = (node) => ({ x: node.x + NODE_W, y: node.y + PORT_TOP });
const inputPort = (node, index) => ({ x: node.x, y: node.y + PORT_TOP + index * PORT_GAP });

const labelOf = (node) => (node.type === 'IN' ? node.id : node.type === 'OUT' ? 'OUTPUT' : `${node.id} ${node.type}`);

function initialCircuit() {
  return {
    nodes: [
      { id: 'A', type: 'IN', x: 24, y: 40 },
      { id: 'B', type: 'IN', x: 24, y: 110 },
      { id: 'G1', type: 'AND', x: 220, y: 66 },
      { id: 'OUT', type: 'OUT', x: 430, y: 78 }
    ],
    wires: [
      { from: 'A', to: 'G1', port: 'a' },
      { from: 'B', to: 'G1', port: 'b' },
      { from: 'G1', to: 'OUT', port: 'a' }
    ]
  };
}

function isValidState(state) {
  return Boolean(
    state
    && Array.isArray(state.nodes)
    && Array.isArray(state.wires)
    && state.nodes.every((node) => node
      && typeof node.id === 'string'
      && typeof node.type === 'string'
      && Number.isFinite(node.x)
      && Number.isFinite(node.y))
    && state.wires.every((wire) => wire
      && typeof wire.from === 'string'
      && typeof wire.to === 'string'
      && (wire.port === 'a' || wire.port === 'b'))
  );
}

function loadSavedCircuit() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { state: null, error: false };
    const parsed = JSON.parse(stored);
    if (!isValidState(parsed)) return { state: null, error: true };
    return {
      state: {
        nodes: parsed.nodes,
        wires: parsed.wires,
        assignment: parsed.assignment && typeof parsed.assignment === 'object' ? parsed.assignment : {}
      },
      error: false
    };
  } catch {
    return { state: null, error: true };
  }
}

const wirePath = (from, to) => {
  const bend = Math.max(30, Math.abs(to.x - from.x) / 2);
  return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`;
};

export default function CircuitCanvas() {
  const [boot] = useState(() => {
    const result = loadSavedCircuit();
    if (result.state) return { ...result.state, error: false };
    return { ...initialCircuit(), assignment: { A: 0, B: 0 }, error: result.error };
  });
  const [nodes, setNodes] = useState(boot.nodes);
  const [wires, setWires] = useState(boot.wires);
  const [assignment, setAssignment] = useState(boot.assignment);
  const [storageError, setStorageError] = useState(boot.error);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [draft, setDraft] = useState(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, wires, assignment }));
    } catch {
      const timer = window.setTimeout(() => setStorageError(true), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [nodes, wires, assignment]);

  const compiled = useMemo(() => compileSchematic({ nodes, wires }), [nodes, wires]);
  const values = useMemo(
    () => (compiled.error ? {} : evaluateSchematic(compiled, assignment)),
    [compiled, assignment]
  );
  const table = useMemo(() => schematicTruthTable(nodes, wires), [nodes, wires]);

  const nodeById = Object.fromEntries(nodes.map((node) => [node.id, node]));

  const toLocal = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const addNode = (type) => {
    if (type === 'IN') {
      const next = letters(4).find((letter) => !nodeById[letter]);
      if (!next) return;
      setNodes((current) => [...current, { id: next, type: 'IN', x: 24, y: 40 + current.filter((n) => n.type === 'IN').length * 70 }]);
      setAssignment((current) => ({ ...current, [next]: 0 }));
      return;
    }
    if (type === 'OUT') {
      if (nodes.some((node) => node.type === 'OUT')) return;
      setNodes((current) => [...current, { id: 'OUT', type: 'OUT', x: 430, y: 78 }]);
      return;
    }
    let maxGate = 0;
    for (const node of nodes) {
      const match = /^G(\d+)$/.exec(node.id);
      if (match) maxGate = Math.max(maxGate, Number(match[1]));
    }
    const id = `G${maxGate + 1}`;
    const count = nodes.length;
    const x = 180 + (count % 3) * 130;
    const y = 40 + (count % 5) * 60;
    setNodes((current) => [...current, { id, type, x, y }]);
  };

  const removeNode = (id) => {
    setNodes((current) => current.filter((node) => node.id !== id));
    setWires((current) => current.filter((wire) => wire.from !== id && wire.to !== id));
    setAssignment((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setSelectedOutput((current) => (current === id ? null : current));
  };

  const connect = (from, to, port) => {
    if (!from || !to) return;
    setWires((current) => [
      ...current.filter((wire) => !(wire.to === to && wire.port === port)),
      { from, to, port }
    ]);
    setSelectedOutput(null);
  };

  const removeWire = (target) => {
    setWires((current) => current.filter((wire) => !(wire.from === target.from && wire.to === target.to && wire.port === target.port)));
  };

  const tidyUp = () => {
    const result = layoutSchematic(nodes, wires);
    if (!result.error) setNodes(result.nodes);
  };

  const startDrag = (event, node) => {
    event.preventDefault();
    const local = toLocal(event.clientX, event.clientY);
    dragRef.current = { id: node.id, grabX: local.x - node.x, grabY: local.y - node.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!dragRef.current) return;
    const local = toLocal(event.clientX, event.clientY);
    const { id, grabX, grabY } = dragRef.current;
    setNodes((current) => current.map((node) => (
      node.id === id
        ? { ...node, x: Math.max(0, Math.round(local.x - grabX)), y: Math.max(0, Math.round(local.y - grabY)) }
        : node
    )));
  };

  const endDrag = () => { dragRef.current = null; };

  const startWire = (event, from) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraft({ from, ...toLocal(event.clientX, event.clientY) });
  };

  const moveDraft = (event) => {
    setDraft((current) => (current ? { ...current, ...toLocal(event.clientX, event.clientY) } : current));
  };

  const finishWire = (event, from) => {
    event.stopPropagation();
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const target = element && element.closest('[data-port-to]');
    if (target) connect(from, target.getAttribute('data-port-to'), target.getAttribute('data-port-name'));
    setDraft(null);
  };

  const clearCanvas = () => {
    if (!window.confirm('Clear the whole circuit?')) return;
    setNodes([]);
    setWires([]);
    setAssignment({});
    setSelectedOutput(null);
    setDraft(null);
  };

  const showError = compiled.error && !/OUTPUT node/.test(compiled.error);

  return (
    <Card style={{ display: 'grid', gap: 14 }}>
      <SectionHeading>Circuit canvas</SectionHeading>
      <HelpText>
        Drag a gate by its header to move it. To wire, drag from a node&rsquo;s right-hand output dot to another node&rsquo;s left-hand input dot — or click an output then click an input. Click a wire to remove it, or use Tidy up to lay the circuit out left to right. Your circuit is saved in this browser. The current input values and every node&rsquo;s simulated value are shown live, with the full truth table below.
      </HelpText>

      {storageError && (
        <StatusMessage tone="error">Saved circuit could not be read from this browser; starting from a fresh circuit.</StatusMessage>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {letters(4).map((letter) => (
          <Button key={letter} onClick={() => addNode('IN')} disabled={Boolean(nodeById[letter])} style={{ padding: '6px 10px' }}>
            + Input {letter}
          </Button>
        ))}
        {GATE_IDS.map((id) => (
          <Button key={id} onClick={() => addNode(id)} style={{ padding: '6px 10px' }}>+ {id}</Button>
        ))}
        <Button onClick={() => addNode('OUT')} disabled={nodes.some((node) => node.type === 'OUT')} style={{ padding: '6px 10px' }}>+ Output</Button>
        <Button onClick={tidyUp} disabled={Boolean(compiled.error)} style={{ padding: '6px 10px' }}>Tidy up</Button>
        <Button variant="danger" onClick={clearCanvas} style={{ padding: '6px 10px' }}>Clear</Button>
      </div>

      <div
        ref={canvasRef}
        style={{
          position: 'relative',
          height: 440,
          border: '1px solid var(--color-border-tertiary)',
          borderRadius: 'var(--border-radius-md)',
          background: 'var(--color-background-tertiary)',
          overflow: 'hidden',
          touchAction: 'none'
        }}
      >
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {wires.map((wire, index) => {
            const source = nodeById[wire.from];
            const target = nodeById[wire.to];
            if (!source || !target) return null;
            const portIndex = wire.port === 'b' ? 1 : 0;
            const value = compiled.error ? 0 : values[wire.to];
            const active = !compiled.error && value === 1 && values[wire.from] === 1;
            const path = wirePath(outputPort(source), inputPort(target, portIndex));
            return (
              <g className="circuit-wire-group" key={`${wire.from}-${wire.to}-${wire.port}-${index}`}>
                <path
                  className="circuit-wire-hit"
                  d={path}
                  role="button"
                  tabIndex={0}
                  aria-label={`Delete wire from ${wire.from} to ${wire.to}`}
                  onClick={() => removeWire(wire)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      removeWire(wire);
                    }
                  }}
                />
                <path
                  className="circuit-wire-visible"
                  d={path}
                  fill="none"
                  stroke={active ? 'var(--color-text-success)' : 'var(--color-border-secondary)'}
                  strokeWidth={active ? 3 : 2}
                />
              </g>
            );
          })}
          {draft && nodeById[draft.from] && (
            <path d={wirePath(outputPort(nodeById[draft.from]), { x: draft.x, y: draft.y })} fill="none" stroke="var(--color-text-info)" strokeWidth={2} strokeDasharray="5 4" />
          )}
        </svg>

        {nodes.map((node) => {
          const inputs = Array.from({ length: inputCountOf(node.type) });
          const value = compiled.error ? null : values[node.id];
          return (
            <div
              key={node.id}
              data-node={node.id}
              style={{
                position: 'absolute',
                left: node.x,
                top: node.y,
                width: NODE_W,
                height: nodeHeight(node.type),
                background: 'var(--color-background-secondary)',
                border: '1px solid var(--color-border-secondary)',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: '0 1px 2px rgba(0,0,0,.15)',
                zIndex: 2
              }}
            >
              <div
                data-node-header
                onPointerDown={(event) => startDrag(event, node)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                  padding: '5px 8px', cursor: 'grab', borderBottom: '1px solid var(--color-border-tertiary)',
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600
                }}
              >
                <span>{labelOf(node)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {value !== null && (
                    <span style={{ color: value ? 'var(--color-text-success)' : 'var(--color-text-secondary)' }}>{value}</span>
                  )}
                  <button
                    type="button"
                    aria-label={`Delete ${node.id}`}
                    onClick={() => removeNode(node.id)}
                    style={{ border: 0, background: 'transparent', color: 'var(--color-text-danger)', cursor: 'pointer', fontSize: 13, lineHeight: 1 }}
                  >
                    ×
                  </button>
                </span>
              </div>

              {node.type === 'IN' && (
                <div style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    aria-label={`Toggle input ${node.id}`}
                    aria-pressed={assignment[node.id] === 1}
                    onClick={() => setAssignment((current) => ({ ...current, [node.id]: current[node.id] ? 0 : 1 }))}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '2px 8px', borderRadius: 6, border: '1px solid var(--color-border-secondary)', background: 'transparent', color: 'inherit', cursor: 'pointer' }}
                  >
                    {assignment[node.id] ? 1 : 0}
                  </button>
                  <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>value</span>
                </div>
              )}

              {inputs.map((_, index) => (
                <div key={index} style={{ fontSize: 10, color: 'var(--color-text-secondary)', padding: `0 8px`, lineHeight: `${PORT_GAP}px` }}>
                  {node.type === 'OUT' ? 'in' : index === 0 ? 'a' : 'b'}
                </div>
              ))}

              <button
                type="button"
                aria-label={`Output of ${node.id}`}
                data-from={node.id}
                onPointerDown={(event) => startWire(event, node.id)}
                onPointerMove={moveDraft}
                onPointerUp={(event) => finishWire(event, node.id)}
                onClick={() => setSelectedOutput((current) => (current === node.id ? null : node.id))}
                style={{
                  position: 'absolute', right: -8, top: PORT_TOP - 8, width: 16, height: 16, borderRadius: '50%',
                  border: `2px solid ${selectedOutput === node.id ? 'var(--color-text-info)' : 'var(--color-border-secondary)'}`,
                  background: 'var(--color-background-secondary)', cursor: 'crosshair', padding: 0
                }}
              />

              {(node.type === 'OUT' ? ['a'] : arityOf(node.type) === 2 ? ['a', 'b'] : node.type === 'IN' ? [] : ['a']).map((port, index) => (
                <button
                  key={port}
                  type="button"
                  aria-label={`Input ${port} of ${node.id}`}
                  data-port-to={node.id}
                  data-port-name={port}
                  onClick={() => connect(selectedOutput, node.id, port)}
                  style={{
                    position: 'absolute', left: -8, top: PORT_TOP + index * PORT_GAP - 8, width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid var(--color-border-secondary)', background: 'var(--color-background-secondary)', cursor: 'crosshair', padding: 0
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {showError && <StatusMessage tone="error">{compiled.error}</StatusMessage>}

      {table.error ? (
        !showError && <HelpText>{table.error}</HelpText>
      ) : (
        <TruthTable variables={table.inputs} headers={['Output']} rows={table.rows} caption={`Circuit output for each input combination (output = ${table.outputId})`} />
      )}
    </Card>
  );
}
