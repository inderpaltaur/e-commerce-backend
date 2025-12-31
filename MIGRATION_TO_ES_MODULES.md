# Migration to ES Modules

This document describes the migration from CommonJS to ES Modules completed on the backend.

## Changes Made

### 1. Package Configuration

**File: `package.json`**
- Added `"type": "module"` to enable ES modules

```json
{
  "type": "module",
  ...
}
```

### 2. Import/Export Syntax Changes

All files were converted from CommonJS syntax to ES modules:

#### Before (CommonJS)
```javascript
const express = require('express');
const { auth, db } = require('../config/firebase');

module.exports = someExport;
module.exports = { namedExport };
```

#### After (ES Modules)
```javascript
import express from 'express';
import { auth, db } from '../config/firebase.js';

export default someExport;
export { namedExport };
```

### 3. File Extensions

All import statements now include the `.js` file extension:
```javascript
import authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.middleware.js';
```

### 4. Files Converted

#### Config Files
- ✅ `src/config/firebase.js`
  - Converted `require()` to `import`
  - Changed to use `readFileSync` for JSON service account file
  - Converted `module.exports` to named exports

#### Middleware Files
- ✅ `src/middleware/auth.middleware.js`
  - Converted to named exports (`export const`)
- ✅ `src/middleware/validation.middleware.js`
  - Converted to named exports (`export const`)

#### Controller Files
- ✅ `src/controllers/auth.controller.js`
- ✅ `src/controllers/user.controller.js`
- ✅ `src/controllers/product.controller.js`
- ✅ `src/controllers/category.controller.js`
- ✅ `src/controllers/order.controller.js`

All controllers:
- Import from `../config/firebase.js` using ES import
- Export as both named and default exports

#### Route Files
- ✅ `src/routes/auth.routes.js`
- ✅ `src/routes/user.routes.js`
- ✅ `src/routes/product.routes.js`
- ✅ `src/routes/category.routes.js`
- ✅ `src/routes/order.routes.js`

All routes:
- Import Express and validators using ES import
- Import controllers and middleware with `.js` extension
- Export router as default export

#### Server File
- ✅ `src/server.js`
  - Converted all requires to imports
  - Changed `require('dotenv').config()` to `import dotenv` and `dotenv.config()`
  - Updated route imports with `.js` extensions
  - Converted `module.exports` to `export default`

## Key Differences from CommonJS

### 1. File Extensions Required
ES modules require explicit file extensions in import statements:
```javascript
// Must include .js
import router from './routes/auth.routes.js';
```

### 2. Named vs Default Exports

**Named Exports:**
```javascript
export const verifyToken = async (req, res, next) => { ... };
export const checkAdmin = async (req, res, next) => { ... };

// Import
import { verifyToken, checkAdmin } from './auth.middleware.js';
```

**Default Exports:**
```javascript
export default authController;

// Import
import authController from './auth.controller.js';
```

### 3. Dynamic Imports
For dynamic imports, use the `import()` function:
```javascript
const module = await import('./dynamic-module.js');
```

### 4. No __dirname or __filename
These are not available in ES modules. Use this instead:
```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 5. JSON Imports
For JSON files, use assertions:
```javascript
import data from './data.json' assert { type: 'json' };
```

Or read with fs:
```javascript
import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./data.json', 'utf8'));
```

## Benefits of ES Modules

1. **Standardization** - ES modules are the JavaScript standard
2. **Static Analysis** - Better tree-shaking and dead code elimination
3. **Async Loading** - Native support for dynamic imports
4. **Better Tooling** - Improved IDE support and intellisense
5. **Future-Proof** - Aligned with modern JavaScript ecosystem

## Running the Server

The server can be run the same way as before:

```bash
# Development
npm run dev

# Production
npm start
```

## Testing

Verify the conversion:
```bash
node --check src/server.js
```

## Troubleshooting

### Common Issues

1. **SyntaxError: Cannot use import statement outside a module**
   - Ensure `"type": "module"` is in package.json
   - Check file extensions are `.js` not `.mjs`

2. **Error [ERR_MODULE_NOT_FOUND]**
   - Make sure all import paths include `.js` extension
   - Check relative paths are correct

3. **ReferenceError: require is not defined**
   - Some dependency might still use CommonJS
   - Convert to ES modules or use `createRequire`:
   ```javascript
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
   ```

## Compatibility

All major Node.js packages used in this project support ES modules:
- ✅ Express 4.18+
- ✅ Firebase Admin SDK 12.0+
- ✅ dotenv 16.3+
- ✅ express-validator 7.0+
- ✅ cors, helmet, morgan (all compatible)

## Conclusion

The backend has been successfully migrated from CommonJS to ES Modules. All functionality remains the same, but the codebase now uses modern JavaScript module syntax.
