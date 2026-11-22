import { useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  hardyFromDominant,
  hardyFromP,
  hardyFromRecessive,
  heritabilityEstimates,
  mapThreePoint,
  mapTwoPoint,
  punnettCross
} from './geneticsUtils';
import {
  Card,
  HelpText,
  NumberField,
  ResultPanel,
  SectionHeading,
  SelectField,
  StatusMessage,
  Tabs,
  TextField,
  ToggleSwitch,
  ToolHeader
} from '../../general/ui/primitives';

const TABS = [
  { id: 'cross', label: 'Punnett squares' },
  { id: 'hardy', label: 'Hardy-Weinberg' },
  { id: 'mapping', label: 'Gene mapping' },
  { id: 'heritability', label: 'Heritability' }
];

const MAP_TABS = [
  { id: 'two', label: 'Two-point (State & National)' },
  { id: 'three', label: 'Three-point (National)' }
];

const DEFAULT_THREE_POINT = [
  { gamete: 'ABC', count: '20' }, { gamete: 'abc', count: '20' },
  { gamete: 'Abc', count: '15' }, { gamete: 'aBC', count: '15' },
  { gamete: 'ABc', count: '10' }, { gamete: 'abC', count: '10' },
  { gamete: 'AbC', count: '5' }, { gamete: 'aBc', count: '5' }
];

const mono = { fontFamily: 'var(--font-sans)' };
const gridStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const thStyle = { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-secondary)', color: 'var(--color-text-secondary)', fontWeight: 600 };
const tdStyle = { padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)', textAlign: 'center' };
const captionStyle = { captionSide: 'top', textAlign: 'left', paddingBottom: 6, color: 'var(--color-text-secondary)', fontSize: 11 };

