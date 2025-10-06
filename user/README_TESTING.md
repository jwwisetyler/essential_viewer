# Testing XSL Views in VS Code

This directory contains utilities for testing Essential Viewer XSL views locally within VS Code.

## Quick Start

### Method 1: Run the Test Runner (Recommended)

```bash
# Test the currently open XSL file
node user/test_runner.js user/tech_product_app_browser.xsl

# Or use the VS Code debugger:
# 1. Open tech_product_app_browser.xsl in the editor
# 2. Press F5 or go to Run > Start Debugging
# 3. Select "Test XSL View (Mock Data)"
```

### Method 2: VS Code Debug Configurations

Three debug configurations are available in `.vscode/launch.json`:

1. **Test XSL View (Mock Data)** - Tests the currently open XSL file
2. **Test Tech Product Browser** - Tests the tech product browser specifically
3. **Preview XSL Output in Browser** - Opens the generated HTML in Chrome

## Setup Requirements

### Install an XSLT Processor (Optional but Recommended)

For full transformation testing, install one of these:

**Option 1: xsltproc (Recommended for simplicity)**
```bash
# Windows (using Chocolatey)
choco install xsltproc

# Mac
brew install libxslt

# Linux
sudo apt-get install xsltproc
```

**Option 2: Saxon (Most powerful, supports XSLT 2.0/3.0)**
```bash
# Install Saxon HE via npm
npm install -g saxon-js

# Or download Saxon HE from https://www.saxonica.com/
```

**Option 3: Java + Saxon**
- Download Saxon HE from https://www.saxonica.com/
- Requires Java Runtime Environment (JRE)

## What the Test Runner Does

1. **Validates XSL Structure**
   - Checks for required templates (knowledge_base, docType, etc.)
   - Lists all named templates
   - Shows variables and Data Set APIs used

2. **Syntax Checking**
   - Verifies XSL is well-formed
   - Identifies missing required templates

3. **Transformation (if processor available)**
   - Transforms mock XML data using your XSL
   - Generates `test_output.html`
   - Shows output file size and validation results

## Mock Data

The test runner creates `mock_reportXML.xml` with minimal test data:
- Sample Technology Product
- Sample Application
- Required system instances

**Note**: Mock data won't have all the relationships and APIs that the real `reportXML.xml` contains, so some features may not work in the test output.

## Testing Your Custom View

### 1. Validate XSL Structure
```bash
node user/test_runner.js user/tech_product_app_browser.xsl
```

This will show:
- ✓ Required templates present
- 📋 Named templates defined
- 📦 Variables used
- 🔌 Data Set APIs referenced

### 2. Check Transformation Output
If you have an XSLT processor installed, the test runner will generate `test_output.html`.

**Important**: The generated HTML will have limited functionality because:
- Mock data doesn't include all relationships
- API endpoints won't return real data
- Some JavaScript may fail without the full Essential environment

### 3. Test in Real Environment
To fully test your view:

1. Deploy to Essential Viewer server
2. Navigate to the view via the URL:
   ```
   report?XML=reportXML.xml&XSL=user/tech_product_app_browser.xsl
   ```
3. Or find it in the View Library under "Technology Architecture Views"

## Common Issues

### "No XSLT processor found"
- Install xsltproc or Saxon (see Setup Requirements above)
- The validator will still check XSL structure without a processor

### "Transformation failed"
- This is normal for complex views that use Essential-specific includes
- The XSL may be valid but require the full Essential Viewer environment
- Focus on the structure validation instead

### "Missing template" warnings
- Ensure you've included all required common templates:
  ```xml
  <xsl:include href="../common/core_doctype.xsl"/>
  <xsl:include href="../common/core_common_head_content.xsl"/>
  <xsl:include href="../common/core_header.xsl"/>
  <xsl:include href="../common/core_footer.xsl"/>
  ```

## VS Code Extensions (Recommended)

Install these VS Code extensions for better XSL development:

1. **XML Tools** - XML/XSL syntax highlighting and formatting
2. **XSLT Snippets** - Code snippets for common XSL patterns
3. **XML Language Support** - IntelliSense and validation

Install via:
```
code --install-extension redhat.vscode-xml
code --install-extension dotjoshjohnson.xml
```

## Advanced: Using Real reportXML.xml

If you want to test with real data:

1. Copy your actual `reportXML.xml` to `user/mock_reportXML.xml`
2. Warning: This file is ~11MB and may be slow to process
3. Git will ignore it (already in .gitignore)

```bash
cp reportXML.xml user/mock_reportXML.xml
node user/test_runner.js user/tech_product_app_browser.xsl
```

## File Structure

```
user/
├── tech_product_app_browser.xsl    # Your custom view
├── test_runner.js                   # Test validation script
├── mock_reportXML.xml              # Auto-generated mock data
├── test_output.html                 # Generated output (if processor available)
├── custom.css                       # Custom styling
└── README_TESTING.md               # This file

.vscode/
└── launch.json                      # VS Code debug configurations
```

## Tips

- Use the test runner frequently during development to catch errors early
- The structure validation works even without an XSLT processor
- For final testing, always deploy to a real Essential Viewer instance
- Keep your XSL includes relative to avoid path issues
- Use `eas:i18n()` for all user-facing text for internationalization
