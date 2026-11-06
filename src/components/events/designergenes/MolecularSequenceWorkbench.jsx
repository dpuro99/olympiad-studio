import { useMemo, useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  MUTATION_KINDS,
  MUTATION_LABELS,
  RESTRICTION_ENZYMES,
  classifyMutation,
  findRestrictionSites,
  gcContent,
  generateSequence,
  normalizeSequence,
  readingFrames,
  residueName,
  reverseComplement,
  transcribe,
  translate
} from './sequenceUtils';
import {
  Button,
  Card,
  Collapsible,
  EmptyState,
  HelpText,
  PrimaryAction,
  ResultPanel,
  SectionHeading,
  StatusMessage,
  Tabs,
  TextAreaField,
  ToggleSwitch,
  ToolHeader
} from '../../general/ui/primitives';

const MODES = [
  { id: 'translate', label: 'Translate' },
  { id: 'frames', label: 'Reading frames' },
  { id: 'mutation', label: 'Mutation' },
  { id: 'sites', label: 'Restriction map' }
];

const DEFAULT_SEQUENCE = 'ATGGCGTTTAAACCCGGGTAA';
const DEFAULT_VARIANT = 'ATGGTGTTTAAACCCGGGTAA';

const mono = { fontFamily: 'var(--font-sans)' };
const codonBoxStyle = { display: 'grid', justifyItems: 'center', gap: 1, padding: '4px 6px', minWidth: 64, border: '1px solid var(--color-border-secondary)', borderRadius: 6, background: 'var(--color-background-tertiary)' };

function CodonStrip({ codons }) {
  if (!codons.length) return <EmptyState>The sequence is shorter than one codon.</EmptyState>;
  return <ol aria-label="Codons and translated residues" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>{codons.map((codon) => { const color = codon.isStop ? 'var(--color-text-danger)' : codon.isStart ? 'var(--color-text-info)' : 'var(--color-text-primary)'; return <li key={`${codon.index}-${codon.codon}`} style={{ ...codonBoxStyle, borderColor: color }} aria-label={`Codon ${codon.position}: ${codon.codon}, ${codon.isStop ? 'stop' : codon.code ? `${residueName(codon.code)} (${codon.code})` : 'unassigned'}`}><span style={{ ...mono, fontSize: 14, color }}>{codon.codon}</span><span style={{ fontSize: 10, color }}>{codon.isStop ? 'Stop' : codon.code ?? '?'}</span><span style={{ fontSize: 9, color: 'var(--color-text-secondary)' }}>{codon.isStop ? 'terminates' : codon.name.replace(' (start)', '')}</span></li>; })}</ol>;
}