function Readout({ label, value }) {
  return (
    <div style={{ display: 'grid', gap: 2, minWidth: 120 }}>
      <span style={{ color: 'var(--color-text-secondary)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
      <span style={{ ...mono, fontSize: 13, color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
  );
}

function BasisNote({ citation, basis }) {
  return (
    <HelpText>
      <strong>Manual scope:</strong> {citation}. <strong>Basis:</strong> {basis}
    </HelpText>
  );
}

function TallyTable({ caption, rows, countLabel = 'Count', fractionLabel = 'Fraction' }) {
  return (
    <table style={gridStyle}>
      <caption style={captionStyle}>{caption}</caption>
      <thead><tr><th scope="col" style={thStyle}>Outcome</th><th scope="col" style={thStyle}>{countLabel}</th><th scope="col" style={thStyle}>{fractionLabel}</th></tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row" style={{ ...tdStyle, textAlign: 'left', fontFamily: 'var(--font-sans)' }}>{row.label}</th>
            <td style={tdStyle}>{row.count}</td>
            <td style={tdStyle}>{row.fraction.toFixed(4)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FrequencyTable({ caption, rows }) {
  return (
    <table style={gridStyle}>
      <caption style={captionStyle}>{caption}</caption>
      <thead><tr><th scope="col" style={thStyle}>Genotype</th><th scope="col" style={thStyle}>Frequency</th></tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row" style={{ ...tdStyle, textAlign: 'left', fontFamily: 'var(--font-sans)' }}>{row.label}</th>
            <td style={tdStyle}>{row.value.toFixed(4)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PunnettPanel({ genetics, parentA, setParentA, parentB, setParentB }) {
  const result = punnettCross(parentA, parentB);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>What you know</SectionHeading>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <TextField label="Parent 1 genotype" value={parentA} onChange={(event) => setParentA(event.target.value)} style={mono} help="Allele pairs such as Aa, AaBb or AaBbCc." />
          <TextField label="Parent 2 genotype" value={parentB} onChange={(event) => setParentB(event.target.value)} style={mono} help="Same loci, in the same order, as parent 1." />
        </div>
      </Card>
      {result.error
        ? <StatusMessage tone="error">{result.error}</StatusMessage>
        : (
          <Card style={{ display: 'grid', gap: 12 }}>
            <SectionHeading>Live cross result</SectionHeading>
            <ResultPanel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Readout label="Loci" value={result.loci.join(', ')} />
                <Readout label="Cells" value={result.total} />
                <Readout label="Parent 1 gametes" value={result.gametesA.join('  ')} />
                <Readout label="Parent 2 gametes" value={result.gametesB.join('  ')} />
              </div>
            </ResultPanel>
            <div style={{ overflowX: 'auto', maxWidth: 420 }}>
              <table style={gridStyle}>
                <caption style={captionStyle}>Punnett square</caption>
                <thead>
                  <tr>
                    <th scope="col" style={thStyle}>×</th>
                    {result.gametesB.map((gamete) => <th key={gamete} scope="col" style={thStyle}>{gamete}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {result.grid.map((row, rowIndex) => (
                    <tr key={result.gametesA[rowIndex]}>
                      <th scope="row" style={{ ...tdStyle, fontFamily: 'var(--font-sans)' }}>{result.gametesA[rowIndex]}</th>
                      {row.map((genotype, cellIndex) => <td key={`${rowIndex}-${cellIndex}`} style={{ ...tdStyle, fontFamily: 'var(--font-sans)' }}>{genotype}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <TallyTable caption="Genotype outcomes" rows={result.genotypes} />
              <TallyTable caption="Phenotype outcomes" rows={result.phenotypes} />
            </div>
            <BasisNote citation={genetics.citations.punnett} basis={genetics.bases.crosses} />
          </Card>
        )}
    </div>
  );
}

function HardyPanel({ genetics, mode, setMode, pInput, setPInput, affected, setAffected, population, setPopulation }) {
  const result = mode === 'p'
    ? hardyFromP(pInput)
    : mode === 'recessive'
      ? hardyFromRecessive(affected, population)
      : hardyFromDominant(affected, population);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>What you know</SectionHeading>
        <SelectField label="Given" value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="p">Dominant allele frequency (p)</option>
          <option value="recessive">Recessive phenotype count</option>
          <option value="dominant">Dominant phenotype count</option>
        </SelectField>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {mode === 'p'
            ? <NumberField label="Allele frequency p" value={pInput} onChange={(event) => setPInput(event.target.value)} step="0.01" help="Between 0 and 1; q = 1 − p." />
            : (
              <>
                <NumberField label={mode === 'recessive' ? 'Recessive individuals' : 'Dominant individuals'} value={affected} onChange={(event) => setAffected(event.target.value)} />
                <NumberField label="Population size" value={population} onChange={(event) => setPopulation(event.target.value)} />
              </>
            )}
        </div>
      </Card>
      {result.error
        ? <StatusMessage tone="error">{result.error}</StatusMessage>
        : (
          <Card style={{ display: 'grid', gap: 12 }}>
            <SectionHeading>Live equilibrium result</SectionHeading>
            <ResultPanel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                <Readout label="p" value={result.p.toFixed(4)} />
                <Readout label="q" value={result.q.toFixed(4)} />
                {result.source && <Readout label="Solved from" value={result.source} />}
              </div>
            </ResultPanel>
            <FrequencyTable caption="Expected genotype frequencies" rows={result.frequencies} />
            <BasisNote citation={genetics.citations.hardyWeinberg} basis={genetics.bases.hardyWeinberg} />
          </Card>
        )}
    </div>
  );
}

function MappingPanel({ genetics, mapMode, setMapMode, parentalCount, setParentalCount, recombinantCount, setRecombinantCount, threePoint, setThreePoint }) {
  const twoPoint = mapTwoPoint(parentalCount, recombinantCount);
  const classes = threePoint.map((row) => ({ gamete: row.gamete, count: row.count }));
  const threeResult = mapThreePoint(classes);
  const setRow = (index, key, value) => setThreePoint(threePoint.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Tabs tabs={MAP_TABS} active={mapMode} onChange={setMapMode} ariaLabel="Mapping method" />
      {mapMode === 'two' ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <Card style={{ display: 'grid', gap: 12 }}>
            <SectionHeading>What you know</SectionHeading>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <NumberField label="Parental progeny" value={parentalCount} onChange={(event) => setParentalCount(event.target.value)} />
              <NumberField label="Recombinant progeny" value={recombinantCount} onChange={(event) => setRecombinantCount(event.target.value)} />
            </div>
          </Card>
          {twoPoint.error
            ? <StatusMessage tone="error">{twoPoint.error}</StatusMessage>
            : (
              <Card style={{ display: 'grid', gap: 12 }}>
                <SectionHeading>Live two-point result</SectionHeading>
                <ResultPanel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                    <Readout label="Total progeny" value={twoPoint.total} />
                    <Readout label="Recombination frequency" value={twoPoint.frequency.toFixed(4)} />
                    <Readout label="Map distance" value={`${twoPoint.centiMorgans.toFixed(2)} cM`} />
                  </div>
                </ResultPanel>
                <BasisNote citation={genetics.citations.mappingTwoGene} basis={genetics.bases.mapping} />
              </Card>
            )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <Card style={{ display: 'grid', gap: 12 }}>
            <SectionHeading>What you know — eight testcross classes</SectionHeading>
            <div style={{ overflowX: 'auto' }}>
              <table style={gridStyle}>
                <caption style={captionStyle}>Three-point progeny classes</caption>
                <thead><tr><th scope="col" style={thStyle}>Class</th><th scope="col" style={thStyle}>Gamete</th><th scope="col" style={thStyle}>Count</th></tr></thead>
                <tbody>
                  {threePoint.map((row, index) => (
                    <tr key={index}>
                      <th scope="row" style={{ ...tdStyle, fontFamily: 'var(--font-sans)' }}>{index + 1}</th>
                      <td style={tdStyle}>
                        <TextField label={`Gamete class ${index + 1}`} value={row.gamete} onChange={(event) => setRow(index, 'gamete', event.target.value)} style={{ ...mono, width: 72 }} />
                      </td>
                      <td style={tdStyle}>
                        <NumberField label={`Count ${index + 1}`} value={row.count} onChange={(event) => setRow(index, 'count', event.target.value)} style={{ width: 90 }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <HelpText>The two largest classes are the parentals; the two smallest are the double crossovers. Letters are positional alleles; use the same three loci in every class.</HelpText>
          </Card>
          {threeResult.error
            ? <StatusMessage tone="error">{threeResult.error}</StatusMessage>
            : (
              <Card style={{ display: 'grid', gap: 12 }}>
                <SectionHeading>Live three-point result</SectionHeading>
                <ResultPanel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                    <Readout label="Total progeny" value={threeResult.total} />
                    <Readout label="Gene order" value={threeResult.geneOrder.join(' – ')} />
                    <Readout label="Parentals" value={threeResult.parentals.join(', ')} />
                    <Readout label="Double crossovers" value={threeResult.dcos.join(', ')} />
                  </div>
                </ResultPanel>
                <TallyTable caption="Interval distances" countLabel="Distance (cM)" fractionLabel="Recombination frequency" rows={threeResult.intervals.map((interval) => ({ label: interval.label, count: Number(interval.centiMorgans.toFixed(2)), fraction: interval.frequency }))} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  <Readout label="Observed DCO" value={threeResult.observedDco} />
                  <Readout label="Expected DCO" value={threeResult.expectedDco.toFixed(2)} />
                  <Readout label="Coefficient of coincidence" value={threeResult.coefficientOfCoincidence?.toFixed(4) ?? '—'} />
                  <Readout label="Interference" value={threeResult.interference?.toFixed(4) ?? '—'} />
                </div>
                <BasisNote citation={genetics.citations.mappingThreeGene} basis={genetics.bases.mapping} />
              </Card>
            )}
        </div>
      )}
    </div>
  );
}

function HeritabilityPanel({ genetics, vg, setVg, vp, setVp, va, setVa, response, setResponse, selectionDifferential, setSelectionDifferential }) {
  const result = heritabilityEstimates({ vg, vp, va, response, selectionDifferential });
  const format = (value) => (value === null ? '—' : value.toFixed(4));
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>What you know</SectionHeading>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <NumberField label="Genetic variance (Vg)" value={vg} onChange={(event) => setVg(event.target.value)} />
          <NumberField label="Phenotypic variance (Vp)" value={vp} onChange={(event) => setVp(event.target.value)} />
          <NumberField label="Additive variance (Va)" value={va} onChange={(event) => setVa(event.target.value)} />
          <NumberField label="Selection response (R)" value={response} onChange={(event) => setResponse(event.target.value)} />
          <NumberField label="Selection differential (S)" value={selectionDifferential} onChange={(event) => setSelectionDifferential(event.target.value)} />
        </div>
      </Card>
      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>Live heritability estimates</SectionHeading>
        <ResultPanel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <Readout label="Broad sense H² = Vg / Vp" value={format(result.broad)} />
            <Readout label="Narrow sense h² = Va / Vp" value={format(result.narrow)} />
            <Readout label="Realized h² = R / S" value={format(result.realized)} />
          </div>
        </ResultPanel>
        <BasisNote citation={genetics.citations.heritability} basis={genetics.bases.heritability} />
      </Card>
    </div>
  );
}

export default function GeneticsWorkbench() {
  const genetics = ACTIVE_DATA.designergenes.genetics;
  const [tab, setTab] = useState('cross');
  const [parentA, setParentA] = useState('Aa');
  const [parentB, setParentB] = useState('Aa');
  const [hardyMode, setHardyMode] = useState('p');
  const [pInput, setPInput] = useState('0.3');
  const [affected, setAffected] = useState('16');
  const [population, setPopulation] = useState('100');
  const [showMapping, setShowMapping] = useState(false);
  const [mapMode, setMapMode] = useState('two');
  const [parentalCount, setParentalCount] = useState('85');
  const [recombinantCount, setRecombinantCount] = useState('15');
  const [threePoint, setThreePoint] = useState(DEFAULT_THREE_POINT);
  const [showHeritability, setShowHeritability] = useState(false);
  const [vg, setVg] = useState('60');
  const [vp, setVp] = useState('100');
  const [va, setVa] = useState('40');
  const [response, setResponse] = useState('5');
  const [selectionDifferential, setSelectionDifferential] = useState('10');

  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 960 }}>
      <ToolHeader
        eyebrow={`Designer Genes C · ${ACTIVE_SEASON.year} · Manual C20–C21`}
        purpose="Enter genotypes, allele data or progeny counts. Every result is derived live from what you type — no answer bank, no Calculate button."
        manualReference={ACTIVE_DATA.designergenes.manualReference}
      />
      <Tabs tabs={TABS} active={tab} onChange={setTab} ariaLabel="Genetics topics" />
      {tab === 'cross' && <PunnettPanel genetics={genetics} parentA={parentA} setParentA={setParentA} parentB={parentB} setParentB={setParentB} />}
      {tab === 'hardy' && <HardyPanel genetics={genetics} mode={hardyMode} setMode={setHardyMode} pInput={pInput} setPInput={setPInput} affected={affected} setAffected={setAffected} population={population} setPopulation={setPopulation} />}
      {tab === 'mapping' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <Card>
            <ToggleSwitch
              label={`Show tournament-level mapping (${genetics.levels.twoGeneMapping} / ${genetics.levels.threeGeneMapping})`}
              checked={showMapping}
              onChange={(event) => setShowMapping(event.target.checked)}
              help="Two-gene mapping is State & National; three-gene mapping is National. Regional scope does not include these."
            />
          </Card>
          {showMapping
            ? <MappingPanel genetics={genetics} mapMode={mapMode} setMapMode={setMapMode} parentalCount={parentalCount} setParentalCount={setParentalCount} recombinantCount={recombinantCount} setRecombinantCount={setRecombinantCount} threePoint={threePoint} setThreePoint={setThreePoint} />
            : <StatusMessage>Gene mapping is gated to tournament levels. Switch it on above to work two- or three-point crosses.</StatusMessage>}
        </div>
      )}
      {tab === 'heritability' && (
        <div style={{ display: 'grid', gap: 12 }}>
          <Card>
            <ToggleSwitch
              label={`Show tournament-level heritability (${genetics.levels.heritability})`}
              checked={showHeritability}
              onChange={(event) => setShowHeritability(event.target.checked)}
              help="Quantitative-trait heritability is a State & National topic."
            />
          </Card>
          {showHeritability
            ? <HeritabilityPanel genetics={genetics} vg={vg} setVg={setVg} vp={vp} setVp={setVp} va={va} setVa={setVa} response={response} setResponse={setResponse} selectionDifferential={selectionDifferential} setSelectionDifferential={setSelectionDifferential} />
            : <StatusMessage>Heritability is gated to State & National. Switch it on above to estimate broad, narrow and realized heritability.</StatusMessage>}
        </div>
      )}
    </div>
  );
}
