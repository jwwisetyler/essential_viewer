# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Essential Viewer is an open-source enterprise architecture visualization platform built on Java servlets and XSLT 2.0/3.0. It transforms XML knowledge bases (`reportXML.xml`) into interactive HTML views for analyzing business capabilities, applications, technology, information architecture, and strategic plans.

**Technology Stack:**
- Backend: Java servlets (WEB-INF/), Apache Xalan XSLT processor
- Frontend: XSLT 2.0/3.0 templates generating HTML + JavaScript
- Libraries: Bootstrap 3.4.1, jQuery, D3.js v4.11, DataTables, Handlebars
- Deployment: Java Web Application (WAR structure with WEB-INF/)

**Architecture Pattern:**
The viewer operates as a single-page report engine: each view is an XSLT stylesheet that transforms `reportXML.xml` (11+ MB, ~1100 report definitions) into interactive HTML. Views receive runtime parameters (`param1`, `viewScopeTermIds`) from the servlet and use shared templates from `common/` for headers, footers, navigation, and data access patterns.

## Key Directories

```
/
├── business/          # 105 XSL files - business capabilities, processes, value streams
├── application/       # 113 XSL files - app landscape, services, deployments, interfaces
├── information/       # 39 XSL files - data models, information views
├── technology/        # 86 XSL files - tech components, infrastructure, lifecycles
├── enterprise/        # 114 XSL files - cross-domain dashboards, governance, portfolios
├── integration/       # 81 XSL files - APIs, data export utilities, launchpad integration
├── common/            # 79 XSL shared templates (utilities, headers, modals, JS functions)
│   └── api/          # Report API pre-caching configurations
├── platform/          # Login, error pages, maintenance services
├── user/              # Custom views, CSS, JS, images (organization-specific extensions)
│   ├── custom.css
│   ├── custom_view_creation.md
│   └── view_classification_inventory.md
├── js/                # Third-party libraries (Bootstrap, D3, jQuery, DataTables, etc.)
├── css/               # Core stylesheets
├── WEB-INF/           # Servlet configuration, security, JSTL tag libraries
│   ├── web.xml       # Servlet mappings, context parameters, filters
│   ├── security/     # XSLT-based authorization queries, CSRF protection
│   └── lib/          # Java dependencies
├── reportXML.xml      # ~11.5 MB runtime knowledge base (all EA data + view metadata)
├── view_library.xsl   # Master catalog rendering all views by taxonomy
├── home.xsl           # Landing page with role-filtered tiles
└── portal_redirect.xsl # Entry point that routes to home.xsl
```

## Essential Meta-Model Classes

The viewer operates on Essential's meta-model. Key classes referenced in XPath queries:

| Domain | Core Classes |
|--------|--------------|
| **Business** | `Business_Capability`, `Business_Process`, `Business_Domain`, `Business_Goal`, `Business_Layer`, `Business_Service`, `Physical_Process` |
| **Application** | `Application_Provider`, `Composite_Application_Provider`, `Application_Service`, `Application_Deployment`, `Application_Layer` |
| **Information** | `Information_View`, `Information_Concept`, `Data_Object`, `Data_Subject` |
| **Technology** | `Technology_Component`, `Technology_Provider`, `Technology_Product`, `Technology_Component_Architecture`, `Technology_Composite`, `Technology_Node` |
| **Strategy** | `Strategic_Plan`, `Enterprise_Strategic_Plan`, `Business_Strategic_Plan`, `Application_Strategic_Plan` |
| **Project** | `Project`, `Programme`, `Project_Milestone` |
| **Value** | `Value_Stream`, `Value_Stage` |
| **Governance** | `Report`, `Taxonomy_Term`, `Data_Set_API`, `Report_Constant` |

Class names must match exactly when traversing `reportXML.xml` or calling helper templates like `RenderInstanceLinkJavascript`.

## View Structure Pattern

Every Essential view follows this XSLT structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" xpath-default-namespace="http://protege.stanford.edu/xml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:eas="http://www.enterprise-architecture.org/essential"
    xmlns:functx="http://www.functx.com"
    xmlns:xs="http://www.w3.org/2001/XMLSchema">

    <!-- Include shared templates -->
    <xsl:include href="../common/core_doctype.xsl"/>
    <xsl:include href="../common/core_common_head_content.xsl"/>
    <xsl:include href="../common/core_header.xsl"/>
    <xsl:include href="../common/core_footer.xsl"/>

    <!-- Standard parameters supplied by servlet -->
    <xsl:param name="param1"/>              <!-- Focus instance ID -->
    <xsl:param name="viewScopeTermIds"/>    <!-- Taxonomy scoping string -->

    <!-- Derive scoping terms -->
    <xsl:variable name="viewScopeTerms" select="eas:get_scoping_terms_from_string($viewScopeTermIds)"/>

    <!-- Use pre-loaded collections from core_utilities.xsl -->
    <!-- Available: $utilitiesAllReports, $utilitiesAllTaxonomyTerms, $utilitiesAllDataSetAPIs, etc. -->

    <!-- Root template - entry point -->
    <xsl:template match="knowledge_base">
        <xsl:call-template name="docType"/>
        <html>
            <head>
                <xsl:call-template name="commonHeadContent"/>
                <!-- Register clickable classes for modal/navigation -->
                <xsl:call-template name="RenderModalReportContent">
                    <xsl:with-param name="essModalClassNames" select="$linkClasses"/>
                </xsl:call-template>
                <title>View Title</title>
            </head>
            <body>
                <xsl:call-template name="Heading"/>
                <!-- View content here -->
                <xsl:call-template name="Footer"/>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
