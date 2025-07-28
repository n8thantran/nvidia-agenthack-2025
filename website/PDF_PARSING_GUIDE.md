# PDF Parsing in Next.js - Complete Guide

## The Problem

You were encountering an error where `pdf-parse` was trying to access a test file `'C:\Users\nathan\nvidia-agenthack-2025\website\test\data\05-versions-space.pdf'` during import in a Next.js API route.

## Why This Happens

1. **Next.js App Router Bundling**: The new Next.js App Router bundles all packages by default, which causes issues with certain Node.js packages like `pdf-parse`.

2. **Test File Access**: The `pdf-parse` library contains debug code that tries to access its test files when `module.parent` is null, which happens when the module is bundled.

3. **Compatibility Issues**: PDF parsing libraries weren't designed for the modern Next.js bundling system.

## Solutions Implemented

### 1. Next.js Configuration Fix

**File: `next.config.ts`**
```typescript
const nextConfig: NextConfig = {
  // Configure pdf-parse to be external to prevent bundling issues
  serverExternalPackages: ['pdf-parse'],
};
```

**What this does:**
- Prevents Next.js from bundling `pdf-parse`
- Uses native Node.js `require()` instead
- Eliminates the test file access issue

### 2. Improved API Route

**File: `src/app/api/upload/route.ts`**
- Uses a utility function for better error handling
- Includes proper TypeScript types
- Provides detailed error messages
- Limits pages for performance (50 pages max)

### 3. PDF Parser Utility

**File: `src/lib/pdfParser.ts`**
- Centralized PDF parsing logic
- Multiple parsing method support
- Configuration error detection
- Helpful error messages with solutions

## Usage Examples

### Basic Usage
```typescript
import { parsePDFFile } from '@/lib/pdfParser'

// In your API route
const result = await parsePDFFile(file)
```

### Advanced Usage
```typescript
const result = await parsePDFFile(file, {
  method: 'auto',        // Try pdf-parse first, fallback to alternatives
  maxPages: 50          // Limit pages for performance
})
```

## Alternative PDF Parsing Libraries

If `pdf-parse` continues to cause issues, consider these alternatives:

### 1. pdf2json
```bash
npm install pdf2json
```
- More comprehensive PDF analysis
- Extracts structured data and metadata
- Works better with complex layouts

### 2. pdfjs-dist
```bash
npm install pdfjs-dist
```
- Built by Mozilla
- Primary focus on PDF rendering
- Can extract text during rendering
- More stable but heavier

### 3. pdf-lib
```bash
npm install pdf-lib
```
- Focus on PDF creation and modification
- Can extract some text
- Good for PDF manipulation tasks

## Configuration for Different Libraries

### For pdf2json:
```javascript
const nextConfig = {
  serverExternalPackages: ['pdf2json'],
};
```

### For multiple libraries:
```javascript
const nextConfig = {
  serverExternalPackages: ['pdf-parse', 'pdf2json', 'pdfjs-dist'],
};
```

## Troubleshooting

### If you still get the 05-versions-space.pdf error:

1. **Restart your development server** after changing `next.config.ts`
2. **Clear Next.js cache**: Delete `.next` folder and restart
3. **Check the configuration**: Ensure `serverExternalPackages` is properly set
4. **Verify the import**: Use the utility function instead of direct imports

### If PDF parsing fails:

1. **Check file type**: Ensure the file is actually a PDF
2. **File size limits**: Large PDFs may timeout
3. **Corrupted PDFs**: Some PDFs may be malformed
4. **Memory issues**: Very large PDFs can cause memory problems

## Performance Considerations

1. **Page limits**: Set `maxPages` to prevent processing huge documents
2. **File size limits**: Implement file size checks in your API
3. **Memory usage**: Monitor memory usage with large files
4. **Timeouts**: Set appropriate timeout values for API routes

## Testing

Test your implementation with:
1. Small text-based PDFs
2. Image-heavy PDFs
3. Scanned document PDFs
4. Password-protected PDFs (should gracefully fail)
5. Corrupted PDF files

## Migration Path

If you need to migrate away from `pdf-parse`:

1. **Install alternative**: `npm install pdf2json`
2. **Update utility**: Modify `src/lib/pdfParser.ts`
3. **Update config**: Add new library to `serverExternalPackages`
4. **Test thoroughly**: Ensure all PDF types still work

## Security Considerations

1. **File validation**: Always validate uploaded files
2. **Size limits**: Implement file size restrictions
3. **Type checking**: Verify file types before processing
4. **Sanitization**: Be careful with extracted text content
5. **Rate limiting**: Implement rate limiting for PDF processing

## Summary

The main issue was Next.js bundling `pdf-parse` which caused the test file access error. The solution is:

1. ✅ Add `pdf-parse` to `serverExternalPackages` in `next.config.ts`
2. ✅ Use the improved utility function for better error handling
3. ✅ Implement proper error detection and user feedback
4. ✅ Have fallback options ready if needed

This should resolve your PDF parsing issues in Next.js API routes.