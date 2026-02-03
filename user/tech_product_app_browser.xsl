<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="2.0" xpath-default-namespace="http://protege.stanford.edu/xml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xalan="http://xml.apache.org/xslt"
    xmlns:pro="http://protege.stanford.edu/xml"
    xmlns:eas="http://www.enterprise-architecture.org/essential"
    xmlns:functx="http://www.functx.com"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:ess="http://www.enterprise-architecture.org/essential/errorview">

    <xsl:include href="../common/core_doctype.xsl"/>
    <xsl:include href="../common/core_common_head_content.xsl"/>
    <xsl:include href="../common/core_header.xsl"/>
    <xsl:include href="../common/core_footer.xsl"/>
    <xsl:include href="../common/core_external_doc_ref.xsl"/>
    <xsl:include href="../common/core_api_fetcher.xsl"/>

    <xsl:output method="html" omit-xml-declaration="yes" indent="yes"/>

    <xsl:param name="param1"/>

    <!-- START GENERIC PARAMETERS -->
    <xsl:param name="viewScopeTermIds"/>
    <xsl:param name="targetReportId"/>
    <xsl:param name="targetMenuShortName"/>
    <!-- END GENERIC PARAMETERS -->

    <!-- START GENERIC LINK VARIABLES -->
    <xsl:variable name="viewScopeTerms" select="eas:get_scoping_terms_from_string($viewScopeTermIds)"/>
    <xsl:variable name="linkClasses" select="('Technology_Product', 'Supplier', 'Application_Provider', 'Composite_Application_Provider', 'Technology_Component')"/>
    <!-- END GENERIC LINK VARIABLES -->

    <!-- Data Set APIs -->
    <xsl:variable name="techProductsAPI" select="$utilitiesAllDataSetAPIs[own_slot_value[slot_reference = 'name']/value = 'Core API: Technology Products and Suppliers']"/>
    <xsl:variable name="appsToTechAPI" select="$utilitiesAllDataSetAPIs[own_slot_value[slot_reference = 'name']/value = 'Core API: Import Applications to Technology']"/>
    <xsl:variable name="appMartAPI" select="$utilitiesAllDataSetAPIs[own_slot_value[slot_reference = 'name']/value = 'Core API: Application Mart']"/>

    <xsl:template match="knowledge_base">
        <xsl:call-template name="docType"/>

        <xsl:variable name="apiTechProducts">
            <xsl:call-template name="GetViewerAPIPath">
                <xsl:with-param name="apiReport" select="$techProductsAPI"/>
            </xsl:call-template>
        </xsl:variable>

        <xsl:variable name="apiAppsToTech">
            <xsl:call-template name="GetViewerAPIPath">
                <xsl:with-param name="apiReport" select="$appsToTechAPI"/>
            </xsl:call-template>
        </xsl:variable>

        <xsl:variable name="apiAppMart">
            <xsl:call-template name="GetViewerAPIPath">
                <xsl:with-param name="apiReport" select="$appMartAPI"/>
            </xsl:call-template>
        </xsl:variable>

        <html>
            <head>
                <xsl:call-template name="commonHeadContent"/>
                <xsl:call-template name="RenderModalReportContent">
                    <xsl:with-param name="essModalClassNames" select="$linkClasses"/>
                </xsl:call-template>

                <xsl:for-each select="$linkClasses">
                    <xsl:call-template name="RenderInstanceLinkJavascript">
                        <xsl:with-param name="instanceClassName" select="current()"/>
                        <xsl:with-param name="targetMenu" select="()"/>
                    </xsl:call-template>
                </xsl:for-each>

                <title><xsl:value-of select="eas:i18n('Technology Product Browser')"/></title>

                <style>
                    .product-card {
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        padding: 15px;
                        margin-bottom: 15px;
                        background-color: #fff;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .product-header {
                        border-bottom: 2px solid #3fceb9;
                        padding-bottom: 10px;
                        margin-bottom: 10px;
                    }
                    .product-name {
                        font-size: 1.3em;
                        font-weight: bold;
                        color: #333;
                    }
                    .product-supplier {
                        font-size: 0.9em;
                        color: #666;
                        margin-top: 5px;
                    }
                    .product-description {
                        margin: 10px 0;
                        color: #555;
                    }
                    .applications-section {
                        margin-top: 15px;
                        padding: 10px;
                        background-color: #f9f9f9;
                        border-radius: 4px;
                    }
                    .applications-title {
                        font-weight: bold;
                        color: #333;
                        margin-bottom: 10px;
                        user-select: none;
                    }
                    .applications-title:hover {
                        background-color: #f0f0f0;
                        padding: 5px;
                        margin: -5px -5px 10px -5px;
                        border-radius: 3px;
                    }
                    .toggle-icon {
                        transition: transform 0.3s ease;
                        display: inline-block;
                        width: 16px;
                    }
                    .toggle-icon.expanded {
                        transform: rotate(90deg);
                    }
                    .app-list {
                        list-style-type: none;
                        padding-left: 0;
                    }
                    .app-list li {
                        padding: 5px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .app-list li:last-child {
                        border-bottom: none;
                    }
                    .app-badge {
                        display: inline-block;
                        padding: 3px 8px;
                        background-color: #3fceb9;
                        color: white;
                        border-radius: 3px;
                        font-size: 0.8em;
                        margin-left: 5px;
                    }
                    .no-apps {
                        font-style: italic;
                        color: #999;
                    }
                    .filter-section {
                        background-color: #f5f5f5;
                        padding: 15px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                    }
                    .stats-badge {
                        display: inline-block;
                        padding: 5px 10px;
                        background-color: #5bc0de;
                        color: white;
                        border-radius: 4px;
                        margin-left: 10px;
                    }
                    .component-tag {
                        display: inline-block;
                        padding: 2px 6px;
                        background-color: #efefef;
                        border: 1px solid #ddd;
                        border-radius: 3px;
                        font-size: 0.85em;
                        margin-right: 5px;
                        margin-bottom: 5px;
                    }
                    .product-meta {
                        margin: 10px 0;
                        padding: 10px;
                        background-color: #f8f8f8;
                        border-radius: 4px;
                    }
                    .meta-item {
                        display: inline-block;
                        margin-right: 15px;
                        margin-bottom: 5px;
                    }
                    .meta-label {
                        font-weight: bold;
                        color: #666;
                        font-size: 0.85em;
                        margin-right: 5px;
                    }
                    .status-tag {
                        display: inline-block;
                        padding: 4px 10px;
                        border-radius: 12px;
                        font-size: 0.85em;
                        font-weight: 500;
                        white-space: nowrap;
                    }
                </style>
            </head>
            <body>
                <!-- ADD THE PAGE HEADING -->
                <xsl:call-template name="Heading"/>
                <xsl:call-template name="ViewUserScopingUI"/>

                <!--ADD THE CONTENT-->
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-xs-12">
                            <div class="page-header">
                                <h1>
                                    <span class="text-primary"><xsl:value-of select="eas:i18n('View')"/>: </span>
                                    <span class="text-darkgrey"><xsl:value-of select="eas:i18n('Technology Product to Application Browser')"/></span>
                                </h1>
                            </div>
                        </div>

                        <div class="col-xs-12">
                            <div class="filter-section">
                                <div class="row">
                                    <div class="col-sm-6">
                                        <label for="searchInput"><xsl:value-of select="eas:i18n('Search Products')"/>:</label>
                                        <input type="text" id="searchInput" class="form-control" placeholder="Search by product name, supplier, or component..."/>
                                    </div>
                                    <div class="col-sm-3">
                                        <label for="supplierFilter"><xsl:value-of select="eas:i18n('Filter by Supplier')"/>:</label>
                                        <select id="supplierFilter" class="form-control">
                                            <option value="all"><xsl:value-of select="eas:i18n('All Suppliers')"/></option>
                                        </select>
                                    </div>
                                    <div class="col-sm-3">
                                        <label for="appFilter"><xsl:value-of select="eas:i18n('Show')"/>:</label>
                                        <select id="appFilter" class="form-control">
                                            <option value="all"><xsl:value-of select="eas:i18n('All Products')"/></option>
                                            <option value="withApps"><xsl:value-of select="eas:i18n('Products with Applications')"/></option>
                                            <option value="withoutApps"><xsl:value-of select="eas:i18n('Products without Applications')"/></option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-xs-12">
                            <div id="statsBar" style="margin-bottom: 15px;">
                                <strong><xsl:value-of select="eas:i18n('Showing')"/>:</strong>
                                <span id="currentCount">0</span> <xsl:value-of select="eas:i18n('of')"/>
                                <span id="totalCount">0</span> <xsl:value-of select="eas:i18n('products')"/>
                            </div>
                        </div>

                        <div class="col-xs-12">
                            <div id="productContainer">
                                <!-- Products will be rendered here -->
                            </div>
                        </div>

                        <div class="col-xs-12 text-center">
                            <div id="paginationContainer" style="margin: 20px 0;">
                                <!-- Pagination controls will be rendered here -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ADD THE PAGE FOOTER -->
                <xsl:call-template name="Footer"/>

                <!-- Handlebars Templates -->
                <script id="product-card-template" type="text/x-handlebars-template">
                    <div class="product-card">
                        <div class="product-header">
                            <div class="product-name">
                                {{#essRenderInstanceLink this 'Technology_Product'}}{{/essRenderInstanceLink}}
                            </div>
                            {{#if supplier}}
                            <div class="product-supplier">
                                <i class="fa fa-building"></i> <xsl:value-of select="eas:i18n('Supplier')"/>:
                                {{#essRenderInstanceLink supplierObj 'Supplier'}}{{/essRenderInstanceLink}}
                            </div>
                            {{/if}}
                        </div>

                        {{#if description}}
                        <div class="product-description">
                            {{description}}
                        </div>
                        {{/if}}

                        <div class="product-meta">
                            {{#if productFamily}}
                            <div class="meta-item">
                                <span class="meta-label"><xsl:value-of select="eas:i18n('Product Family')"/>:</span>
                                <span>{{productFamily}}</span>
                            </div>
                            {{/if}}
                            {{#if lifecycleStatus}}
                            <div class="meta-item">
                                <span class="meta-label"><xsl:value-of select="eas:i18n('Lifecycle Status')"/>:</span>
                                <span class="status-tag" style="background-color: {{{{lifecycleColor}}}}; color: {{{{lifecycleTextColor}}}};">{{lifecycleStatus}}</span>
                            </div>
                            {{/if}}
                            {{#if deliveryModel}}
                            <div class="meta-item">
                                <span class="meta-label"><xsl:value-of select="eas:i18n('Delivery Model')"/>:</span>
                                <span>{{deliveryModel}}</span>
                            </div>
                            {{/if}}
                        </div>

                        {{#if components}}
                        <div style="margin: 10px 0;">
                            <strong><xsl:value-of select="eas:i18n('Components')"/>:</strong>
                            {{#each components}}
                                <span class="component-tag">{{this.name}}</span>
                            {{/each}}
                        </div>
                        {{/if}}

                        <div class="applications-section">
                            <div class="applications-title" style="cursor: pointer;" onclick="toggleApps(this)">
                                <i class="fa fa-chevron-right toggle-icon"></i>
                                <i class="fa fa-desktop"></i> <xsl:value-of select="eas:i18n('Applications Using This Product')"/>
                                <span class="app-badge">{{appCount}}</span>
                            </div>
                            {{#if applications}}
                            <ul class="app-list" style="display: none;">
                                {{#each applications}}
                                <li>
                                    <i class="fa fa-circle"></i>
                                    {{#essRenderInstanceLink this 'Application_Provider'}}{{/essRenderInstanceLink}}
                                </li>
                                {{/each}}
                            </ul>
                            {{else}}
                            <div class="no-apps" style="display: none;"><xsl:value-of select="eas:i18n('No applications currently using this product')"/></div>
                            {{/if}}
                        </div>
                    </div>
                </script>

            </body>
            <script>
                var viewAPIDataTechProducts = '<xsl:value-of select="$apiTechProducts"/>';
                var viewAPIDataAppsToTech = '<xsl:value-of select="$apiAppsToTech"/>';
                var viewAPIDataAppMart = '<xsl:value-of select="$apiAppMart"/>';

        var promise_loadViewerAPIData = function (apiDataSetURL) {
            return new Promise(function (resolve, reject) {
                if (apiDataSetURL != null) {
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function () {
                        if (this.readyState == 4 &amp;&amp; this.status == 200) {
                            var viewerData = JSON.parse(this.responseText);
                            resolve(viewerData);
                        }
                    };
                    xmlhttp.onerror = function () {
                        reject(false);
                    };
                    xmlhttp.open("GET", apiDataSetURL, true);
                    xmlhttp.send();
                } else {
                    reject(false);
                }
            });
        };

        var allProducts = [];
        var filteredProducts = [];
        var currentPage = 1;
        var itemsPerPage = 25;
        var productCardTemplate;

        const essLinkLanguage = '<xsl:value-of select="$i18n"/>';

        function essGetMenuName(instance) {
            let menuName = null;
            if ((instance != null) &amp;&amp;
                (instance.meta != null) &amp;&amp;
                (instance.meta.menuId != null)) {
                menuName = instance.meta.menuId;
            }
            return menuName;
        }

        Handlebars.registerHelper('essRenderInstanceLink', function (instance, type) {
            if (instance &amp;&amp; instance.name &amp;&amp; instance.id) {
                // Build link directly without relying on meta
                // Use the standard Essential Viewer report link format
                let linkHref = '?XML=reportXML.xml&amp;PMA=' + instance.id + '&amp;cl=' + essLinkLanguage;

                // Determine the context menu class based on type
                let linkClass = 'context-menu-appProviderGenMenu';  // Default for Application_Provider
                if (type === 'Technology_Product') {
                    linkClass = 'context-menu-techProdGenMenu';
                } else if (type === 'Supplier') {
                    linkClass = 'context-menu-suppGenMenu';
                } else if (type === 'Technology_Component') {
                    linkClass = 'context-menu-techCompGenMenu';
                }

                let linkId = instance.id + 'Link';

                // Open applications in new tab to preserve the current view
                let targetAttr = (type === 'Application_Provider' || type === 'Composite_Application_Provider' || type === 'Technology_Product') ? ' target="_blank"' : '';

                let instanceLink = '&lt;a href="' + linkHref + '" class="' + linkClass + '" id="' + linkId + '"' + targetAttr + '&gt;' + instance.name + '&lt;/a&gt;';
                return new Handlebars.SafeString(instanceLink);
            } else if (instance &amp;&amp; instance.name) {
                // Fallback: return plain text name if no ID
                return new Handlebars.SafeString(instance.name);
            }
            return '';
        });

        function renderProducts(products, page) {
            var startIndex = (page - 1) * itemsPerPage;
            var endIndex = startIndex + itemsPerPage;
            var pageProducts = products.slice(startIndex, endIndex);

            var container = $('#productContainer');
            container.empty();

            pageProducts.forEach(function(product) {
                var html = productCardTemplate(product);
                container.append(html);
            });

            renderPagination(products.length, page);
            updateStats(products.length, allProducts.length);
        }

        function renderPagination(totalItems, currentPageNum) {
            var totalPages = Math.ceil(totalItems / itemsPerPage);
            var paginationHtml = '';

            if (totalPages > 1) {
                paginationHtml += '&lt;nav&gt;&lt;ul class="pagination"&gt;';

                // Previous button
                paginationHtml += '&lt;li class="' + (currentPageNum === 1 ? 'disabled' : '') + '"&gt;';
                paginationHtml += '&lt;a href="#" data-page="' + (currentPageNum - 1) + '"&gt;&amp;laquo; Previous&lt;/a&gt;&lt;/li&gt;';

                // Page numbers
                var startPage = Math.max(1, currentPageNum - 2);
                var endPage = Math.min(totalPages, currentPageNum + 2);

                if (startPage > 1) {
                    paginationHtml += '&lt;li&gt;&lt;a href="#" data-page="1"&gt;1&lt;/a&gt;&lt;/li&gt;';
                    if (startPage > 2) {
                        paginationHtml += '&lt;li class="disabled"&gt;&lt;a&gt;...&lt;/a&gt;&lt;/li&gt;';
                    }
                }

                for (var i = startPage; i &lt;= endPage; i++) {
                    paginationHtml += '&lt;li class="' + (i === currentPageNum ? 'active' : '') + '"&gt;';
                    paginationHtml += '&lt;a href="#" data-page="' + i + '"&gt;' + i + '&lt;/a&gt;&lt;/li&gt;';
                }

                if (endPage &lt; totalPages) {
                    if (endPage &lt; totalPages - 1) {
                        paginationHtml += '&lt;li class="disabled"&gt;&lt;a&gt;...&lt;/a&gt;&lt;/li&gt;';
                    }
                    paginationHtml += '&lt;li&gt;&lt;a href="#" data-page="' + totalPages + '"&gt;' + totalPages + '&lt;/a&gt;&lt;/li&gt;';
                }

                // Next button
                paginationHtml += '&lt;li class="' + (currentPageNum === totalPages ? 'disabled' : '') + '"&gt;';
                paginationHtml += '&lt;a href="#" data-page="' + (currentPageNum + 1) + '"&gt;Next &amp;raquo;&lt;/a&gt;&lt;/li&gt;';

                paginationHtml += '&lt;/ul&gt;&lt;/nav&gt;';
            }

            $('#paginationContainer').html(paginationHtml);

            // Attach click handlers
            $('#paginationContainer a').click(function(e) {
                e.preventDefault();
                var page = parseInt($(this).data('page'));
                if (page &gt; 0 &amp;&amp; page &lt;= Math.ceil(filteredProducts.length / itemsPerPage)) {
                    currentPage = page;
                    renderProducts(filteredProducts, currentPage);
                    $('html, body').animate({ scrollTop: 0 }, 'fast');
                }
            });
        }

        function updateStats(current, total) {
            $('#currentCount').text(current);
            $('#totalCount').text(total);
        }

        function toggleApps(titleElement) {
            var $title = $(titleElement);
            var $icon = $title.find('.toggle-icon');
            var $appsList = $title.next('.app-list, .no-apps');

            if ($appsList.is(':visible')) {
                $appsList.slideUp(200);
                $icon.removeClass('expanded');
            } else {
                $appsList.slideDown(200);
                $icon.addClass('expanded');
            }
        }

        function applyFilters() {
            var searchTerm = $('#searchInput').val().toLowerCase();
            var supplierFilter = $('#supplierFilter').val();
            var appFilter = $('#appFilter').val();

            filteredProducts = allProducts.filter(function(product) {
                // Search filter
                var matchesSearch = true;
                if (searchTerm) {
                    matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                  (product.description &amp;&amp; product.description.toLowerCase().includes(searchTerm)) ||
                                  (product.supplier &amp;&amp; product.supplier.toLowerCase().includes(searchTerm)) ||
                                  (product.components &amp;&amp; product.components.some(c => c.name.toLowerCase().includes(searchTerm)));
                }

                // Supplier filter
                var matchesSupplier = (supplierFilter === 'all' || product.supplierId === supplierFilter);

                // Application filter
                var matchesAppFilter = true;
                if (appFilter === 'withApps') {
                    matchesAppFilter = product.appCount > 0;
                } else if (appFilter === 'withoutApps') {
                    matchesAppFilter = product.appCount === 0;
                }

                return matchesSearch &amp;&amp; matchesSupplier &amp;&amp; matchesAppFilter;
            });

            currentPage = 1;
            renderProducts(filteredProducts, currentPage);
        }

        $(document).ready(function() {
            var productCardFragment = $('#product-card-template').html();
            productCardTemplate = Handlebars.compile(productCardFragment);

            Promise.all([
                promise_loadViewerAPIData(viewAPIDataTechProducts),
                promise_loadViewerAPIData(viewAPIDataAppsToTech),
                promise_loadViewerAPIData(viewAPIDataAppMart)
            ]).then(function(responses) {
                console.log('API Response 0 (Tech Products) has meta:', responses[0].meta ? responses[0].meta.length : 'NO META');
                console.log('API Response 1 (Apps to Tech) has meta:', responses[1].meta ? responses[1].meta.length : 'NO META');
                console.log('API Response 2 (App Mart) has meta:', responses[2].meta ? responses[2].meta.length : 'NO META');

                // Use Application Mart API meta as primary source (includes Application_Provider metadata)
                meta = responses[2].meta || responses[0].meta || [];

                // Merge additional meta from Tech Products API if not already present
                if (responses[0].meta &amp;&amp; meta !== responses[0].meta) {
                    responses[0].meta.forEach(function(m) {
                        var exists = meta.some(function(existing) {
                            return JSON.stringify(existing.classes) === JSON.stringify(m.classes);
                        });
                        if (!exists) {
                            meta.push(m);
                        }
                    });
                }

                console.log('Meta loaded, total entries:', meta.length);
                console.log('Meta classes:', meta.map(m => m.classes));

                var techProducts = responses[0].technology_products || [];
                var appsToTech = responses[1];
                var filters = responses[0].filters || [];

                // Helper function to generate color spectrum from red to green
                function getColorForSequence(sequence, minSeq, maxSeq) {
                    // Normalize sequence to 0-1 range
                    var normalized = (sequence - minSeq) / (maxSeq - minSeq);

                    // Create gradient from red (0) to yellow (0.5) to green (1)
                    var r, g, b;
                    if (normalized &lt; 0.5) {
                        // Red to Yellow
                        r = 255;
                        g = Math.round(255 * (normalized * 2));
                        b = 0;
                    } else {
                        // Yellow to Green
                        r = Math.round(255 * (1 - (normalized - 0.5) * 2));
                        g = 255;
                        b = 0;
                    }

                    var bgColor = 'rgb(' + r + ',' + g + ',' + b + ')';
                    var textColor = (normalized &lt; 0.6) ? '#000' : '#fff'; // Dark text for lighter backgrounds

                    return {bg: bgColor, text: textColor};
                }

                // Create color lookup maps from filters
                var lifecycleColors = {};
                var deliveryModels = {};
                var lifecycleSequences = [];

                filters.forEach(function(filter) {
                    if (filter.slotName === 'vendor_product_lifecycle_status') {
                        filter.values.forEach(function(val) {
                            var seq = parseInt(val.sequence) || 0;
                            lifecycleSequences.push(seq);
                            lifecycleColors[val.id] = {
                                sequence: seq
                            };
                        });
                    } else if (filter.slotName === 'technology_provider_delivery_model') {
                        filter.values.forEach(function(val) {
                            deliveryModels[val.id] = {
                                name: val.name || val.id,
                                bg: val.backgroundColor || '#999',
                                text: val.colour || '#fff'
                            };
                        });
                    }
                });

                // Calculate min and max sequences for color gradient
                var minSeq = Math.min.apply(Math, lifecycleSequences);
                var maxSeq = Math.max.apply(Math, lifecycleSequences);

                // Generate colors for each lifecycle status
                Object.keys(lifecycleColors).forEach(function(statusId) {
                    var seq = lifecycleColors[statusId].sequence;
                    var colors = getColorForSequence(seq, minSeq, maxSeq);
                    lifecycleColors[statusId].bg = colors.bg;
                    lifecycleColors[statusId].text = colors.text;
                });

                // Create lookup map for applications by tech product
                var appsByProduct = {};

                // The API returns: application_technology_architecture array
                var appsList = appsToTech.application_technology_architecture || [];

                appsList.forEach(function(app) {
                    // Each app has allTechProds array with productId fields
                    var allTechProds = app.allTechProds || [];

                    allTechProds.forEach(function(techProd) {
                        var prodId = techProd.productId;
                        if (prodId) {
                            if (!appsByProduct[prodId]) {
                                appsByProduct[prodId] = [];
                            }
                            // Check if this app is already in the list for this product
                            var exists = appsByProduct[prodId].some(function(existingApp) {
                                return existingApp.id === app.id;
                            });
                            if (!exists) {
                                appsByProduct[prodId].push({
                                    id: app.id,
                                    name: app.application,
                                    classes: ['Application_Provider']
                                });
                            }
                        }
                    });
                });

                // Build unique supplier list
                var suppliers = new Set();

                // Enrich products with application data and status info
                allProducts = techProducts.map(function(product) {
                    var apps = appsByProduct[product.id] || [];
                    product.applications = apps;
                    product.appCount = apps.length;

                    if (product.supplier) {
                        suppliers.add(JSON.stringify({id: product.supplierId, name: product.supplier}));
                    }

                    if (product.supplierId) {
                        product.supplierObj = {
                            id: product.supplierId,
                            name: product.supplier,
                            className: 'Supplier'
                        };
                    }

                    // Add product family (first one if multiple)
                    if (product.member_of_technology_product_families &amp;&amp; product.member_of_technology_product_families.length > 0) {
                        product.productFamily = product.member_of_technology_product_families[0].name;
                    }

                    // Add lifecycle status with colors
                    if (product.lifecycleStatus) {
                        var statusId = product.status;
                        var statusColors = lifecycleColors[statusId] || {bg: '#999', text: '#fff'};
                        product.lifecycleColor = statusColors.bg;
                        product.lifecycleTextColor = statusColors.text;
                    }

                    // Add delivery model with proper name
                    if (product.delivery) {
                        var deliveryId = product.delivery;
                        var deliveryInfo = deliveryModels[deliveryId];
                        if (deliveryInfo) {
                            product.deliveryModel = deliveryInfo.name;
                            product.deliveryColor = deliveryInfo.bg;
                            product.deliveryTextColor = deliveryInfo.text;
                        } else {
                            product.deliveryModel = deliveryId.replace(/_/g, ' ');
                        }
                    }

                    return product;
                });

                // Sort products by name
                allProducts.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });

                // Populate supplier dropdown
                var supplierArray = Array.from(suppliers).map(s => JSON.parse(s)).sort((a, b) => a.name.localeCompare(b.name));
                supplierArray.forEach(function(supplier) {
                    $('#supplierFilter').append('&lt;option value="' + supplier.id + '"&gt;' + supplier.name + '&lt;/option&gt;');
                });

                // Initial render
                filteredProducts = allProducts;
                renderProducts(filteredProducts, currentPage);

                // Attach filter event handlers
                $('#searchInput').on('keyup', applyFilters);
                $('#supplierFilter').on('change', applyFilters);
                $('#appFilter').on('change', applyFilters);

            }).catch(function(error) {
                console.error('Error loading data:', error);
                $('#productContainer').html('&lt;div class="alert alert-danger"&gt;Error loading data. Please refresh the page.&lt;/div&gt;');
            });
        });
            </script>
        </html>
    </xsl:template>

</xsl:stylesheet>
