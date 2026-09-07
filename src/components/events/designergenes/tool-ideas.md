## Designer Genes C — Tool Specs

### Tool: Punnett Square Master (Mono-, Di-, Tri-Hybrid)
**Event:** Designer Genes C
**Purpose:** Build speed and accuracy in constructing and interpreting Punnett squares across all three levels (mono-, di-, tri-hybrid crosses), since these are foundational to nearly every question in the event.
**Core interaction loop:**
1. Tool presents a cross (e.g., "AaBb × AaBb — predict offspring genotype and phenotype ratios, assuming complete dominance").
2. User constructs the Punnett square (grid-based interface) and fills in gametes and offspring genotypes.
3. Tool validates the square and auto-calculates phenotype ratios based on provided dominance relationships.
4. Tool optionally asks follow-up probability questions (e.g., "What is the probability of getting a homozygous recessive offspring?").
**Content/data needed:** Cross bank covering monohybrid, dihybrid, trihybrid, with increasingly complex dominance patterns (complete dominance, incomplete dominance, codominance, lethal alleles).
**UI components:** Punnett square grid (user can select size 2×2, 4×4, 8×8); gamete input areas; offspring genotype cells; auto-calculate phenotype ratios based on selected dominance model; visual feedback on correct/incorrect entries.
**Feedback/scoring logic:** Grid accuracy checked cell-by-cell; phenotype ratios auto-calculated once grid is correct; problems missed are queued for later replay; session summary shows weakest dominance patterns (incomplete dominance, etc.).

---

### Tool: Probability & Testcross Analyzer
**Event:** Designer Genes C
**Purpose:** Apply multiplication and addition rules to genetic scenarios, and use testcrosses to determine unknown genotypes — core problem-solving skills for harder exam questions.
**Core interaction loop:**
1. Tool presents a complex genetic scenario: "Two individuals with phenotype A_ (dominant) mate. Some offspring show the recessive phenotype. What is the probability that a randomly selected offspring showing phenotype A is heterozygous?"
2. User works through the logic: identifies possible parental genotypes (Aa × Aa), calculates offspring ratio, determines which phenotype-A offspring are heterozygous, and computes the conditional probability.
3. Tool validates each step and reveals the full solution.
4. Tool can present alternative scenarios (testcrosses, independent assortment, etc.).
**Content/data needed:** Problem bank covering conditional probability, multiplication/addition rules, testcross logic, and scenarios requiring multi-step reasoning.
**UI components:** Problem statement display; step-by-step solver (user fills in Punnett square, identifies possible genotypes, calculates ratios, then answers the probability question); solution reveal with conditional probability highlighted.
**Feedback/scoring logic:** Each logical step independently validated (possible parental genotypes, offspring ratios, filtering to the phenotype in question); incorrect identification of possible genotypes triggers Punnett square reconstruction; incorrect probability calculation triggers re-examination of the ratio.

---

### Tool: Pedigree Analyzer & Predictor
**Event:** Designer Genes C
**Purpose:** Quickly determine inheritance patterns (autosomal dominant/recessive, X-linked dominant/recessive) from pedigree structure, and predict genotypes at any position.
**Core interaction loop:**
1. Tool displays a multi-generation pedigree with some affected and unaffected individuals marked.
2. User determines the inheritance pattern (using multiple-choice or by elimination) and enters the genotype of a selected individual.
3. Tool validates the inheritance pattern determination and genotype assignment.
4. Tool reveals the correct inheritance pattern and shows genotypes for all individuals in the pedigree.
**Content/data needed:** Pedigree bank with clear inheritance patterns (some simple, some ambiguous at first glance); data for each pedigree: `{affected_individuals, inheritance_pattern, all_genotypes}`.
**UI components:** Pedigree diagram display; inheritance-pattern selector (4-choice: autosomal dominant, autosomal recessive, X-linked dominant, X-linked recessive); genotype input fields for each individual; pattern and genotype reveal.
**Feedback/scoring logic:** Inheritance pattern accuracy checked first (if incorrect, hints trigger: "Count affected males vs. females," "Do carrier females appear?" "Can affected fathers pass the trait to sons?"); genotype accuracy checked once pattern is correct.

