
# View Classification Inventory

## Purpose
- Summarise every view taxonomy available in `reportXML.xml`
- Highlight which XSL directories supply each taxonomy so you can reuse patterns when building new views
- Record the filter taxonomies that drive persona landing pages

## Primary View Taxonomies
| Classification | Active Views | Total Views | Representative Views |
|---|---|---|---|
| Application Architecture Views | 30 | 34 | Application Interface Catalogue, Application Capability Summary, Application Service Summary |
| Architecture Governance | 11 | 25 | Application Interface Catalogue, Application Capability Catalogue, Application Service Catalogue |
| Architecture Standards Management | 3 | 6 | Application Technology Strategy Alignment, Application Diversity Analysis, Data Catalogue |
| Architecture Strategy Management | 7 | 10 | Project Summary, Programme Summary, Project People Network |
| Business Architecture Views | 30 | 38 | Business Service Interaction Model, Business Domain IT Analysis, Business Domain Process Analysis |
| Catalogue Views | 28 | 49 | Data Catalogue, Information Catalogue, Data Representation Catalogue |
| Deprecated Views | 0 | 1 |  |
| Enterprise Architecture Views | 29 | 32 | Strategic Trends Radar, Supplier Impact Map, Supplier License Management |
| Information Architecture Views | 21 | 25 | Data Object Provider Model, Data Subject to Application Service Model, Data Subject Security Model |
| Project Delivery | 15 | 25 | Project Summary, Programme Summary, Project People Network |
| Support Views | 14 | 16 | All Instances by Class, Class Overview, Duplicate Dashboard - Key Classes |
| Technology Architecture Views | 12 | 26 | Technology Node Summary, Technology Component Summary, Application Technology Strategy Alignment |
| Unclassified | 3 | 5 | View Library, IT Asset Dashboard View Checker, Application Capability Catalogue as Table |

## Persona and Filter Taxonomies
| Classification | Active Views | Total Views | Representative Views |
|---|---|---|---|
| Application Architect View Filter | 51 | 70 | Application Interface Catalogue, Application Capability Summary, Application Service Summary |
| Architecture Governance View Filter | 37 | 46 | Application Capability Summary, Application Service Summary, Application Information Dependency Model |
| Architecture Standards Management View Filter | 8 | 14 | Application Technology Strategy Alignment, Technology Product Catalogue, Business Domain Process Analysis |
| Business Analyst View Filter | 26 | 37 | Application Interface Catalogue, Application Capability Summary, Application Service Summary |
| Business Architect View Filter | 19 | 26 | Project Summary, Programme Summary, Project People Network |
| Business Executive View Filter | 12 | 13 | Project Summary, Programme Summary, Project People Network |
| Data Architect View Filter | 41 | 58 | Data Object Provider Model, Data Subject to Application Service Model, Data Subject Security Model |
| IT Executive View Filter | 11 | 13 | Project Summary, Programme Summary, Project People Network |
| Information Architect View Filter | 17 | 21 | Project Summary, Programme Summary, Project People Network |
| Project Delivery View Filter | 37 | 53 | Application Interface Catalogue, Application Capability Summary, Application Service Summary |
| Strategy Management View Filter | 26 | 31 | Project Summary, Programme Summary, Project People Network |
| Technology Architect View Filter | 10 | 21 | Application Capability Summary, Application Service Summary, Application Summary - |

## Where the XSL Lives
| Folder | XSL Files | Notes |
|---|---|---|
| business | 105 | Business architecture dashboards, catalogues, process visuals |
| application | 113 | Application landscape, service and deployment views |
| information | 39 | Data and information models |
| technology | 86 | Technology reference, lifecycle, and infrastructure views |
| enterprise | 114 | Cross-domain dashboards, governance, value stream, portfolios |
| integration | 81 | APIs, launchpad exports, data integration utilities |
| view_manual | 36 | Legacy documentation-style views |
| common | 79 | Shared templates, utilities, headers/footers |
| platform | 7 | Login, error, access and maintenance views |
| user | 0 | Custom assets (currently README & CSS) |

## Observations
- Several filter taxonomies reuse the same underlying reports (e.g. Project Delivery and Strategy filters surface programme/project dashboards defined under `enterprise/`)
- Catalogue views aggregate data across domains; most live in `application/`, `information/`, and `technology/` with shared structures for alphabetical navigation and API-backed tables
- `Support Views` provide housekeeping tooling (integrity checks, duplicate finders) and are the best examples when you need utility-style outputs in `user/`
- Unclassified reports include diagnostic helpers (`View Library`, `IT Asset Dashboard View Checker`). Either reclassify them or leave them hidden from end users
- Keep filter and primary classifications aligned whenever you introduce a new taxonomy so home-page tiles, role filters, and the library stay in sync
