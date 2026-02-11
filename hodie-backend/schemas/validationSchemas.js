/**
 * Data Validation Schemas
 * Validates health data structure before storing in MongoDB
 */

const Joi = require('joi');

/**
 * Biomarker Schema
 * Used for lab results
 */
const biomarkerSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(200),
  value: Joi.number().required(),
  unit: Joi.string().required().trim().max(50),
  referenceRange: Joi.string().required().trim().max(100),
  flagged: Joi.boolean().required(),
  category: Joi.string().valid(
    'Cardiovascular',
    'Metabolic',
    'Vitamins',
    'Hormones',
    'Inflammation',
    'Cancer Markers',
    'General',
    'Blood Health',
    'Kidney Function',
    'Liver Function',
    'Thyroid Function'
  ),
  trend: Joi.string().valid('up', 'down', 'stable').optional(),
  change: Joi.number().optional(),
  testDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate()
  ).optional(),
  history: Joi.array().items(Joi.number()).optional(),
  aiInsights: Joi.string().optional(),
  recommendation: Joi.string().optional()
});

/**
 * Lab Results Schema
 * Complete lab report with multiple biomarkers
 */
const labResultsSchema = Joi.object({
  testDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate(),
    Joi.string()
  ).required(),
  labProvider: Joi.string().allow('').optional(),
  biomarkers: Joi.array().items(biomarkerSchema).min(1).required()
});

/**
 * Trait Schema
 * Used for genetic data
 */
const traitSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(200),
  result: Joi.string().required().trim().min(1).max(500),
  gene: Joi.string().required().trim().max(50),
  variant: Joi.string().optional().trim().max(50),
  impact: Joi.string().valid('High', 'Medium', 'Low').optional()
});

/**
 * Health Risk Schema
 * Used for genetic health risks
 */
const healthRiskSchema = Joi.object({
  condition: Joi.string().required().trim().min(1).max(200),
  riskLevel: Joi.string().required().valid(
    'Lower than average',
    'Average',
    'Slightly elevated',
    'Elevated',
    'High'
  ),
  geneticContribution: Joi.number().min(0).max(100).required(),
  lifestyleContribution: Joi.number().min(0).max(100).required()
});

/**
 * Genetic Data Schema
 * Complete genetic report
 */
const geneticDataSchema = Joi.object({
  reportDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate(),
    Joi.string()
  ).required(),
  provider: Joi.string().allow('').optional(),
  traits: Joi.array().items(traitSchema).optional(),
  healthRisks: Joi.array().items(healthRiskSchema).optional(),
  ancestry: Joi.object().optional()
});

/**
 * Medical Report Schema
 */
const medicalReportSchema = Joi.object({
  reportDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate(),
    Joi.string()
  ).required(),
  reportType: Joi.string().required().trim().max(100),
  provider: Joi.string().allow('').optional(),
  summary: Joi.string().optional().max(5000),
  diagnoses: Joi.array().items(Joi.string()).optional(),
  recommendations: Joi.array().items(Joi.string()).optional()
});

/**
 * Recommendation Schema
 */
const recommendationSchema = Joi.object({
  id: Joi.string().required(),
  category: Joi.string().required().valid(
    'Fitness',
    'Nutrition',
    'Supplements',
    'Sleep',
    'Stress Management',
    'Medical'
  ),
  priority: Joi.string().required().valid('High', 'Medium', 'Low'),
  title: Joi.string().required().trim().min(1).max(200),
  description: Joi.string().required().trim().min(1).max(1000),
  impact: Joi.string().required().trim().max(500),
  timeframe: Joi.string().required().trim().max(100),
  difficulty: Joi.string().required().valid('Easy', 'Medium', 'Hard'),
  completed: Joi.boolean().required()
});

/**
 * Validate lab results data
 */
function validateLabResults(data) {
  const { error, value } = labResultsSchema.validate(data, {
    abortEarly: false, // Return all errors, not just the first
    stripUnknown: true // Remove unknown fields
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    throw new Error(`Lab results validation failed: ${errorMessages.join(', ')}`);
  }

  return value;
}

/**
 * Validate genetic data
 */
function validateGeneticData(data) {
  const { error, value } = geneticDataSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    throw new Error(`Genetic data validation failed: ${errorMessages.join(', ')}`);
  }

  return value;
}

/**
 * Validate medical report
 */
function validateMedicalReport(data) {
  const { error, value } = medicalReportSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    throw new Error(`Medical report validation failed: ${errorMessages.join(', ')}`);
  }

  return value;
}

/**
 * Validate recommendation
 */
function validateRecommendation(data) {
  const { error, value } = recommendationSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    throw new Error(`Recommendation validation failed: ${errorMessages.join(', ')}`);
  }

  return value;
}

/**
 * Validate array of recommendations
 */
function validateRecommendations(data) {
  if (!Array.isArray(data)) {
    throw new Error('Recommendations must be an array');
  }

  return data.map(rec => validateRecommendation(rec));
}

module.exports = {
  biomarkerSchema,
  labResultsSchema,
  traitSchema,
  healthRiskSchema,
  geneticDataSchema,
  medicalReportSchema,
  recommendationSchema,
  validateLabResults,
  validateGeneticData,
  validateMedicalReport,
  validateRecommendation,
  validateRecommendations
};
