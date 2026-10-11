# Designer Genes C — verified 2027 tool plan

Source: supplied 2027 Division C Rules Manual, pp. C20–C21. 2027 focus is genetics plus standard molecular biology (eukaryotic expression). No prior-year-only topics. Writing utensils, two Class II calculators, and one two-sided 8.5 × 11 in notes sheet are allowed; no clipboard-only restriction exists. The event emphasizes quantitative reasoning and data interpretation, which makes generator tools the strongest fit.

## Tool: Genetics Workbench
- **Status:** Planned
- **Category:** Calculator
- **Goal:** Work through 2027 genetics problems that show work: Mendelian/classical genetics, molecular biology of a gene (DNA/RNA/protein), gene expression, crosses/pedigrees, population genetics, plus the manual's level-tagged topics.
- **Core interaction loop:** 1) Enter the given genotypes/allele data or a cross. 2) Generate/hold the Punnett-square, pedigree, or allele-frequency calculation with shown steps. 3) Review results against the manual §3 topic list (pp. C20–C21).
- **Content & data:** Manual §3 topics (Mendelian crosses incl. mono/di/trihybrid Punnett squares, pedigrees, allele frequencies and genetic drift, quantitative trait estimation, chromosomal gene mapping, Hardy–Weinberg); user-entered values only.
- **UI components:** Topic selector, input fields, step-by-step result panel.
- **Scoring & feedback:** Formulas and results shown as work; labeled practice, not official scoring.
- **Level gating:** core Regional; two-gene mapping and heritability at State; three-gene mapping, PCR/sequencing techniques, RNAi, CRISPR, ChIP-seq/Hi-C/RNA-seq at State and Nationals.
- **Persistence:** none.
- **Open questions:** Students may use scratch paper at some sites; decide whether work should be auto-saved.

## Tool: Molecular Sequence Workbench
- **Status:** Planned
- **Category:** Practice
- **Goal:** Manipulate and interpret DNA/RNA/protein sequences with standard molecular-biology operations.
- **Core interaction loop:** 1) Enter or generate a DNA/RNA sequence. 2) Run a tool: complement / reverse-complement, transcription, translation (codon table), reading frames, and mutation consequence (silent / missense / nonsense / frameshift). 3) Review the annotated result against the matching manual §3 topic.
- **Content & data:** Manual §3 DNA and gene-expression scope — structure/directionality, replication/fidelity, genome organization, mutation/protein consequences, transcription, translation; restriction-site and PCR-primer helpers gated to State/National. Sequences are user-entered or generated, not a fixed quiz bank.
- **UI components:** Sequence input/generator, tool selector, annotated output (highlighted codons/affected residues).
- **Scoring & feedback:** Verifies transformations against the standard genetic code; practice only.
- **Level gating:** advanced techniques (restriction/PCR/CRISPR) gated to State/National.
- **Persistence:** none (or localStorage if requested).

## Tool: Karyotype and Meiosis Drill
- **Status:** Planned
- **Category:** Practice
- **Goal:** Identify mitosis/meiosis stages, nondisjunction, and karyotype features.
- **Core interaction loop:** 1) Pick a stage or a karyotype case. 2) Identify/classify the stage or the abnormality. 3) Reveal the manual-cited answer.
- **Content & data:** Manual §3 mitosis/meiosis scope — stages, nondisjunction, karyotypes; V(D)J recombination and class switching gated to State/National.
- **UI components:** Stage/karyotype prompt, classification inputs, reference panel.
- **Scoring & feedback:** Identify-against-key; practice only.
- **Level gating:** V(D)J recombination and class switching at State/National.
- **Persistence:** none.

## Tool: Reference & Study Compiler
- **Status:** Live — `src/components/events/designergenes/DesignerGenesReferenceCompiler.jsx` (shared engine `src/components/general/ReferenceCompiler.jsx`)
- **Category:** Notebook
- **Goal:** Build the one allowed double-sided reference sheet and track coverage of the manual's official objectives.
- **Core interaction loop:** 1) Work the objective checklist transcribed from the manual's topic list and mark each item Not started / Studying / Confident. 2) Author reference blocks (text, small tables, diagrams) filed under the matching objective. 3) Prune: hide Confident items so the sheet holds only what still needs support. 4) Export a print-ready sheet sized to 8.5 × 11 in, both sides.
- **Content & data:** Objective outline transcribed from manual pp. C20–C21 (rule-derived, no invented content); user-authored reference content only. Allowed resource: one double-sided 8.5 × 11 in notes sheet per team; lamination/protection permitted; multiple sheets and affixed labels prohibited.
- **UI components:** Objective checklist with status + level filter, reference block editor grouped by objective, mastery-prune filter, live space budget, print/export.
- **Scoring & feedback:** none (organizer); space budget warns when content exceeds one double-sided sheet.
- **Level gating:** objectives tagged Core / State-National / National-only.
- **Persistence:** localStorage (explicit save/restore); print-to-PDF and JSON export; text escaped.
- **Open questions:** shared engine with per-event config (sheet mode).

This is a planning document only and does not invent official scoring.