function Readout({ label, value, wide = false }) {
  return <div style={{ display: 'grid', gap: 2, minWidth: 120, flex: wide ? '1 1 100%' : '0 1 auto' }}><span style={{ color: 'var(--color-text-secondary)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span><span style={{ ...mono, fontSize: 12, color: 'var(--color-text-primary)', overflowWrap: 'anywhere' }}>{value}</span></div>;
}

function TranslatePanel({ sequence }) {
  const translated = useMemo(() => translate(sequence), [sequence]);
  return <div style={{ display: 'grid', gap: 12 }}><ResultPanel><div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}><Readout label="Peptide (N→C)" value={`${translated.protein || '—'} (${translated.protein.length} residue${translated.protein.length === 1 ? '' : 's'})`} /><Readout label="mRNA" value={transcribe(sequence)} wide /><Readout label="Stop codon" value={translated.stopCodon ?? 'none'} /><Readout label="Leftover bases" value={translated.leftoverBases} /></div></ResultPanel><CodonStrip codons={translated.codons} /><HelpText>Translation starts at the first base, reads 5′→3′ in codons, stops at first stop codon (UAA, UAG, UGA). Start codon is highlighted but doesn't change frame.</HelpText></div>;
}

function FramesPanel({ sequence }) {
  const [includeReverse, setIncludeReverse] = useState(true);
  const frames = useMemo(() => readingFrames(sequence, { includeReverse }), [sequence, includeReverse]);
  return <div style={{ display: 'grid', gap: 12 }}><ToggleSwitch label="Include reverse strand" checked={includeReverse} onChange={(e) => setIncludeReverse(e.target.checked)} help="Minus-strand frames use reverse complement; same DNA reads in six registers." /><ul aria-label="Reading frames" style={{ display: 'grid', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>{frames.map((frame) => <li key={frame.id} style={{ ...codonBoxStyle, justifyItems: 'start', gap: 4, padding: 10 }}><span style={{ ...mono, fontSize: 11, color: 'var(--color-text-info)' }}>Frame {frame.id} · starts at base {frame.offset + 1}</span><span aria-label={`Frame ${frame.id} translation`} style={{ ...mono, fontSize: 13, overflowWrap: 'anywhere', lineHeight: 1.6 }}>{frame.marked || '—'}</span><span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{frame.codons.length} codon{frame.codons.length === 1 ? '' : 's'} · {frame.leftoverBases} leftover base{frame.leftoverBases === 1 ? '' : 's'} · stops shown as *</span></li>)}</ul><HelpText>Only one frame usually yields a long open reading frame. Compare frames to find the coding sequence.</HelpText></div>;
}

function describeMutation(result) {
  if (result.identical) return 'The variant is identical to the reference — no change.';
  if (result.kind === MUTATION_KINDS.FRAMESHIFT) return `The variant is ${Math.abs(result.delta)} base${Math.abs(result.delta) === 1 ? '' : 's'} ${result.delta > 0 ? 'longer' : 'shorter'} (not a multiple of 3). Every codon after position ${result.codonIndex + 1} is re-read.`;
  if (result.kind === MUTATION_KINDS.IN_FRAME_INDEL) return `The variant is ${Math.abs(result.delta)} bases ${result.delta > 0 ? 'longer' : 'shorter'} — a whole number of codons. Frame preserved; residues around codon ${result.codonIndex + 1} added/removed.`;
  return `${result.changes.length} substitution${result.changes.length === 1 ? '' : 's'} change${result.changes.length === 1 ? 's' : ''} the peptide. Compare each codon below.`;
}

function MutationPanel({ sequence, reference, variant, onReference, onVariant }) {
  const parsedReference = normalizeSequence(reference);
  const parsedVariant = normalizeSequence(variant);
  const result = useMemo(() => { if (parsedReference.error || parsedVariant.error) return null; return classifyMutation(parsedReference.sequence, parsedVariant.sequence); }, [parsedReference.sequence, parsedReference.error, parsedVariant.sequence, parsedVariant.error]);
  return <div style={{ display: 'grid', gap: 12 }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}><Button onClick={() => onReference(sequence)} disabled={!sequence || sequence === reference}>Use input sequence as reference</Button><HelpText>Compares against the sequence input above unless you type a different reference.</HelpText></div><div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'}}><TextAreaField label="Reference (5′→3′)" rows={3} value={reference} onChange={(e) => onReference(e.target.value)} style={mono} /><TextAreaField label="Variant (5′→3′)" rows={3} value={variant} onChange={(e) => onVariant(e.target.value)} style={mono} help="Same length for substitutions; add/remove bases for indels." /></div>{parsedReference.error && <StatusMessage tone="error">Reference: {parsedReference.error}</StatusMessage>}{parsedVariant.error && <StatusMessage tone="error">Variant: {parsedVariant.error}</StatusMessage>}{result && !result.error && (<> <ResultPanel><div style={{ display: 'grid', gap: 6 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{MUTATION_LABELS[result.kind]}</div><div>{describeMutation(result)}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 4 }}><Readout label="Ref peptide" value={result.referenceProtein || '—'} /><Readout label="Var peptide" value={result.variantProtein || '—'} /></div></div></ResultPanel>{result.changes?.length > 0 && <Collapsible summary="Substitutions & codon consequences" defaultOpen={true}><div style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}><caption style={{ captionSide: 'top', textAlign: 'left', paddingBottom: 6, color: 'var(--color-text-secondary)', fontSize: 11 }}>Substitutions and their codon-level consequence</caption><thead><tr>{['Base', 'Change', 'Codon', 'Residue', 'Effect'].map((h) => <th key={h} scope="col" style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-tertiary)', color: 'var(--color-text-secondary)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}</tr></thead><tbody>{result.changes.map((c) => <tr key={c.nucleotideIndex}><td style={{ padding: '6px 8px', ...mono }}>{c.position}</td><td style={{ padding: '6px 8px', ...mono }}>{c.from} → {c.to}</td><td style={{ padding: '6px 8px', ...mono }}>{c.referenceCodon} → {c.variantCodon}</td><td style={{ padding: '6px 8px', ...mono }}>{c.referenceCode ? `${c.referenceCode} (${residueName(c.referenceCode)})` : '—'} → {c.variantCode ? `${c.variantCode} (${residueName(c.variantCode)})` : '—'}</td><td style={{ padding: '6px 8px' }}>{MUTATION_LABELS[c.kind]}</td></tr>)}</tbody></table></div></Collapsible>}</>)}<HelpText>Substitutions: silent (same residue), missense (different residue), nonsense (creates stop), stop-loss (removes stop). Indels shift frame unless length is a multiple of 3.</HelpText></div>;
}

function SitesPanel({ sequence }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const hits = useMemo(() => (showAdvanced ? findRestrictionSites(sequence) : []), [sequence, showAdvanced]);
  return <div style={{ display: 'grid', gap: 12 }}><ToggleSwitch label="Show State/National restriction mapping" checked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} help="Restriction mapping is a supporting technique; manual reserves advanced set for State/National." />{!showAdvanced && <StatusMessage>Restriction-site mapping off at Regional scope. Switch on to screen for common recognition sites.</StatusMessage>}{showAdvanced && (<> <ResultPanel><div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}><Readout label="Length" value={`${sequence.length} bp`} /><Readout label="Sites found" value={hits.reduce((t, h) => t + h.count, 0)} /><Readout label="Enzymes screened" value={RESTRICTION_ENZYMES.length} /></div></ResultPanel>{hits.length === 0 ? <EmptyState icon="ti-search-off" title="No sites found" description="No recognition sites from the screened set appear in this sequence." /> : <ul aria-label="Restriction sites" style={{ display: 'grid', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>{hits.map((hit) => <li key={hit.name} style={{ ...codonBoxStyle, justifyItems: 'start', gap: 2, padding: 10 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{hit.name}</span><span style={{ ...mono, fontSize: 12 }}>{hit.site}</span><span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{hit.count} site{hit.count === 1 ? '' : 's'} · positions {hit.positions.map((p) => `${p.start}–${p.end}`).join(', ')}</span></li>)}</ul>}<HelpText>Recognition sites are palindromic; same motif reads same on both strands. Positions 1-based inclusive; a match ≠ guaranteed cut.</HelpText></>)}</div>;
}

export default function MolecularSequenceWorkbench() {
  const [mode, setMode] = useState('translate');
  const [dna, setDna] = useState(DEFAULT_SEQUENCE);
  const [reference, setReference] = useState(DEFAULT_SEQUENCE);
  const [variant, setVariant] = useState(DEFAULT_VARIANT);
  const [showSequenceDetails, setShowSequenceDetails] = useState(false);

  const parsed = normalizeSequence(dna);
  const sequence = parsed.sequence;
  const composition = sequence ? gcContent(sequence) : null;
  const complement = sequence ? reverseComplement(sequence) : '';

  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 960 }}>
      <ToolHeader eyebrow={`Designer Genes C · ${ACTIVE_SEASON.year} · Manual C20–C21`} purpose="Paste or generate a DNA sequence. Pick a tool tab. Everything updates live — no question bank, all practice." manualReference={ACTIVE_DATA.designergenes.manualReference} />

      {/* ── 1. SEQUENCE INPUT (always visible, compact) ── */}
      <Card style={{ display: 'grid', gap: 12 }}>
        <SectionHeading>DNA sequence (5′ → 3′)</SectionHeading>
        <TextAreaField label="DNA" rows={3} value={dna} onChange={(e) => setDna(e.target.value)} style={mono} help="Whitespace ignored. DNA uses A, C, G, T; transcription converts T→U." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <PrimaryAction label="Generate random" icon="ti-dice" onClick={() => setDna(generateSequence({ codons: 8 }))} />
          <PrimaryAction label="Reverse complement" icon="ti-arrow-flip-vertical" onClick={() => setDna(complement)} disabled={!sequence} />
        </div>
        {parsed.error && dna.trim() && <StatusMessage tone="error">{parsed.error}</StatusMessage>}
        {sequence && (
          <Collapsible summary={`Composition — ${sequence.length} bp, ${composition?.percent.toFixed(1) || 0}% GC`} defaultOpen={false}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, paddingTop: 8, borderTop: '1px solid var(--color-border-tertiary)' }}>
              <Readout label="Length" value={`${sequence.length} bp`} />
              <Readout label="GC content" value={`${composition.percent.toFixed(1)}% (${composition.gc}/${composition.total})`} />
              <Readout label="mRNA" value={transcribe(sequence)} wide />
              <Readout label="Reverse complement" value={complement} wide />
            </div>
          </Collapsible>
        )}
      </Card>

      {/* ── 2. TOOL TABS (primary) ── */}
      <Card style={{ display: 'grid', gap: 12 }}>
        <Tabs tabs={MODES} active={mode} onChange={setMode} ariaLabel="Sequence tools" />
        {!sequence ? <EmptyState icon="ti-dna" title="Enter a DNA sequence" description="Type or generate a sequence above to use the tools." /> : mode === 'translate' ? <TranslatePanel sequence={sequence} /> : mode === 'frames' ? <FramesPanel sequence={sequence} /> : mode === 'mutation' ? <MutationPanel sequence={sequence} reference={reference} variant={variant} onReference={setReference} onVariant={setVariant} /> : <SitesPanel sequence={sequence} />}
      </Card>
    </div>
  );
}