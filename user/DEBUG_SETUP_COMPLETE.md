# ✅ Debug Setup Complete!

Your Essential Viewer XSL development environment is now configured for testing in VS Code.

## 🎯 What's Been Set Up

### VS Code Configuration (`.vscode/`)
- ✅ `launch.json` - Debug configurations for F5 testing
- ✅ `tasks.json` - Build tasks for XSL validation
- ✅ `settings.json` - XML/XSL editor preferences
- ✅ `extensions.json` - Recommended extensions
- ✅ `keybindings.md` - Keyboard shortcuts reference

### Testing Tools (`user/`)
- ✅ `test_runner.js` - XSL validation and test script
- ✅ `README_TESTING.md` - Complete testing documentation
- ✅ `QUICK_START.md` - Quick reference guide
- ✅ `.gitignore` - Excludes test output files

### Your Custom View
- ✅ `user/tech_product_app_browser.xsl` - Technology Product browser
- ✅ `reportXML.xml` - View registered and ready to deploy

## 🚀 Start Testing Now

### Instant Test (Recommended)
1. Open `user/tech_product_app_browser.xsl` in VS Code
2. Press **F5**
3. Select **"Test XSL View (Mock Data)"**
4. View validation results in terminal

### Command Line
```bash
node user/test_runner.js user/tech_product_app_browser.xsl
```

### VS Code Tasks Menu
1. Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
2. Type "Run Task"
3. Select **"Test Current XSL View"**

## 📊 What the Test Shows

✓ **Structure Validation** - Checks for required templates
✓ **Syntax Validation** - Ensures XSL is well-formed
✓ **Template Analysis** - Lists all named templates
✓ **Variable Inspection** - Shows defined variables
✓ **API Detection** - Identifies Data Set APIs used
✓ **Transformation** - Generates HTML output (if processor available)

## 🎓 Learning Resources

Quick references in order of usefulness:

1. **`user/QUICK_START.md`** ← Start here!
   - Essential patterns and templates
   - Common code snippets
   - Troubleshooting guide

2. **`user/README_TESTING.md`**
   - Detailed testing documentation
   - Setup requirements
   - Advanced testing scenarios

3. **`user/custom_view_creation.md`**
   - Complete guide to view creation
   - Meta-model class mapping
   - Registration process

4. **`CLAUDE.md`** (root)
   - Repository architecture
   - Directory structure
   - Development conventions

## 🛠️ Recommended Next Steps

### 1. Install Recommended Extensions
VS Code will prompt you to install recommended extensions.
Click "Install All" when prompted, or run:

```bash
code --install-extension redhat.vscode-xml
code --install-extension dotjoshjohnson.xml
```

### 2. Install XSLT Processor (Optional)
For full transformation testing:

**Windows (Chocolatey):**
```bash
choco install xsltproc
```

**Mac (Homebrew):**
```bash
brew install libxslt
```

**Linux (apt):**
```bash
sudo apt-get install xsltproc
```

### 3. Test Your View
```bash
# Validate structure
node user/test_runner.js user/tech_product_app_browser.xsl

# View results
cat user/test_output.html  # If processor installed
```

### 4. Deploy to Essential Viewer
1. Copy files to your Essential Viewer deployment:
   - `user/tech_product_app_browser.xsl`
   - Updated `reportXML.xml`

2. Access via URL:
   ```
   http://your-viewer/report?XML=reportXML.xml&XSL=user/tech_product_app_browser.xsl
   ```

3. Or navigate to: **Library → Technology Architecture Views**

## 💡 Pro Tips

### Keyboard Shortcuts
- `F5` - Test current XSL file
- `Ctrl+Shift+P` - Command palette
- `Ctrl+Shift+O` - Go to symbol in file
- `Shift+Alt+F` - Format XML/XSL

### Debugging Workflow
1. Make changes to XSL
2. Press F5 to validate
3. Fix any errors shown
4. Repeat until all checks pass
5. Deploy to server for full testing

### Common Patterns

**Make elements clickable:**
```xml
<xsl:variable name="linkClasses" select="('Class1', 'Class2')"/>
```

**Use Data APIs:**
```xml
<xsl:variable name="myAPI"
    select="$utilitiesAllDataSetAPIs[own_slot_value[slot_reference='name']/value='Core API: My Data']"/>
```

**Internationalize text:**
```xml
<xsl:value-of select="eas:i18n('My Text')"/>
```

## 🐛 Troubleshooting

**"No XSLT processor found"**
- Install xsltproc or Saxon (see Step 2 above)
- Structure validation still works without processor

**"Transformation failed"**
- Normal for complex views using Essential-specific includes
- Focus on structure validation instead

**"Missing template"**
- Add required includes to your XSL file
- Check `user/QUICK_START.md` for template list

**Test runner doesn't start**
- Ensure Node.js is installed: `node --version`
- Check file path is correct

## 📁 File Structure

```
essential_viewer/
├── .vscode/                    # VS Code configuration
│   ├── launch.json            # Debug configs (F5)
│   ├── tasks.json             # Build tasks
│   ├── settings.json          # Editor settings
│   └── extensions.json        # Recommended extensions
│
├── user/                      # Custom views
│   ├── tech_product_app_browser.xsl  # Your view
│   ├── test_runner.js         # Test script
│   ├── mock_reportXML.xml     # Auto-generated (gitignored)
│   ├── test_output.html       # Test output (gitignored)
│   ├── QUICK_START.md         # Quick reference
│   ├── README_TESTING.md      # Testing guide
│   └── custom_view_creation.md # View creation guide
│
├── reportXML.xml              # View registry (updated)
├── CLAUDE.md                  # Architecture guide
└── .gitignore                 # Git ignore rules
```

## 🎉 You're Ready!

Your XSL development environment is fully configured. Start by:

1. Opening `user/tech_product_app_browser.xsl`
2. Pressing `F5`
3. Reviewing the test results

Happy coding! 🚀

---

**Questions?** Check:
- `user/QUICK_START.md` - Quick patterns and examples
- `user/README_TESTING.md` - Detailed testing docs
- `.vscode/keybindings.md` - Keyboard shortcuts

**Need help?** The test runner provides detailed validation output to guide you.