```

**Key Shared Templates (from `common/core_utilities.xsl`):**
- `RenderInstanceLinkJavascript` - Makes classes clickable (registers navigation handlers)
- `RenderModalReportContent` - Enables modal pop-up previews
- `RenderLinkHref` - Constructs URLs manually
- `eas:i18n()` - Internationalization wrapper for labels

## Registering Views in reportXML.xml

Each view requires a `<simple_instance type="Report">` entry with these key slots:

```xml
<simple_instance>
    <type>Report</type>
    <slot>
        <slot_reference>report_label</slot_reference>
        <value>Display Name</value>
    </slot>
    <slot>
        <slot_reference>report_xsl_filename</slot_reference>
        <value>user/your_view.xsl</value>
    </slot>
    <slot>
        <slot_reference>report_is_enabled</slot_reference>
        <value>true</value>
    </slot>
    <slot>
        <slot_reference>element_classified_by</slot_reference>
        <value>taxonomy_term_id</value>
    </slot>
</simple_instance>
```

**Standard Taxonomy Terms** (for `element_classified_by`):
- **Primary:** Enterprise Architecture Views, Business Architecture Views, Application Architecture Views, Technology Architecture Views, Information Architecture Views, Project Delivery, Architecture Governance, Architecture Standards Management, Catalogue Views, Support Views
- **Role Filters:** Business Architect View Filter, Application Architect View Filter, Technology Architect View Filter, Information Architect View Filter, Data Architect View Filter, Business Analyst View Filter, Business Executive View Filter, IT Executive View Filter, Project Delivery View Filter, Strategy Management View Filter, Architecture Governance View Filter

## Development Workflow

**Adding a Custom View:**

1. Create XSL file under `user/` (e.g., `user/my_custom_view.xsl`)
2. Follow standard view structure pattern above
3. Reference similar core views (e.g., `business/core_bl_bus_cap_model.xsl`) for patterns
4. Add `<simple_instance type="Report">` entry to `reportXML.xml`
5. Classify with appropriate taxonomy terms
6. Place supporting assets in `user/images/`, `user/js/`, or extend `user/custom.css`

**Testing a View:**
- Direct URL: `report?XML=reportXML.xml&XSL=user/my_view.xsl&PMA=instance_id`
- Check Library: Navigate to Library → [Your Taxonomy] to verify tile appears
- Verify scoping: Pass `viewScopeTermIds` to test taxonomy filtering

**Important Files:**
- `view_library.xsl` - Renders all views grouped by taxonomy (uses `$utilitiesAllReports`)
- `home.xsl` - Landing page that surfaces views by role filter
- `common/portal_template.xsl` - Portal/dashboard layout templates
- `common/core_utilities.xsl` - 131KB shared utility functions (see line 63-99 for pre-loaded collections)

## Security and Access Control

- Security classifications stored in `WEB-INF/security/`
- Views protected via `userAuthZ.xsl` and `getSecurityConfig.xsl`
- CSRF protection filters in `web.xml` (lines 59-68)
- Direct XSL access blocked via `NobodyHasThisRole` constraint (web.xml:558-568)
- User authentication via `ViewerLogin` servlet (supports EIP/OAuth)

## Common Tasks

**Find where a class is used:**
```bash
grep -r "type = 'Business_Capability'" business/*.xsl
```

**Count views in a directory:**
```bash
ls application/*.xsl | wc -l
```

**Search for a specific template:**
```bash
grep -r "xsl:template name=\"RenderInstanceLinkJavascript\"" common/
```

**Identify taxonomy term IDs:**
Search `reportXML.xml` for `<value value_type="string">Your Taxonomy Name</value>` to find the corresponding instance ID.

## References

- `user/custom_view_creation.md` - Comprehensive guide to building custom views
- `user/view_classification_inventory.md` - Complete taxonomy and directory mapping
- Essential University (external) - Meta-model class documentation
- Version history: Currently v6.21.0 (see git log for recent releases)

## Notes

- This is an XSLT-heavy codebase (679+ XSL files). View logic lives in templates, not Java.
- The servlet (`com.enterprise_architecture.essential.report.ReportServlet`) only orchestrates transformation; business logic is in XSL.
- XSL templates use XSLT 2.0/3.0 features (sequences, functions, xpath-default-namespace).
- Browser-side interactivity via jQuery; modern visualizations use D3.js v4.11.
- All user-facing text should use `eas:i18n()` for multi-language support (language files in `language/` and `user/language/`).
- Custom views go under `user/` to preserve separation from core Essential distribution.
