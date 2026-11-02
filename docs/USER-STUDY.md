# User Study: Proof Comprehension with Different Visualizations

## Study Overview

This user study evaluates four different visualization designs for mathematical proof comprehension in the Formula Nebula project. The goal is to determine which visualization mode best supports understanding, engagement, and efficient navigation of mathematical proofs.

## Research Questions

1. **RQ1**: Which visualization mode leads to better comprehension of mathematical proofs?
2. **RQ2**: Which visualization mode results in higher user engagement?
3. **RQ3**: Which visualization mode allows users to complete comprehension tasks most efficiently?
4. **RQ4**: What are users' qualitative preferences and why?

## Study Design

### Participants

- **Target**: 30 participants
- **Recruitment criteria**:
  - Mathematics students (undergraduate or graduate level)
  - Computer science students with mathematical background
  - Mathematicians or researchers in related fields
  - At least intermediate familiarity with mathematical proofs
- **Compensation**: To be determined (e.g., $20-30 for 45-60 minute session)

### Experimental Design

**Within-subjects design**: Each participant experiences all four visualization modes to control for individual differences in mathematical ability.

**Counterbalancing**: Use Latin square to counterbalance order effects:
- Group 1: Atlas → Map → Manuscript → Nebula
- Group 2: Map → Manuscript → Nebula → Atlas
- Group 3: Manuscript → Nebula → Atlas → Map
- Group 4: Nebula → Atlas → Map → Manuscript

### Visualization Modes

1. **Atlas** (`designs/atlas/`): Grid-based layout with hierarchical structure
2. **Map** (`designs/map/`): Interactive geographical metaphor with spatial navigation
3. **Manuscript** (`designs/manuscript/`): Traditional linear document format
4. **Nebula** (`designs/nebula-plus/`): Particle-based 3D visualization

### Test Proofs

Select 4 proofs of similar complexity (one per visualization mode):
- Each proof should be ~5-10 steps
- Similar difficulty level
- Cover different mathematical domains to avoid learning effects
- Pre-tested for equivalence in difficulty

**Suggested proofs**:
1. Proof of irrationality of √2
2. Proof of infinitude of primes
3. Proof of sum of arithmetic series
4. Proof of derivative of x^n

## Measurements

### 1. Comprehension (Primary Outcome)

**Multiple-choice questions** (5 per proof):
- Identify the main goal of the proof
- Identify key lemmas or intermediate steps
- Identify logical dependencies between steps
- Identify which step uses a particular theorem
- Predict consequences if a step were modified

**Score**: 0-5 correct answers per proof

### 2. Engagement

**Self-report scale** (7-point Likert, after each visualization):
1. "I found this visualization engaging"
2. "I would want to use this visualization again"
3. "This visualization held my attention"
4. "I enjoyed exploring proofs with this visualization"

**Score**: Mean of 4 items (1-7 scale)

**Behavioral metrics**:
- Number of interactions (clicks, hovers, zooms)
- Number of revisits to previous steps
- Exploration breadth (unique nodes/steps visited)

### 3. Time

**Metrics**:
- Time to complete comprehension task (in seconds)
- Time until first correct answer
- Time per question

### 4. Qualitative Feedback

**Post-task interview** (semi-structured):
1. "Which visualization did you prefer overall, and why?"
2. "What did you find most helpful about each visualization?"
3. "What was most frustrating or confusing about each visualization?"
4. "For what types of proofs would each visualization be most useful?"
5. "How would you improve each visualization?"

**Think-aloud protocol** (optional during task):
- Encourage participants to verbalize their thoughts while exploring proofs

## Procedure

### Session Structure (45-60 minutes)

1. **Introduction** (5 min)
   - Welcome and consent
   - Explain study purpose and structure
   - Demographics questionnaire

2. **Training** (5 min)
   - Brief tutorial on each visualization mode
   - Practice with a simple example proof (Pythagorean theorem)

3. **Main tasks** (32 min: 4 visualizations × 8 min each)
   - For each visualization:
     - Present the proof in the assigned visualization mode
     - Allow 3 minutes to explore freely
     - Present 5 comprehension questions (1 min each)
     - Engagement questionnaire (1 min)

