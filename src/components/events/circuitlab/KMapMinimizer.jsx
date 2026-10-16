import { useState } from 'react';
import { kmapLayout, kmapMinimize } from './booleanLogic';
import { Card, SectionHeading, StatusMessage, TextField } from '../../general/ui/primitives';

const GROUP_COLORS = ['#5b8def', '#e0568a', '#3aa76d', '#c98a2e', '#8e6fd8', '#2aa5b5'];

const cellBase = {
  border: '1px solid var(--color-border-secondary)',
  padding: '6px 10px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  minWidth: 44
};

function groupIndexFor(minterm, implicants) {
  const indices = [];
  implicants.forEach((term, index) => { if (term.covered.includes(minterm)) indices.push(index); });
  return indices;
}

function KMapGrid({ layout, onSet, implicants }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
        <caption style={{ captionSide: 'top', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: 11, paddingBottom: 6 }}>
          Karnaugh map — cells shaded by minimized term
        </caption>
        <thead>
          <tr>
            <th scope="col" style={{ ...cellBase, border: 'none', color: 'var(--color-text-secondary)' }}>
              {layout.rowVars.map((position) => layout.variables[position]).join(',')}
            </th>
            {layout.colLabels.map((label) => (
              <th key={label} scope="col" style={{ ...cellBase, color: 'var(--color-text-secondary)' }}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {layout.rows.map((row) => (
            <tr key={row.label || 'row'}>
              <th scope="row" style={{ ...cellBase, color: 'var(--color-text-secondary)' }}>{layout.hasRowLabels ? row.label : ''}</th>
              {row.cells.map((minterm) => {
                const groups = groupIndexFor(minterm, implicants);
                const on = onSet.includes(minterm);
                const background = groups.length ? `${GROUP_COLORS[groups[0] % GROUP_COLORS.length]}33` : 'transparent';
                return (
                  <td key={minterm} style={{ ...cellBase, background, borderColor: groups.length ? GROUP_COLORS[groups[0] % GROUP_COLORS.length] : undefined }}>
                    <div style={{ fontSize: 9, color: 'var(--color-text-secondary)' }}>{minterm}</div>
                    <div>{on ? 1 : 0}</div>
                    {groups.length > 1 && (
                      <div style={{ fontSize: 8, color: 'var(--color-text-secondary)' }}>{groups.map((g) => g + 1).join(',')}</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function KMapMinimizer() {
  const [expression, setExpression] = useState('');

  const result = expression.trim() ? kmapMinimize(expression) : null;

  return (
    <Card style={{ display: 'grid', gap: 14 }}>
      <SectionHeading>Karnaugh map minimization</SectionHeading>
      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
        Type a Boolean expression over A&ndash;D. The map places its 1s on a gray-code grid and returns a minimal sum-of-products, the goal of manual K-map grouping. Groups are shaded and numbered in the term list below.
      </p>
      <TextField
        label="Boolean expression"
        value={expression}
        onChange={(event) => setExpression(event.target.value)}
        placeholder="e.g. (A AND B) OR (A AND C) OR (B AND C)"
        help="Variables A–D; operators AND, OR, NOT, XOR and parentheses."
      />
      {result && result.error && <StatusMessage tone="error">{result.error}</StatusMessage>}
      {result && !result.error && (
        <>
          <StatusMessage>
            Minterms (output = 1): {result.minterms.length ? `\u03a3 m(${result.minterms.join(', ')})` : 'none'}
          </StatusMessage>
          {result.minterms.length > 0 && (
            <>
              <KMapGrid layout={kmapLayout(result.variables.length)} onSet={result.minterms} implicants={result.implicants} />
              <StatusMessage tone="success">
                Minimized sum-of-products: <span style={{ fontFamily: 'var(--font-mono)' }}>{result.form}</span>
              </StatusMessage>
              {result.implicants.length > 0 && (
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                  {result.implicants.map((term, index) => (
                    <li key={`${term.mask}:${term.value}`}>
                      <span style={{ color: GROUP_COLORS[index % GROUP_COLORS.length] }}>Group {index + 1}</span>
                      {' — '}
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {term.label}
                      </span>
                      {' covers '}
                      {term.covered.join(', ')}
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
          {result.minterms.length === 0 && (
            <StatusMessage>The function is always 0, so the minimal form is 0.</StatusMessage>
          )}
        </>
      )}
    </Card>
  );
}
