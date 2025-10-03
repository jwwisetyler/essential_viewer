
# Custom View Creation Guide

## Purpose
- Capture the workflow for adding organisation-specific Essential views beneath `user/`
- Link Essential's meta-model concepts to available data so custom views stay aligned with the architecture model
- Record every dependency a custom view needs so you can build, register, and maintain it without further reference material

## How the Viewer Delivers a View
- `reportXML.xml` is the runtime knowledge base; each `<simple_instance type="Report">` row is a view definition the viewer can render
- `view_library.xsl` and `common/portal_template*.xsl` read those `Report` instances, group them by taxonomy term, and surface them in the UI
- Each view is an XSLT stylesheet that transforms the shared XML into HTML, CSS, and JavaScript; the viewer injects runtime parameters (e.g. `param1`, `viewScopeTermIds`) before execution

## Map Concepts to Meta-Model Classes
Use the Essential University articles to confirm which classes a view should interrogate. The table maps the major architecture disciplines to the classes described in `reportXML.xml` and the most relevant University guides you downloaded.

| Domain | Core Classes | Key University Guides |
|---|---|---|
| Business | Business_Process, Business_Capability, Business_Domain, Business_Goal, Business_Layer | Adding Business Process Families, Adding Business Processes, Applications Service to Business Process, Business Capability Dashboard, Business Capability Model Editor, Business Capability Modelling, Business Domain IT Analysis, Business Domain Process Analysis, Business Domain Process Analysis - Meta Model, Business Goals and Objectives, Business Layer |
| Application | Application_Deployment, Application_Service, Application_Layer | Maintaining Application Deployments, Application Deployment Summary, Application Deployments, Application Service Modelling, Application to Application Services, Associating Processes to Required Application Services, Application Layer |
| Information | Information_View, Information_Concept | Information Modelling - Information Views, Information View Summary, Information Views, Information Concept Summary, Information Modelling - Information Concepts |
| Technology | Technology_Component, Technology_Provider, Technology_Product, Technology_Component_Architecture, Technology_Composite | Defining a Technology Component, Technology Component Architectures, Technology Component Catalogue and Summary, Define a Technology Provider Usage, Define Technology Provider Roles, Defining Technology Providers, Defining Technology Product Builds, Technology Product Editor, Defining Technology Composite |
| Strategy | Strategy_Management | Strategy Management |
| Project | Project | Adding Roles to Project Editor, Business Capability to Project Tree, Configuring the Metaproject |
| Value | Value_Stream | Value Stream Views, Value Streams and Customer Journeys |
| Roadmap | Roadmap | Filtering Views and Roadmap Framework, Roadmap Dashboard, Roadmap Enablement and Scoping Frameworks |
| Security | Security_Classification | How to Apply Security Classifications, Security Classification of Views and Elements |

*Tip:* match the class names exactly (e.g. `Business_Capability`, `Application_Service`) when you traverse `reportXML.xml` or call helper templates like `RenderInstanceLinkJavascript`.

## Prepare Your Workspace
- Create or reuse a folder under `user/` for bespoke views (e.g. `user/views/`); keep assets with the view (JS in `user/js/`, CSS overrides in `user/custom.css`, images in `user/images/`)
- Review similar core views (for example `business/core_bl_bus_org_structure_model.xsl`) to copy proven include lists and coding patterns
- Decide the target taxonomy before coding so you know which filters and home page tiles will surface the view

