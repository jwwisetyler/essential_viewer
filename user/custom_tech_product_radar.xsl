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
    <xsl:include href="../common/core_api_fetcher.xsl"/>

    <xsl:output method="html" omit-xml-declaration="yes" indent="yes"/>

    <!-- Standard parameters -->
    <xsl:param name="param1"/>
    <xsl:param name="viewScopeTermIds"/>

    <!-- Scoping terms -->
    <xsl:variable name="viewScopeTerms" select="eas:get_scoping_terms_from_string($viewScopeTermIds)"/>
    <xsl:variable name="linkClasses" select="('Technology_Product', 'Technology_Product_Family', 'Supplier')"/>

    <!-- Data Set APIs -->
    <xsl:variable name="techProductsAPI" select="$utilitiesAllDataSetAPIs[own_slot_value[slot_reference = 'name']/value = 'Core API: Technology Products and Suppliers']"/>

    <xsl:template match="knowledge_base">
        <xsl:call-template name="docType"/>

        <xsl:variable name="apiTechProducts">
            <xsl:call-template name="GetViewerAPIPath">
                <xsl:with-param name="apiReport" select="$techProductsAPI"/>
            </xsl:call-template>
        </xsl:variable>

        <html>
            <head>
                <xsl:call-template name="commonHeadContent"/>
                <xsl:call-template name="RenderModalReportContent">
                    <xsl:with-param name="essModalClassNames" select="$linkClasses"/>
                </xsl:call-template>

                <!-- Include D3.js v4 -->
                <script type="text/javascript" src="js/d3/d3_4-11/d3.min.js?release=6.19"></script>

                <xsl:for-each select="$linkClasses">
                    <xsl:call-template name="RenderInstanceLinkJavascript">
                        <xsl:with-param name="instanceClassName" select="current()"/>
                        <xsl:with-param name="targetMenu" select="()"/>
                    </xsl:call-template>
                </xsl:for-each>

                <title><xsl:value-of select="eas:i18n('Technology Product Radar')"/></title>
            </head>
            <body>
                <xsl:call-template name="Heading"/>

                <div class="container-fluid">
                    <div class="row">
                        <div class="col-xs-12">
                            <div class="page-header">
                                <h1>
                                    <span class="text-primary"><xsl:value-of select="eas:i18n('View')"/>: </span>
                                    <span class="text-darkgrey">
                                        <xsl:value-of select="eas:i18n('Technology Product Radar')"/>
                                    </span>
                                </h1>
                                <p class="text-muted">
                                    <xsl:value-of select="eas:i18n('Technology products organized by Product Family (sectors) and Lifecycle Status (rings)')"/>
                                </p>
                            </div>
                        </div>

                        <!-- Tabs Navigation -->
                        <div class="col-xs-12">
                            <ul class="nav nav-tabs tech-radar-tabs" id="familyGroupTabs" role="tablist">
                                <!-- Tabs will be dynamically generated -->
                            </ul>
                        </div>

                        <!-- Filters -->
                        <div class="col-xs-12">
                            <div class="tech-radar-filter-section">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <label for="searchInput"><xsl:value-of select="eas:i18n('Search Products')"/>:</label>
                                        <input type="text" id="searchInput" class="form-control" placeholder="Search by product name..."/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="col-xs-12">
                            <div id="statsSection" class="tech-radar-stats-section" style="display: none;">
                                <strong><xsl:value-of select="eas:i18n('Showing')"/>:</strong>
                                <span id="currentCount" class="tech-radar-stats-badge">0</span>
                                <xsl:value-of select="eas:i18n('of')"/>
                                <span id="totalCount" class="tech-radar-stats-badge">0</span>
                                <xsl:value-of select="eas:i18n('products')"/>
                            </div>
                        </div>

                        <!-- Radar Display -->
                        <div class="col-xs-12">
                            <!-- Loading spinner -->
                            <div id="loadingSpinner" class="tech-radar-loading-spinner">
                                <div><i class="fa fa-spinner fa-spin"></i></div>
                                <div><xsl:value-of select="eas:i18n('Loading technology products...')"/></div>
                            </div>
                            <!-- Single shared radar container -->
                            <div id="radarContainer" style="display: none;">
                                <!-- Radar will be rendered here -->
                            </div>
                            <div id="tech-radar-tooltip"></div>
                        </div>
                    </div>
                </div>

                <xsl:call-template name="Footer"/>

                <!-- Initialize global variables for external JavaScript -->
                <script>
                    <![CDATA[
                    var viewAPIDataTechProducts = ']]><xsl:value-of select="$apiTechProducts"/><![CDATA[';
                    ]]>
                </script>

                <!-- Include external JavaScript -->
                <script type="text/javascript" src="user/js/custom_tech_product_radar.js?release=6.19"></script>
            </body>
        </html>
    </xsl:template>

</xsl:stylesheet>
