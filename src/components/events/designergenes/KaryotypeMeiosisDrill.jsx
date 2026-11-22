import { useState } from 'react';
import { ACTIVE_DATA } from '../../../seasons/active.js';
import { ACTIVE_SEASON } from '../../../seasons/manifest.js';
import {
  KARYOTYPE_ROWS,
  checkKaryotypeCase,
  checkNondisjunctionCase,
  checkStageCase,
  makeKaryotypeCase,
  makeNondisjunctionCase,
  makeStageCase
} from './cellGeneticsUtils';
import {
  Button,
  Card,
  HelpText,
  ResultPanel,
  SectionHeading,
  StatusMessage,
  Tabs,
  ToggleSwitch,
  ToolHeader
} from '../../general/ui/primitives';

const TABS = [
  { id: 'stages', label: 'Stage classification' },
  { id: 'nondisjunction', label: 'Nondisjunction' },
  { id: 'karyotype', label: 'Karyotypes' }
];

const mono = { fontFamily: 'var(--font-mono)' };
const optionBase = {
  padding: '9px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
  fontSize: 13, textAlign: 'left', border: '1px solid var(--color-border-secondary)',
  background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)'
};
const optionSelected = {
  border: '1px solid var(--color-accent-primary)', background: 'var(--color-background-info)', fontWeight: 600
};

function BasisNote({ citation, basis }) {
  return (
    <HelpText>
      <strong>Manual scope:</strong> {citation}. <strong>Basis:</strong> {basis}
    </HelpText>
  );
}

function ChoiceButtons({ options, selected, onSelect, name }) {
  return (
    <div role="group" aria-label={name} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={selected === option.id}
          onClick={() => onSelect(option.id)}
          style={{ ...optionBase, ...(selected === option.id ? optionSelected : {}) }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function StagePanel({ cellGenetics, seed, onGrade }) {
  const caseData = makeStageCase(seed);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const graded = checked ? checkStageCase(caseData, selected) : null;
  const submit = () => {
    const result = checkStageCase(caseData, selected);
    setChecked(true);
    onGrade(result.correct);
  };
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>What you observe</SectionHeading>
        <HelpText>These cues are standard-biology study aids, not an image from the manual.</HelpText>
        <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6, fontSize: 13, lineHeight: 1.5 }}>
          {caseData.cues.map((cue) => <li key={cue.id}>{cue.text}</li>)}
        </ul>
      </Card>
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Which stage fits every cue?</SectionHeading>
        <ChoiceButtons options={caseData.options} selected={selected} onSelect={setSelected} name="Stage options" />
        <div>
          <Button variant="primary" disabled={!selected || checked} onClick={submit}>Check answer</Button>
        </div>
        {graded && (
          <ResultPanel>
            <StatusMessage tone={graded.correct ? 'success' : 'error'}>
              {graded.correct ? 'Correct — ' : 'Not quite — '}{graded.answerLabel} ({graded.division})
            </StatusMessage>
            <p style={{ margin: '8px 0 0' }}>{graded.explanation}</p>
          </ResultPanel>
        )}
        <BasisNote citation={cellGenetics.citations.stages} basis={cellGenetics.bases.stages} />
      </Card>
    </div>
  );
}

function NondisjunctionPanel({ cellGenetics, seed, onGrade }) {
  const caseData = makeNondisjunctionCase(seed);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const graded = checked ? checkNondisjunctionCase(caseData, selected) : null;
  const submit = () => {
    const result = checkNondisjunctionCase(caseData, selected);
    setChecked(true);
    onGrade(result.correct);
  };
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Four gamete chromosome complements</SectionHeading>
        <HelpText>Each gamete is described relative to the usual haploid set, n.</HelpText>
        <ul aria-label="Gamete chromosome complements" style={{ margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none' }}>
          {caseData.gametes.map((gamete, index) => (
            <li key={`${gamete}-${index}`} style={{ ...mono, padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-secondary)', fontSize: 14 }}>
              {gamete}
            </li>
          ))}
        </ul>
      </Card>
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Where did the chromosomes fail to separate?</SectionHeading>
        <ChoiceButtons options={caseData.options} selected={selected} onSelect={setSelected} name="Division options" />
        <div>
          <Button variant="primary" disabled={!selected || checked} onClick={submit}>Check answer</Button>
        </div>
        {graded && (
          <ResultPanel>
            <StatusMessage tone={graded.correct ? 'success' : 'error'}>
              {graded.correct ? 'Correct — ' : 'Not quite — '}the failure was in {graded.answerLabel}.
            </StatusMessage>
            <p style={{ margin: '8px 0 0' }}>Gametes: <span {...mono}>{graded.gametes.join(', ')}</span></p>
            <p style={{ margin: '4px 0 0' }}>After fertilisation by a normal gamete: <span {...mono}>{graded.zygotes.join(', ')}</span></p>
          </ResultPanel>
        )}
        <BasisNote citation={cellGenetics.citations.nondisjunction} basis={cellGenetics.bases.nondisjunction} />
      </Card>
    </div>
  );
}

function ChromosomeButton({ row, count, sex, selected, onSelect }) {
  const label = row === 'sex' ? `Sex chromosomes, ${sex}` : `Chromosome ${row}, ${count} copies`;
  return (
    <button
      type="button"
      aria-pressed={selected === row}
      aria-label={label}
      onClick={() => onSelect(row)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
        borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: 13,
        border: selected === row ? '1px solid var(--color-accent-primary)' : '1px solid var(--color-border-tertiary)',
        background: selected === row ? 'var(--color-background-info)' : 'var(--color-background-secondary)',
        color: 'var(--color-text-primary)', textAlign: 'left'
      }}
    >
      <span style={{ ...mono, minWidth: 30, fontSize: 12 }}>{row === 'sex' ? 'Sex' : row}</span>
      <span aria-hidden="true" style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: count }, (_, index) => (
          <span key={index} style={{ width: 9, height: 24, borderRadius: 5, background: 'var(--color-accent-primary)', opacity: 0.75 }} />
        ))}
      </span>
      <span {...mono} style={{ marginLeft: 'auto', fontSize: 12 }}>{row === 'sex' ? sex : count}</span>
    </button>
  );
}