## Build the XSLT View
1. **Start with the standard header**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <xsl:stylesheet version="2.0" xpath-default-namespace="http://protege.stanford.edu/xml"
       xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
       xmlns:eas="http://www.enterprise-architecture.org/essential"
       xmlns:functx="http://www.functx.com"
       xmlns:xs="http://www.w3.org/2001/XMLSchema">
   ```
2. **Pull in shared templates and functions** (adjust paths as needed):
   ```xml
   <xsl:include href="../common/core_doctype.xsl"/>
   <xsl:include href="../common/core_common_head_content.xsl"/>
   <xsl:include href="../common/core_header.xsl"/>
   <xsl:include href="../common/core_footer.xsl"/>
   ```
   Add extras only when required (`core_js_functions.xsl`, `datatables_includes.xsl`, `core_external_doc_ref.xsl`, etc.)
3. **Declare the parameters the viewer supplies**:
   ```xml
   <xsl:param name="param1"/><!-- usually the focus instance id -->
   <xsl:param name="viewScopeTermIds"/><!-- taxonomy scoping string -->
   ```
   Derive helper variables from these (e.g. `eas:get_scoping_terms_from_string($viewScopeTermIds)`).
4. **Use the pre-loaded collections from `core_utilities.xsl`** ? they expose cached sets such as `$utilitiesAllReports`, `$utilitiesAllTaxonomyTerms`, `$utilitiesAllDataSetAPIs`.
5. **Root template**: always implement `xsl:template match="knowledge_base"` as the entry point. Call `docType`, set page `<head>` via `commonHeadContent`, and render the body inside `<html>`.
6. **Interactive behaviours**: call templates like `RenderInstanceLinkJavascript` for each class you want to click through, `RenderModalReportContent` for modal previews, and `RenderLinkHref` if you construct links manually.
7. **Internationalisation**: wrap labels with `eas:i18n()` so the view honours the active language files (`../language/` or `../user/language/`).
8. **Keep styling external**: add minimal inline CSS; prefer `user/custom.css` for bespoke tweaks.

## Register the View in `reportXML.xml`
Create a new `<simple_instance>` of type `Report`. The minimal slot values are:
- `report_label` ? display name shown in tiles and menus
- `report_history_label` ? text for breadcrumbs/history
- `report_xsl_filename` ? set to `user/your_view.xsl`
- `report_is_enabled` ? `true` to make it live
- `report_implementation_type` ? reuse `viewer3_devrep_14032012_003_Class10015` for HTML outputs
- `description` ? short explanation for tooltips and catalogues
- `element_classified_by` ? one or more taxonomy term IDs that drive placement (see below)
- Optional but recommended: `report_screenshot_filename` (`user/images/...`), `report_qualifying_report` (parent report for portal contexts), `system_is_published`, `system_content_visibility`

### Choose a Classification
Use the following taxonomy term names (they exist in `reportXML.xml` as `Taxonomy_Term` instances) when you populate `element_classified_by`:
- Enterprise Architecture Views, Business Architecture Views, Information Architecture Views, Application Architecture Views, Technology Architecture Views, Project Delivery, Architecture Governance, Architecture Standards Management, Architecture Strategy Management, Catalogue Views, Support Views, Unclassified

Add the matching *View Filter* taxonomy terms if you need the view to appear for a role-based landing page:
- Business Architect View Filter, Business Analyst View Filter, Business Executive View Filter, Application Architect View Filter, Information Architect View Filter, Technology Architect View Filter, Data Architect View Filter, IT Executive View Filter, Project Delivery View Filter, Strategy Management View Filter, Architecture Governance View Filter, Architecture Standards Management View Filter

`reportXML.xml` stores taxonomy instances by internal ID; search for `<value value_type="string">Your Taxonomy Name</value>` to locate the correct identifier before editing.

### Update Related Constants
- `Report_Constant` ?View Filter Taxonomies? controls which taxonomy terms appear in the viewer?s filter bar ? include your new term if you introduce a brand-new category
- `Report_Constant` ?Home Page? lists taxonomy terms for the tiles rendered on the landing page; add your term there to surface the view immediately after deployment

## Optional: Wire into Portals and Groups
- Set `report_qualifying_report` if the view should open inside an existing portal tile; the viewer passes `targetReportId` when navigating from the parent
- To add a tile group, create or reuse a `Report_Group` instance and reference it from the relevant portal definitions
- For editors/catalogues, replicate the slot pattern used by similar `Catalogue` or `Editor` instances and point `report_xsl_filename` to your artefact

## Add Supporting Assets
- Place screenshots under `user/images/` and reference them from `report_screenshot_filename`
- Host bespoke JS libraries in `user/js/` and include them in the `<head>` section of your view
- Extend `user/custom.css` for theme overrides so core styles remain untouched
- Keep localisation strings in `user/language/<locale>.xml` if you introduce new labels

## Validate the View
- Run the viewer locally, navigate to **Library ? Enterprise Architecture Views** (or the taxonomy you chose) and confirm the tile appears with the right metadata
- Open the view directly via `report?XML=reportXML.xml&XSL=user/your_view.xsl&PMA=...` to smoke-test parameters (replace `param1`/`param2` with target IDs)
- Test scoping by passing `viewScopeTermIds` from a taxonomy term the way existing views do; confirm `eas:get_scoping_terms_from_string` resolves correctly
- Review access control: if you use sensitive classes, confirm the security classification on the data matches the viewer security configuration in `WEB-INF/security`

## Maintain the Catalogue Entry
- Update `system_last_modified_author_id` and `system_last_modified_datetime_iso8601` inside the `Report` instance for traceability
- Refresh the screenshot if the layout changes so `view_library.xsl` shows accurate previews
- Revisit the University mapping table above whenever you extend the meta-model; add new class-page relationships to keep future views consistent