---

### Tool: Hardy-Weinberg Equilibrium Solver
**Event:** Designer Genes C
**Purpose:** Master the HW equation (p² + 2pq + q² = 1) and its application to population genetics problems — a core quantitative skill tested at all levels, with particular emphasis at State/Nationals.
**Core interaction loop:**
1. Tool presents a scenario: "In a population, the frequency of the recessive allele q is 0.3. What is the expected frequency of heterozygotes?"
2. User applies the HW equation to calculate p and then 2pq (or any other requested genotype frequency).
3. Tool validates the calculation and reveals the correct answer with working.
4. Tool can ask follow-up questions (e.g., "After one generation with no change, what will the frequencies be?" or "If a violation is observed, what might cause it?").
**Content/data needed:** Problem bank covering: calculating allele frequencies from genotype frequencies (and vice versa), applying HW to predict genotype frequencies, identifying violations of HW assumptions, and calculating changes in allele frequency under selection/drift/migration.
**UI components:** Problem display; formula reference (p+q=1, p²+2pq+q²=1) with variable input fields; calculator tool (optional); solution reveal with step-by-step algebra.
**Feedback/scoring logic:** Intermediate calculations (p, q, p², 2pq, q²) validated independently; incorrect intermediate steps trigger hints about the equation structure.

---

