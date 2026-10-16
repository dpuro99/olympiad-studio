const cellStyle = {  border: '1px solid var(--color-border-secondary)',
  padding: '4px 10px',
  textAlign: 'center',
  fontFamily: 'var(--font-mono)'
};

const headStyle = {
  ...cellStyle,
  color: 'var(--color-text-secondary)',
  fontWeight: 600
};

const cellValue = (row, header) => (row.values ? row.values[header] : row.output);

export default function TruthTable({ variables, headers, rows, caption }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
        {caption && (
          <caption style={{ captionSide: 'top', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: 11, paddingBottom: 6 }}>
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {variables.map((variable) => <th key={variable} scope="col" style={headStyle}>{variable}</th>)}
            {headers.map((header) => <th key={header} scope="col" style={headStyle}>{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {variables.map((variable) => (
                <td key={variable} style={cellStyle}>{row.inputs[variable]}</td>
              ))}
              {headers.map((header) => (
                <td key={header} style={cellStyle}>{cellValue(row, header)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