4. **Final questionnaire** (5 min)
   - Comparative ranking of all four visualizations
   - Overall preferences

5. **Interview** (5-10 min)
   - Semi-structured qualitative feedback

6. **Debrief** (2 min)
   - Thank participant and provide compensation

### Data Collection

All data collected automatically via `tools/user-study-runner.mjs`:
- Timestamps for all interactions
- Response accuracy
- Self-report ratings
- Qualitative responses (typed or transcribed)

## Statistical Analysis

### Quantitative Analysis

**Primary analyses**:
1. **Comprehension**: One-way repeated measures ANOVA
   - IV: Visualization mode (4 levels)
   - DV: Comprehension score (0-5)
   - Post-hoc: Bonferroni-corrected pairwise comparisons

2. **Engagement**: One-way repeated measures ANOVA
   - IV: Visualization mode
   - DV: Engagement score (1-7)
   - Post-hoc: Bonferroni-corrected pairwise comparisons

3. **Time**: One-way repeated measures ANOVA
   - IV: Visualization mode
   - DV: Task completion time (seconds)
   - Post-hoc: Bonferroni-corrected pairwise comparisons

**Effect size**: Partial eta-squared (ηp²)

**Significance level**: α = 0.05

**Power analysis**: With n=30, power ≈ 0.80 to detect medium effect size (f=0.25)

### Order Effects

Check for carryover effects:
- Mixed ANOVA with order group as between-subjects factor
- If significant interaction, analyze order effects separately

### Correlations

Explore relationships:
- Comprehension vs. engagement
- Comprehension vs. time
- Behavioral metrics vs. comprehension

### Qualitative Analysis

**Thematic analysis**:
1. Code open-ended responses
2. Identify recurring themes
3. Group by visualization mode
4. Map to quantitative findings

## Expected Outcomes

### Hypotheses

- **H1**: Comprehension will be highest in Map and Atlas (spatial structure supports navigation)
- **H2**: Engagement will be highest in Nebula and Map (visual appeal and interactivity)
- **H3**: Time will be shortest in Manuscript (familiar linear format)
- **H4**: User preferences will align with comprehension scores

### Interpretation

Results will inform:
1. Which visualization mode to prioritize for development
2. Specific strengths of each mode for different use cases
3. Design improvements based on qualitative feedback
4. Potential for hybrid or customizable visualization modes

## Ethical Considerations

- **Informed consent**: All participants sign consent form
- **Voluntary participation**: Participants can withdraw at any time
- **Data privacy**: All data anonymized, stored securely
- **Minimal risk**: Study involves only viewing mathematical content
- **IRB approval**: Submit protocol to institutional review board if required

## Timeline

1. **Week 1**: Finalize study materials and tools
2. **Week 2**: Pilot study with 3-5 participants, refine protocol
3. **Weeks 3-5**: Recruit and run main study (30 participants)
4. **Week 6**: Data analysis and report preparation
5. **Week 7**: Present findings and implement recommendations

## Resources Required

- **Personnel**: 1 researcher to run sessions
- **Equipment**: Computer with web browser, screen recording software
- **Space**: Quiet room for individual sessions
- **Software**: User study tools (included in this repository)
- **Budget**: Participant compensation (~$600-900 total)

## Data Management

- **Storage**: All data in `data/user-study/` directory
- **Format**: JSON for quantitative data, text files for qualitative responses
- **Backup**: Regular backups to cloud storage
- **Retention**: Keep raw data for minimum 3 years
- **Sharing**: Anonymized data available upon request after publication

## References

- Nielsen, J. (1994). Usability engineering. Morgan Kaufmann.
- Brooke, J. (1996). SUS: A quick and dirty usability scale. Usability evaluation in industry, 189(194), 4-7.
- Hart, S. G., & Staveland, L. E. (1988). Development of NASA-TLX: Results of empirical and theoretical research. Advances in psychology, 52, 139-183.
- Braun, V., & Clarke, V. (2006). Using thematic analysis in psychology. Qualitative research in psychology, 3(2), 77-101.

---

**Study Protocol Version**: 1.0  
**Last Updated**: November 2, 2026  
**Contact**: [Researcher name and email]
