# Quick Start Guide - XSL Development & Testing

## 🚀 Test Your XSL View

### Method 1: Keyboard Shortcut (Fastest)
1. Open your `.xsl` file in VS Code
2. Press `F5` (or `Ctrl+Shift+D` then `F5`)
3. Select **"Test XSL View (Mock Data)"**
4. View results in the terminal

### Method 2: Command Line
```bash
node user/test_runner.js user/tech_product_app_browser.xsl
```

### Method 3: VS Code Tasks Menu
1. Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
2. Type "Run Task"
3. Select **"Test Current XSL View"**

## 📋 What Gets Tested

✓ XSL structure validation
✓ Required templates check
✓ Variables and API references
✓ Syntax validation
✓ HTML transformation (if XSLT processor installed)

## 🛠️ Essential XSL View Template

Every view needs these core elements:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
    xpath-default-namespace="http://protege.stanford.edu/xml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:eas="http://www.enterprise-architecture.org/essential">

    <!-- Required includes -->
    <xsl:include href="../common/core_doctype.xsl"/>
    <xsl:include href="../common/core_common_head_content.xsl"/>
    <xsl:include href="../common/core_header.xsl"/>
    <xsl:include href="../common/core_footer.xsl"/>

    <!-- Parameters from servlet -->
    <xsl:param name="param1"/>
    <xsl:param name="viewScopeTermIds"/>

    <!-- Link classes for modal/navigation -->
    <xsl:variable name="linkClasses" select="('Class1', 'Class2')"/>

    <!-- Main template -->
    <xsl:template match="knowledge_base">
        <xsl:call-template name="docType"/>
        <html>
            <head>
                <xsl:call-template name="commonHeadContent"/>
                <xsl:call-template name="RenderModalReportContent">
                    <xsl:with-param name="essModalClassNames" select="$linkClasses"/>
                </xsl:call-template>
                <title><xsl:value-of select="eas:i18n('My View')"/></title>
            </head>
            <body>
                <xsl:call-template name="Heading"/>

                <!-- YOUR CONTENT HERE -->

                <xsl:call-template name="Footer"/>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
```

## 🔗 Making Elements Clickable

### Register link classes:
```xml
<xsl:variable name="linkClasses" select="('Technology_Product', 'Application_Provider')"/>

<xsl:for-each select="$linkClasses">
    <xsl:call-template name="RenderInstanceLinkJavascript">
        <xsl:with-param name="instanceClassName" select="current()"/>
        <xsl:with-param name="targetMenu" select="()"/>
    </xsl:call-template>
</xsl:for-each>
```

### In Handlebars templates:
```handlebars
{{#essRenderInstanceLink this 'Technology_Product'}}{{/essRenderInstanceLink}}
```

## 📊 Using Data Set APIs

```xml
<!-- Define API variable -->
<xsl:variable name="myDataAPI"
    select="$utilitiesAllDataSetAPIs[own_slot_value[slot_reference = 'name']/value = 'Core API: My Data']"/>

<!-- Get API path in template -->
<xsl:variable name="apiPath">
    <xsl:call-template name="GetViewerAPIPath">
        <xsl:with-param name="apiReport" select="$myDataAPI"/>
    </xsl:call-template>
</xsl:variable>

<!-- Use in JavaScript -->
<script>
    var apiURL = '<xsl:value-of select="$apiPath"/>';

    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            // Process data
        });
</script>
```

## 🌍 Internationalization

Always use `eas:i18n()` for user-facing text:

```xml
<xsl:value-of select="eas:i18n('Technology Product')"/>
```

## 📝 Register Your View in reportXML.xml

Add this before `</knowledge_base>`:

```xml
<simple_instance>
    <name>your_view_unique_id</name>
    <type>Report</type>
    <own_slot_value>
        <slot_reference>report_is_enabled</slot_reference>
        <value value_type="boolean">true</value>
    </own_slot_value>
    <own_slot_value>
        <slot_reference>report_xsl_filename</slot_reference>
        <value value_type="string">user/your_view.xsl</value>
    </own_slot_value>
    <own_slot_value>
        <slot_reference>report_label</slot_reference>
        <value value_type="string">Your View Display Name</value>
    </own_slot_value>
    <own_slot_value>
        <slot_reference>element_classified_by</slot_reference>
        <value value_type="simple_instance">essential_baseline_v2.0_Class80007</value>
    </own_slot_value>
</simple_instance>
```

### Common Taxonomy Term IDs:
- `essential_baseline_v2.0_Class80007` - Technology Architecture Views
- `essential_baseline_v2.0_Class80006` - Application Architecture Views
- `essential_baseline_v2.0_Class80005` - Business Architecture Views
- `essential_baseline_v2.0_Class80008` - Information Architecture Views
- `viewer3_dev_12032012_Class10000` - Technology Architect View Filter
- `viewer3_dev_12032012_Class10002` - Application Architect View Filter

## 🎨 Common Patterns

### Pagination
```javascript
var currentPage = 1;
var itemsPerPage = 25;

function renderPage(items, page) {
    var start = (page - 1) * itemsPerPage;
    var end = start + itemsPerPage;
    var pageItems = items.slice(start, end);
    // Render pageItems...
}
```

### Filtering with DataTables
```javascript
var table = $('#myTable').DataTable({
    paging: true,
    pageLength: 25,
    searching: true,
    ordering: true
});
```

### Handlebars Helpers
```javascript
Handlebars.registerHelper('essRenderInstanceLink', function(instance, type) {
    // Link rendering logic
});
```

## 🐛 Debugging

### Check Console Output
```bash
node user/test_runner.js user/your_view.xsl
```

### Common Issues:

**"Missing template"** → Add required include:
```xml
<xsl:include href="../common/core_doctype.xsl"/>
```

**"Transformation failed"** → View may need full Essential environment

**"No XSLT processor"** → Install xsltproc or Saxon (optional)

## 🔍 Access Your View

After deployment:

**Direct URL:**
```
http://your-viewer/report?XML=reportXML.xml&XSL=user/your_view.xsl
```

**With instance focus:**
```
http://your-viewer/report?XML=reportXML.xml&XSL=user/your_view.xsl&PMA=instance_id
```

**From View Library:**
Navigate to Library → [Your Taxonomy Category]

## 📚 More Resources

- `user/README_TESTING.md` - Detailed testing documentation
- `user/custom_view_creation.md` - Complete view creation guide
- `CLAUDE.md` - Repository architecture guide
- Technology views in `technology/` folder - Reference implementations

## 💡 Pro Tips

1. **Test early, test often** - Run `F5` after every significant change
2. **Use core views as templates** - Copy from `business/`, `application/`, or `technology/`
3. **Keep it simple** - Start with basic structure, add features incrementally
4. **Check existing APIs** - Many data sets already exist in `common/api/`
5. **Use browser dev tools** - Essential Viewer runs client-side, inspect network/console