### Tool: Gene Mapping & Recombination Calculator
**Event:** Designer Genes C
**Purpose:** Use recombination frequency data to determine gene order and distances on a chromosome (2-point mapping at State, 3-point at National) — a quantitative reasoning skill with steep difficulty jump from Regional.
**Core interaction loop:**
1. Tool presents a testcross dataset: class counts from a cross (e.g., cross AaBb × aabb produces offspring in ratios reflecting recombination between A and B loci).
2. User calculates recombination frequency (# recombinants / total × 100), and determines gene order if 3-point data is given.
3. Tool validates the calculation and reveals the correct map distance and gene order.
**Content/data needed:** Testcross datasets for 2-point and 3-point crosses; parental, single-crossover, double-crossover, and (if applicable) triple-crossover classes clearly marked in the problem or revealed on answer.
**UI components:** Offspring class data display (with counts); input fields for recombination frequencies; gene-order selector (for 3-point crosses); map-distance display; solution reveal with identification of parental vs. recombinant classes.
**Feedback/scoring logic:** Recombination frequency accuracy checked (student must correctly identify recombinant classes first); gene order determination checked via three-point cross logic (which double-crossover class requires the middle gene to flip relative to the other two?).

---

### Tool: Phylogenetic Tree Interpreter & Builder
**Event:** Designer Genes C
**Purpose:** Practice reading phylogenetic trees, identifying clades, understanding evolutionary distance, and recognizing homologs vs. orthologs vs. paralogs — skills tested through sequence-comparison questions.
**Core interaction loop:**
1. Tool displays a phylogenetic tree and asks: "Which species are most closely related?" or "Are these genes homologs, orthologs, or paralogs?" or "What evolutionary distance separates these species?"
2. User identifies the relationship or selects from options.
3. Tool validates and reveals the correct answer, highlighting the clade or evolutionary event (speciation, gene duplication) that explains the relationship.
4. Tool can show sequence-alignment data and ask students to construct a simple tree from pairwise distance data.
**Content/data needed:** Tree bank with labeled species/genes and evolutionary events marked; sequence-alignment datasets and pairwise distance matrices for tree construction.
**UI components:** Tree diagram display or interactive tree-building canvas; multiple-choice or text-input relationship identifier; tree-building tool (place taxa, set distances, auto-generate tree); clade highlighting on answer reveal.
**Feedback/scoring logic:** Relationship accuracy checked against tree structure; tree-building problems validated by checking whether the constructed tree reflects the given pairwise distances within tolerance.

---

### Tool: Mutation Type & Protein Consequence Predictor
**Event:** Designer Genes C
**Purpose:** Classify mutations by type (silent, missense, nonsense, frameshift) and predict their protein-level consequences — a reasoning skill combining molecular biology knowledge with logical deduction.
**Core interaction loop:**
1. Tool shows a DNA sequence, highlights a mutation, and asks: "What type of mutation is this? What is the consequence for the protein?"
2. User identifies the mutation type (may need to consult genetic code) and predicts the amino acid change or frameshift consequence.
3. Tool validates and reveals the mutation type, new codon, new amino acid (if any), and physiological significance.
**Content/data needed:** Problem bank with varied mutations: synonymous (silent), missense (various amino acid substitutions), nonsense (stop codon), frameshifts (insertion/deletion of non-3n nucleotides); genetic code table.
**UI components:** DNA sequence display with mutation highlighted; mutation-type selector (4 options or free text); codon/amino-acid lookup tool; consequences input (protein sequence change); genetic code reference table (collapsible).
**Feedback/scoring logic:** Mutation type checked against the actual codon change; protein consequence validated using genetic code; frameshift direction and downstream impact validated for insertion/deletion mutations.

---

### Tool: DNA Replication Scenario Tracer
**Event:** Designer Genes C
**Purpose:** Understand semiconservative replication, track DNA through multiple generations, and predict effects of replication errors/repair — conceptual reasoning beyond pure memorization.
**Core interaction loop:**
1. Tool presents a DNA molecule (represented as two strands in parent gen 0, each with a distinct marker: "Original" vs. "Newly Synthesized").
2. After one replication, tool asks: "How many DNA molecules are there? What are their compositions?" User traces which strand is from parent, which is new.
3. After two replications, similar questions; student must track which molecules are fully original DNA and which have one new strand.
4. Tool can introduce replication errors (e.g., "In gen 2, strand X has a mispairing. What happens if it's not repaired?") and asks students to predict mutation inheritance patterns.
**Content/data needed:** Visual scaffolding for DNA strand tracking; scenarios for 1-gen, 2-gen replication; mutation/repair scenarios with inheritance predictions.
**UI components:** DNA molecule visualization (color-coded or label-marked strands); generation-by-generation display with interactive strand tracking; scenario prompts asking student to predict molecule composition after replication.
**Feedback/scoring logic:** Molecule count and composition validated per generation; mutation scenarios checked for correct understanding of which future cells carry the error.

---

### Tool: PCR, Sequencing & Molecular Cloning Technique Matcher
**Event:** Designer Genes C
**Purpose:** Match experimental questions to appropriate techniques (PCR vs. Sanger sequencing vs. next-gen sequencing, molecular cloning components) — a conceptual skill requiring understanding of each technique's capabilities and limitations.
**Core interaction loop:**
1. Tool presents a research question: "We have an unknown virus sample and need to identify it. Which sequencing approach would you use and why?"
2. User selects a technique (PCR, Sanger sequencing, Illumina, Nanopore, etc.) and optionally explains reasoning.
3. Tool validates the answer, reveals the best choice, and explains why other options are less suitable (e.g., "Nanopore is good for long reads but slower than Illumina for a quick identification task").
**Content/data needed:** Question bank covering varied experimental scenarios; for each: best-choice technique, rationale for best choice, rationale for why alternatives are suboptimal.
**UI components:** Question display; technique selector (multiple-choice or searchable dropdown); explanation input or reveal; pros/cons sidebar for each technique.
**Feedback/scoring logic:** Technique selection validated against scenario context (what's the goal: speed, read length, accuracy?); explanation accuracy checked if free-text (keyword checklist for "long reads," "parallelizable," etc.).

---

### Tool: State/National Advanced Topics Reference (Heritability, Protein Secretion, ChIP-seq)
**Event:** Designer Genes C
**Purpose:** Support students advancing from Regional to State/Nationals by providing reference and practice for the new content: heritability calculations, protein secretion, ChIP-seq/RNA-seq analysis.
**Core interaction loop:**
1. Tool presents a heritability scenario: "In a population, broad-sense heritability (H²) for height is 0.9. A trait shows a phenotypic variance of 100. What is the genetic variance?"
2. User applies heritability formulas (H² = V_G/V_P, h² = V_A/V_P) and calculates unknowns.
3. Tool reveals the correct calculation and can explain the conceptual difference between broad-sense and narrow-sense heritability.
**Content/data needed:** Heritability problems and datasets; ChIP-seq/RNA-seq data interpretation scenarios; protein secretion pathway (Sec and Tat systems) diagrams and questions.
**UI components:** Problem display; formula reference; input fields for variance calculations; data visualization (scatterplots for breeding data if applicable); reference diagrams for protein secretion pathways.
**Feedback/scoring logic:** Calculations validated per formula; conceptual explanations checked for key distinctions (H² vs. h², what each tells you about trait inheritance).

---

### Tool: Heritability Calculator & Realized Heritability Estimator
**Event:** Designer Genes C
**Purpose:** Practice all three forms of heritability (broad-sense H², narrow-sense h², realized heritability from selection experiments) — explicitly State/National content with multiple quantitative components.
**Core interaction loop:**
1. **Broad-sense (H²) problems:** Tool provides V_G, V_E, V_P; user calculates H² = V_G/V_P, or vice versa.
2. **Narrow-sense (h²) problems:** Tool provides V_A (additive genetic variance), V_P; user calculates h² = V_A/V_P, distinguishing it from H² (which includes dominance and epistatic variance).
3. **Realized heritability problems:** Tool provides parent mean, offspring mean, and selection differential; user calculates h² = R/S (response to selection / selection differential).
4. Tool validates each calculation and explains when to use which form.
**Content/data needed:** Worked examples for each heritability type; clear distinction between V_G (total genetic) and V_A (additive genetic) variance; selection-experiment datasets (e.g., parent/offspring mean trait values).
**UI components:** Problem display with variance values or selection data; formula reference (H²=V_G/V_P, h²=V_A/V_P, h²=R/S); calculator; solution reveal with formula application; concept-explanation panel.
**Feedback/scoring logic:** Each calculation validated against formula; conceptual understanding checked via follow-up: "If H² = 0.8 but h² = 0.3, what does that tell you about the genetic architecture?" (lots of dominance/epistasis, low additive component, hard to select for).

---

### Tool: Lac & Trp Operon Regulator Simulator
**Event:** Designer Genes C
**Purpose:** Simulate gene regulation in the lac and trp operons under varying conditions (inducer presence, repressor presence, glucose levels) — a core prokayrotic gene-expression content area.
**Core interaction loop:**
1. Tool presents a scenario: "E. coli is in a medium with lactose present and glucose absent. Is the lac operon ON or OFF? Why?"
2. User predicts operon state and explains the regulatory logic: lactose binds LacI repressor (removing repression) AND low glucose means high cAMP → CAP-cAMP binds promoter (activating transcription).
3. Tool validates and reveals the answer with the full regulatory cascade.
4. Similar scenarios for trp operon: "With high tryptophan, is trp operon ON or OFF?" (OFF — Trp acts as corepressor with TrpR to block transcription).
**Content/data needed:** Regulatory logic for both operons: lacI repressor, CAP-cAMP activator, lactose as inducer, glucose as catabolite repressor; trpR repressor, tryptophan as corepressor, attenuation mechanism.
**UI components:** Scenario display (cell environment: lactose? glucose? tryptophan?); operon state selector; regulation-step tracer (showing which proteins are active); solution reveal with full regulatory cascade diagram.
**Feedback/scoring logic:** Operon state validated; regulatory reasoning checked for mention of correct regulatory components (e.g., for lac+glucose−: both LacI inactivation AND CAP-cAMP activation required for full expression).
