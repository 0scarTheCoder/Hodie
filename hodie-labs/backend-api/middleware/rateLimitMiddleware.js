/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and DOS attacks
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Applies to all API endpoints that don't have specific limits
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Upload endpoint rate limiter
 * More restrictive to prevent abuse
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    error: 'Upload limit reached',
    message: 'You have reached your hourly upload limit. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
});

/**
 * Chat/AI endpoint rate limiter
 * Prevents AI API abuse
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    error: 'Too many chat requests',
    message: 'You are sending too many messages. Please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Recommendations endpoint rate limiter
 */
const recommendationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes
  message: {
    error: 'Too many recommendation requests',
    message: 'You have exceeded the rate limit for recommendations. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Data fetch endpoint rate limiter
 * More lenient for reading data
 */
const dataFetchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: 'Too many data requests',
    message: 'You are fetching data too frequently. Please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication endpoint rate limiter
 * Very restrictive to prevent brute force
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many authentication attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  uploadLimiter,
  chatLimiter,
  recommendationsLimiter,
  dataFetchLimiter,
  authLimiter
};
