/**
 * Generates AI system prompt text from the shared HODIE Clinical Library config.
 * Both claudeService.js and groqService.js use this so ranges stay in sync.
 */

const clinicalLibrary = require('../../src/config/hodieClinicalLibrary.json');

/**
 * Build a full clinical ranges prompt section for AI system prompts.
 * Groups biomarkers by category with thresholds.
 */
function buildClinicalRangesPrompt() {
  const biomarkers = clinicalLibrary.biomarkers;
  const grouped = {};

  for (const [, bm] of Object.entries(biomarkers)) {
    const cat = bm.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(bm);
  }

  let prompt = 'HODIE CLINICAL REFERENCE RANGES (Australia-Optimised, Longevity-Focused):\n';
  prompt += 'Use these thresholds when classifying biomarkers:\n';

  for (const [category, markers] of Object.entries(grouped)) {
    prompt += `\n${category}:\n`;
    for (const bm of markers) {
      let line = `- ${bm.name} (${bm.unit}): Optimal ${bm.displayRange}`;
      if (bm.borderline && bm.optimal) {
        // Show borderline as the range between optimal and high
        const bLow = bm.optimal.high;
        const bHigh = bm.borderline.high;
        if (bLow !== bHigh) {
          line += ` | Borderline ${bLow}–${bHigh}`;
        }
      }
      if (bm.high !== undefined) {
        line += ` | High >${bm.high}`;
      }
      if (bm.veryHigh !== undefined) {
        line += ` | Very High >${bm.veryHigh}`;
      }
      prompt += line + '\n';
    }
  }

  return prompt;
}

/**
 * Build a condensed version for the free-tier Groq prompt (saves tokens).
 */
function buildCondensedRangesPrompt() {
  const biomarkers = clinicalLibrary.biomarkers;
  let prompt = 'Key HODIE reference ranges (longevity-focused, Australian):\n';

  // Only include CORE biomarkers with longevity weights for the condensed version
  const keyMarkers = Object.values(biomarkers).filter(
    (bm) => bm.longevityWeight || bm.section === 'CORE'
  );

  const lines = keyMarkers.map((bm) => {
    let line = `${bm.name} ${bm.displayRange} ${bm.unit} optimal`;
    if (bm.borderline) {
      line += ` | ${bm.borderline.high} borderline`;
    }
    return line;
  });

  prompt += lines.join(' | ');
  return prompt;
}

module.exports = { buildClinicalRangesPrompt, buildCondensedRangesPrompt };