function KaryotypePanel({ cellGenetics, seed, onGrade }) {
  const caseData = makeKaryotypeCase(seed);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const graded = checked ? checkKaryotypeCase(caseData, selected) : null;
  const submit = () => {
    const result = checkKaryotypeCase(caseData, selected);
    setChecked(true);
    onGrade(result.correct);
  };
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Synthetic karyotype</SectionHeading>
        <HelpText>Pick the row that differs from the usual two copies. The drawing is schematic; the grade comes from the chromosome counts.</HelpText>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
          {KARYOTYPE_ROWS.map((row) => {
            const count = row === 'sex' ? caseData.karyotype.sex.length : caseData.karyotype.autosomes[row];
            return <ChromosomeButton key={row} row={row} count={count} sex={caseData.karyotype.sex} selected={selected} onSelect={setSelected} />;
          })}
        </div>
        <div>
          <Button variant={selected === 'none' ? 'primary' : 'secondary'} aria-pressed={selected === 'none'} onClick={() => setSelected('none')}>
            No abnormality
          </Button>
        </div>
      </Card>
      <Card style={{ display: 'grid', gap: 10 }}>
        <SectionHeading>Detection result</SectionHeading>
        <div>
          <Button variant="primary" disabled={!selected || checked} onClick={submit}>Check answer</Button>
        </div>
        {graded && (
          <ResultPanel>
            <StatusMessage tone={graded.correct ? 'success' : 'error'}>
              {graded.correct ? 'Correct — ' : 'Not quite — '}{graded.label}
            </StatusMessage>
            <p style={{ margin: '8px 0 0' }}>Karyotype: <span {...mono}>{graded.notation}</span> · Total chromosomes: <span {...mono}>{graded.total}</span></p>
            <HelpText>{graded.detail}</HelpText>
          </ResultPanel>
        )}
        <BasisNote citation={cellGenetics.citations.karyotype} basis={cellGenetics.bases.karyotype} />
      </Card>
    </div>
  );
}

export default function KaryotypeMeiosisDrill() {
  const [tab, setTab] = useState('stages');
  const [seed, setSeed] = useState(1031);
  const [showTournament, setShowTournament] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const cellGenetics = ACTIVE_DATA.designergenes.cellGenetics;
  const grade = (correct) => setScore((current) => ({
    correct: current.correct + (correct ? 1 : 0),
    total: current.total + 1
  }));
  const panelKey = `${tab}-${seed}`;
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <ToolHeader
        eyebrow={`Designer Genes C · ${ACTIVE_SEASON.year} · Manual C20–C21`}
        purpose="Classify generated stage and nondisjunction cases, then read a synthetic karyotype. Each case is reproducible from its seed; grading comes from the derived model, and the manual citation and basis print with every topic."
        manualReference={ACTIVE_DATA.designergenes.manualReference}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <ToggleSwitch
            label="Show State/National topics"
            checked={showTournament}
            onChange={(event) => setShowTournament(event.target.checked)}
          />
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Case seed <span {...mono}>{seed}</span> · Score <span {...mono}>{score.correct}/{score.total}</span>
          </span>
          <Button onClick={() => setSeed((current) => current + 1)}>New case</Button>
        </div>
      </ToolHeader>
      <Tabs tabs={TABS} active={tab} onChange={setTab} ariaLabel="Cell genetics topics" />
      {!showTournament && (
        <HelpText>Somatic recombination (V(D)J recombination and class switching) is gated to State &amp; National — switch it on above to read the manual note.</HelpText>
      )}
      {showTournament && (
        <Card style={{ display: 'grid', gap: 8 }}>
          <SectionHeading>State &amp; National: somatic recombination</SectionHeading>
          <HelpText>The manual names V(D)J recombination and immunoglobulin class switching in immune cells. It prints no distinguishing detail, so this drill ships no graded cases for them; they remain study objectives in the Reference &amp; Study Compiler.</HelpText>
          <BasisNote citation={cellGenetics.citations.somaticRecombination} basis={cellGenetics.bases.somaticRecombination} />
        </Card>
      )}
      {tab === 'stages' && <StagePanel key={panelKey} cellGenetics={cellGenetics} seed={seed} onGrade={grade} />}
      {tab === 'nondisjunction' && <NondisjunctionPanel key={panelKey} cellGenetics={cellGenetics} seed={seed} onGrade={grade} />}
      {tab === 'karyotype' && <KaryotypePanel key={panelKey} cellGenetics={cellGenetics} seed={seed} onGrade={grade} />}
    </div>
  );
}
