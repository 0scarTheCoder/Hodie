/**
 * Authentication Middleware
 * Verifies JWT tokens from Auth0 or Firebase and extracts user info
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
  console.log('✅ Firebase Admin SDK initialized for secure token verification');
}

// Auth0 JWKS client for token verification
const auth0Client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true
});

/**
 * Get Auth0 signing key
 */
function getAuth0Key(header, callback) {
  auth0Client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Verify Auth0 JWT token
 */
function verifyAuth0Token(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getAuth0Key,
      {
        audience: process.env.AUTH0_AUDIENCE || `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256']
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      }
    );
  });
}

/**
 * Verify Firebase JWT token with Firebase Admin SDK
 * This properly validates the token signature, issuer, audience, and expiration
 */
async function verifyFirebaseToken(token) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error(`Firebase token verification failed: ${error.message}`);
  }
}

/**
 * Main authentication middleware
 */
async function authenticateUser(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided. Please include "Authorization: Bearer <token>" header.'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Try to determine token type and verify
    let decoded;
    let provider;

    try {
      // Try Firebase first (primary auth provider)
      decoded = await verifyFirebaseToken(token);
      provider = 'firebase';
      console.log('✅ Firebase token verified for user:', decoded.uid || decoded.user_id);
    } catch (firebaseError) {
      try {
        // Try Auth0 as fallback (legacy support)
        decoded = await verifyAuth0Token(token);
        provider = 'auth0';
        console.log('✅ Auth0 token verified for user (legacy):', decoded.sub);
      } catch (auth0Error) {
        console.error('Token verification failed:', firebaseError.message, auth0Error.message);
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Authentication token is invalid or expired. Please log in again.'
        });
      }
    }

    // Extract user information based on provider
    let userId, email;

    if (provider === 'auth0') {
      userId = decoded.sub; // Auth0 uses 'sub' (e.g., "google-oauth2|123456")
      email = decoded.email || decoded[`${process.env.AUTH0_DOMAIN}/email`];
    } else {
      userId = decoded.uid || decoded.user_id; // Firebase uses 'uid'
      email = decoded.email;
    }

    if (!userId) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token does not contain required user ID field'
      });
    }

    // Attach user info to request
    req.auth = {
      userId,
      email,
      provider,
      token: decoded
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
}

/**
 * Optional authentication (doesn't fail if no token)
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue without auth
      req.auth = null;
      return next();
    }

    // Token provided - verify it
    await authenticateUser(req, res, next);
  } catch (error) {
    // Token invalid - continue without auth
    req.auth = null;
    next();
  }
}

/**
 * Verify user is accessing their own resources
 */
function authorizeOwner(req, res, next) {
  const requestedUserId = req.params.userId || req.params.clientID;
  const authenticatedUserId = req.auth.userId;

  // For clientID, we need to check against the database
  // This is handled in the route handlers

  // For direct userId comparison
  if (requestedUserId && requestedUserId !== authenticatedUserId) {
    // Check if it's an admin (future feature)
    if (!req.auth.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only access your own data'
      });
    }
  }

  next();
}

/**
 * Admin only middleware (future feature)
 */
function requireAdmin(req, res, next) {
  if (!req.auth || !req.auth.isAdmin) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  next();
}

module.exports = {
  authenticateUser,
  optionalAuth,
  authorizeOwner,
  requireAdmin
};
