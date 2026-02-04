/**
 * Technology Product Radar - Custom JavaScript
 * Interactive radar visualization for technology products organized by product family and lifecycle status
 */

// Global variables - will be initialized by XSL template
var viewAPIDataTechProducts;
var essLinkLanguage;

// Colorblind-safe palette with distinct hues
const COLORBLIND_SAFE_COLORS = [
    '#1f77b4', // Blue
    '#ff7f0e', // Orange
    '#2ca02c', // Green
    '#d62728', // Red
    '#9467bd', // Purple
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#bcbd22', // Yellow-green
    '#17becf'  // Cyan
];

var allProducts = [];
var familyGroups = [];
var lifecycleStatuses = [];
var currentGroupIndex = 0;
var lifecycleColors = {};

// Panel state management
var isPanelCollapsed = false;
var currentFilteredProducts = [];
var productIdToDisplayNumber = {};

// Promise-based API loader
function loadViewerAPIData(apiDataSetURL) {
    return new Promise(function (resolve, reject) {
        if (apiDataSetURL != null) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    resolve(JSON.parse(this.responseText));
                }
            };
            xmlhttp.onerror = function () { reject(false); };
            xmlhttp.open("GET", apiDataSetURL, true);
            xmlhttp.send();
        } else {
            reject(false);
        }
    });
}

// Generate gradient color (darker center, lighter outside)
function generateGradientId(baseColor, index) {
    return 'gradient-' + index;
}

function createRadialGradient(svg, baseColor, index) {
    var defs = svg.select('defs');
    if (defs.empty()) {
        defs = svg.append('defs');
    }

    var gradientId = generateGradientId(baseColor, index);

    // Parse hex color
    var r = parseInt(baseColor.slice(1, 3), 16);
    var g = parseInt(baseColor.slice(3, 5), 16);
    var b = parseInt(baseColor.slice(5, 7), 16);

    // Create lighter version (outer) and darker version (inner)
    var lighterColor = 'rgb(' +
        Math.min(255, r + 60) + ',' +
        Math.min(255, g + 60) + ',' +
        Math.min(255, b + 60) + ')';
    var darkerColor = 'rgb(' +
        Math.max(0, r - 40) + ',' +
        Math.max(0, g - 40) + ',' +
        Math.max(0, b - 40) + ')';

    var gradient = defs.append('radialGradient')
        .attr('id', gradientId);

    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', darkerColor)
        .attr('stop-opacity', 0.3);

    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', lighterColor)
        .attr('stop-opacity', 0.2);

    return gradientId;
}

// Generate color spectrum for lifecycle (red to green)
function getColorForSequence(sequence, minSeq, maxSeq) {
    if (minSeq === maxSeq) {
        return {bg: '#93c47d', text: '#000'};
    }

    var normalized = (sequence - minSeq) / (maxSeq - minSeq);
    var r, g, b;

    if (normalized < 0.5) {
        r = 255;
        g = Math.round(255 * (normalized * 2));
        b = 0;
    } else {
        r = Math.round(255 * (1 - (normalized - 0.5) * 2));
        g = 255;
        b = 0;
    }

    var bgColor = 'rgb(' + r + ',' + g + ',' + b + ')';
    var textColor = (normalized < 0.6) ? '#000' : '#fff';

    return {bg: bgColor, text: textColor};
}

// Tooltip functions
function showTooltip(blipData, event, position) {
    var tooltip = $('#tech-radar-tooltip');
    var html = '<div class="tech-radar-tooltip-title">' + blipData.label + '</div>';

    if (blipData.supplier) {
        html += '<div class="tech-radar-tooltip-detail"><span class="tech-radar-tooltip-label">Supplier:</span> ' + blipData.supplier + '</div>';
    }
    if (blipData.familyName) {
        html += '<div class="tech-radar-tooltip-detail"><span class="tech-radar-tooltip-label">Product Family:</span> ' + blipData.familyName + '</div>';
    }
    if (blipData.lifecycleName) {
        html += '<div class="tech-radar-tooltip-detail"><span class="tech-radar-tooltip-label">Status:</span> ' + blipData.lifecycleName + '</div>';
    }

    tooltip.html(html).addClass('visible');

    var tooltipWidth = tooltip.outerWidth();
    var tooltipHeight = tooltip.outerHeight();

    // Determine if item is in top or bottom half of radar (position.y is relative to center)
    var isTopHalf = position.y < 0;

    // Calculate offset - closer to target (8px instead of 15px)
    var verticalOffset = 8;

    // Position tooltip: below item in top half, above item in bottom half
    var topPos;
    if (isTopHalf) {
        // Top half: show tooltip below the item
        topPos = (event.pageY / 2) + verticalOffset;
    } else {
        // Bottom half: show tooltip above the item
        topPos = (event.pageY / 2) - tooltipHeight - verticalOffset;
    }

    tooltip.css({
        left: (event.pageX - tooltipWidth / 2) + 'px',
        top: topPos + 'px'
    });
}

function hideTooltip() {
    $('#tech-radar-tooltip').removeClass('visible');
}

// Vanilla JS Radar Implementation
class TechRadar {
    constructor(containerId, config) {
        this.containerId = containerId;
        this.radius = config.radius || 350;
        this.centerX = 0;
        this.centerY = 0;
        this.itemMargin = 8;
        this.ringBase = 1.6;
        this.items = [];
        this.sectors = [];
        this.rings = [];
    }

    setData(items, sectors, rings) {
        this.items = items;
        this.sectors = sectors;
        this.rings = rings;
    }

    calculateRingRadius(ringIndex) {
        var max = Math.pow(this.ringBase, this.rings.length);
        return (max - Math.pow(this.ringBase, ringIndex)) / max * this.radius;
    }

    polarToCartesian(radius, angleRadians) {
        return {
            x: this.centerX + (radius * Math.cos(angleRadians)),
            y: this.centerY + (radius * Math.sin(angleRadians))
        };
    }

    createPieSlicePath(radius, startAngle, angleSpan) {
        var longArcFlag = angleSpan > Math.PI ? 1 : 0;
        var start = this.polarToCartesian(radius, startAngle);
        var end = this.polarToCartesian(radius, startAngle + angleSpan);

        return 'M' + this.centerX.toFixed(2) + ',' + this.centerY.toFixed(2) + ' ' +
               'L' + start.x.toFixed(2) + ',' + start.y.toFixed(2) + ' ' +
               'A' + radius.toFixed(2) + ',' + radius.toFixed(2) + ' 0 ' + longArcFlag + ',1 ' +
               end.x.toFixed(2) + ',' + end.y.toFixed(2) + ' z';
    }

    generateRandomPosition(innerRadius, outerRadius, startAngle, angleSpan) {
        var minRadius = innerRadius + this.itemMargin;
        var maxRadius = outerRadius - this.itemMargin;
        var minAngle = startAngle + (angleSpan * 0.05);
        var maxAngle = startAngle + (angleSpan * 0.95);

        var radius = minRadius + Math.random() * (maxRadius - minRadius);
        var angle = minAngle + Math.random() * (maxAngle - minAngle);

        return this.polarToCartesian(radius, angle);
    }

    render() {
        var container = document.getElementById(this.containerId);
        container.innerHTML = '';

        // Create SVG with expanded viewBox for curved labels
        var svg = d3.select('#' + this.containerId)
            .append('svg')
            .attr('id', 'tech-radar')
            .attr('viewBox', (-this.radius * 1.3) + ' ' + (-this.radius * 1.3) + ' ' +
                  (this.radius * 2.6) + ' ' + (this.radius * 2.6))
            .attr('width', '100%');

        // Create defs for gradients
        svg.append('defs');

        // Calculate angles
        var sliceAngle = (2 * Math.PI) / this.sectors.length;
        var startAngle = -(Math.PI / 2);

        // Create gradients for each sector
        this.sectors.forEach(function(sector, idx) {
            var baseColor = COLORBLIND_SAFE_COLORS[idx % COLORBLIND_SAFE_COLORS.length];
            createRadialGradient(svg, baseColor, idx);
        });

        var self = this;

        // Render rings and sectors
        this.rings.forEach(function(ring, ringIndex) {
            var outerRadius = self.calculateRingRadius(ringIndex);
            var innerRadius = self.calculateRingRadius(ringIndex + 1);

            // Position ring label at midpoint of ring space
            var midRadius = (outerRadius + innerRadius) / 2;
            var labelY = -midRadius;

            // Ring label centered in ring space
            svg.append('text')
                .attr('class', 'tech-radar-ring-label')
                .attr('x', 5)
                .attr('y', labelY)
                .text(ring.name);

            var currentAngle = startAngle;

            self.sectors.forEach(function(sector, sectorIndex) {
                var baseColor = COLORBLIND_SAFE_COLORS[sectorIndex % COLORBLIND_SAFE_COLORS.length];
                var gradientId = generateGradientId(baseColor, sectorIndex);

                // Create sector path
                var pathData = self.createPieSlicePath(outerRadius, currentAngle, sliceAngle);

                var sectorPath = svg.append('path')
                    .attr('class', 'tech-radar-sector-path')
                    .attr('d', pathData)
                    .attr('fill', 'url(#' + gradientId + ')')
                    .attr('stroke', baseColor)
                    .attr('data-sector', sector.id)
                    .attr('data-ring', ringIndex);

                // Add hover effect for glow
                sectorPath.on('mouseenter', function() {
                    d3.select(this).classed('glow', true);
                }).on('mouseleave', function() {
                    d3.select(this).classed('glow', false);
                });

                currentAngle += sliceAngle;
            });
        });

        // Add sector labels outside the rings with curved text paths
        var currentAngle = startAngle;
        var labelArcRadius = self.radius * 1.02; // Position outside the radar

        this.sectors.forEach(function(sector, sectorIndex) {
            var midAngle = currentAngle + (sliceAngle / 2);

            // Create a unique ID for the curved path
            var pathId = 'sectorPath' + sectorIndex;

            // Calculate start and end angles for the label arc
            var labelAngleStart = midAngle - (sliceAngle * 0.3); // 30% of slice width
            var labelAngleEnd = midAngle + (sliceAngle * 0.3);

            // Normalize angle to 0-360 range for easier comparison
            var normalizedMidAngle = midAngle * 180 / Math.PI;
            while (normalizedMidAngle < 0) normalizedMidAngle += 360;
            while (normalizedMidAngle >= 360) normalizedMidAngle -= 360;

            // Determine if we need to reverse the path for readability
            // Bottom half (180-360 degrees) should be reversed so text reads outward
            var isBottomHalf = normalizedMidAngle > 180 && normalizedMidAngle < 360;

            // Create arc path for text to follow
            var pathStart = self.polarToCartesian(labelArcRadius, labelAngleStart);
            var pathEnd = self.polarToCartesian(labelArcRadius, labelAngleEnd);

            var pathData;
            if (!isBottomHalf) {
                // Reverse arc for bottom half (text reads from end to start)
                pathData = 'M' + pathEnd.x.toFixed(2) + ',' + pathEnd.y.toFixed(2) + ' ' +
                          'A' + labelArcRadius.toFixed(2) + ',' + labelArcRadius.toFixed(2) +
                          ' 0 0,0 ' + pathStart.x.toFixed(2) + ',' + pathStart.y.toFixed(2);
            } else {
                // Normal arc for top half
                pathData = 'M' + pathStart.x.toFixed(2) + ',' + pathStart.y.toFixed(2) + ' ' +
                          'A' + labelArcRadius.toFixed(2) + ',' + labelArcRadius.toFixed(2) +
                          ' 0 0,1 ' + pathEnd.x.toFixed(2) + ',' + pathEnd.y.toFixed(2);
            }

            // Add the path to defs (invisible)
            svg.select('defs')
                .append('path')
                .attr('id', pathId)
                .attr('d', pathData)
                .attr('fill', 'none');

            // Add text that follows the path
            var textPath = svg.append('text')
                .attr('class', 'tech-radar-sector-label')
                .append('textPath')
                .attr('xlink:href', '#' + pathId)
                .attr('startOffset', '50%')
                .attr('text-anchor', 'middle')
                .text(sector.name);

            currentAngle += sliceAngle;
        });

        // Position and render items
        var itemPositions = [];

        this.items.forEach(function(item) {
            var sectorIndex = self.sectors.findIndex(function(s) { return s.id === item.familyId; });
            var ringIndex = item.ring;

            if (sectorIndex === -1 || ringIndex === undefined) return;

            var outerRadius = self.calculateRingRadius(ringIndex);
            var innerRadius = self.calculateRingRadius(ringIndex + 1);
            var sectorStartAngle = startAngle + (sectorIndex * sliceAngle);

            var position = self.generateRandomPosition(innerRadius, outerRadius, sectorStartAngle, sliceAngle);
            itemPositions.push({item: item, position: position});
        });

        // Render item blips
        itemPositions.forEach(function(itemPos) {
            var group = svg.append('g')
                .attr('class', 'tech-radar-blip')
                .attr('data-product-id', itemPos.item.productId);

            // Draw outer circle (white border for contrast)
            group.append('circle')
                .attr('cx', itemPos.position.x)
                .attr('cy', itemPos.position.y)
                .attr('r', 10)
                .attr('fill', '#fff')
                .attr('stroke', '#333')
                .attr('stroke-width', 0.5)
                .attr('opacity', 0.9);

            // Draw inner circle (lifecycle color)
            group.append('circle')
                .attr('cx', itemPos.position.x)
                .attr('cy', itemPos.position.y)
                .attr('r', 8)
                .attr('fill', itemPos.item.color || '#40528f')
                .attr('opacity', 0.85);

            // Add number label with white text shadow for contrast
            group.append('text')
                .attr('class', 'tech-radar-point-text')
                .attr('x', itemPos.position.x)
                .attr('y', itemPos.position.y + 4)
                .attr('stroke', '#fff')
                .attr('stroke-width', 3)
                .attr('paint-order', 'stroke')
                .text(itemPos.item.id);

            // Event handlers
            group.on('mouseover', function() {
                showTooltip(itemPos.item, d3.event, itemPos.position);
            }).on('mouseout', function() {
                hideTooltip();
            });
        });
    }
}

// Render product list grouped by ring (lifecycle status)
function renderProductList() {
    var searchTerm = $('#searchInput').val().toLowerCase();
    var currentGroup = familyGroups[currentGroupIndex];
    var familyIds = currentGroup.families.map(function(f) { return f.id; });

    // Filter products for current view
    var visibleProducts = allProducts.filter(function(product) {
        var inGroup = product.families.some(function(f) { return familyIds.indexOf(f.id) !== -1; });
        if (!inGroup) return false;

        // Search in both name and description
        if (searchTerm) {
            var nameMatch = product.name.toLowerCase().includes(searchTerm);
            var descMatch = product.description.toLowerCase().includes(searchTerm);
            if (!nameMatch && !descMatch) return false;
        }

        return true;
    });

    currentFilteredProducts = visibleProducts;

    // Group by ring
    var productsByRing = {};
    lifecycleStatuses.slice(0, 4).forEach(function(status, ringIndex) {
        productsByRing[ringIndex] = [];
    });

    visibleProducts.forEach(function(product) {
        if (!productsByRing[product.ring]) productsByRing[product.ring] = [];
        productsByRing[product.ring].push(product);
    });

    // Sort alphabetically within rings
    Object.keys(productsByRing).forEach(function(ringIndex) {
        productsByRing[ringIndex].sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
    });

    // Build HTML for product list
    var listHtml = '';
    var hiddenLinksHtml = '';

    lifecycleStatuses.slice(0, 4).forEach(function(status, ringIndex) {
        var ringProducts = productsByRing[ringIndex] || [];
        if (ringProducts.length === 0) return;

        var ringName = status.name || 'Ring ' + ringIndex;

        listHtml += '<div class="tech-radar-ring-section">';
        listHtml += '<div class="tech-radar-ring-heading" data-ring-index="' + ringIndex + '">';
        listHtml += '<i class="fa fa-chevron-down"></i> ';
        listHtml += ringName;
        listHtml += ' <span class="tech-radar-ring-count">(' + ringProducts.length + ')</span>';
        listHtml += '</div>';
        listHtml += '<ul class="tech-radar-product-list" data-ring-index="' + ringIndex + '">';

        ringProducts.forEach(function(product) {
            var linkHref = '?XML=reportXML.xml&PMA=' + product.productId + '&cl=' + essLinkLanguage;

            // Get the display number from the mapping (same as radar)
            var displayNumber = productIdToDisplayNumber[product.productId] || '?';

            // Apply colors from radar: family/sector color as background, lifecycle color as left border
            var lifecycleColor = product.color || '#efafa9';
            var familyColor = product.familyColor || '#cccccc';

            // List item link (visible)
            listHtml += '<li>';
            listHtml += '<a href="' + linkHref + '" ';
            listHtml += 'class="context-menu-techProdGenMenu tech-radar-product-item" ';
            listHtml += 'data-product-id="' + product.productId + '" ';
            listHtml += 'style="background-color: ' + familyColor + '; border-left: 4px solid ' + lifecycleColor + ';" ';
            listHtml += 'target="_blank">';
            listHtml += '<span class="tech-radar-product-item-number">' + displayNumber + '</span>';
            listHtml += '<span class="tech-radar-product-item-name">' + product.name + '</span>';
            listHtml += '</a>';
            listHtml += '</li>';

            // Hidden link for radar blips
            hiddenLinksHtml += '<a href="' + linkHref + '" ';
            hiddenLinksHtml += 'id="hiddenLink_' + product.productId + '" ';
            hiddenLinksHtml += 'class="context-menu-techProdGenMenu" ';
            hiddenLinksHtml += 'target="_blank">';
            hiddenLinksHtml += product.name;
            hiddenLinksHtml += '</a>';
        });

        listHtml += '</ul>';
        listHtml += '</div>';
    });

    // Update DOM
    $('#productListContent').html(listHtml);
    $('#hiddenProductLinks').html(hiddenLinksHtml);

    // Attach collapse handlers
    $('.tech-radar-ring-heading').off('click').on('click', function() {
        var ringIndex = $(this).data('ring-index');
        var list = $('.tech-radar-product-list[data-ring-index="' + ringIndex + '"]');
        var icon = $(this).find('i');

        list.slideToggle(200);
        icon.toggleClass('fa-chevron-down fa-chevron-right');
    });
}

// Toggle panel collapse
function setupPanelToggle() {
    $('#togglePanelBtn').off('click').on('click', function(e) {
        e.preventDefault();

        isPanelCollapsed = !isPanelCollapsed;

        if (isPanelCollapsed) {
            $('#productListPanel').addClass('collapsed');
            $('#radarColumn').removeClass('col-md-9').addClass('col-md-12');
            $('.tech-radar-toggle-icon').addClass('rotated');
        } else {
            $('#productListPanel').removeClass('collapsed');
            $('#radarColumn').removeClass('col-md-12').addClass('col-md-9');
            $('.tech-radar-toggle-icon').removeClass('rotated');
        }
    });
}

// Handle clicks on radar blips - delegate to hidden HTML links
function setupBlipClickHandlers() {
    // Handle both left and right-click on radar blips
    $(document).off('click.radarBlip contextmenu.radarBlip', '.tech-radar-blip');

    $(document).on('click.radarBlip contextmenu.radarBlip', '.tech-radar-blip', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // Get product ID from blip
        var productId = $(this).attr('data-product-id');

        // Find corresponding hidden link
        var hiddenLink = $('#hiddenLink_' + productId);

        if (hiddenLink.length > 0) {
            // Trigger right-click on the hidden link to show context menu
            var evt = $.Event('contextmenu');
            evt.pageX = e.pageX;
            evt.pageY = e.pageY;
            hiddenLink.trigger(evt);
        }

        return false;
    });
}

// Group families into tabs with alphabetical ranges
function createFamilyGroups(families) {
    var groups = [];
    var optimalGroupSize = 6; // Target 6, but vary between 4-8 for clean ranges
    var totalFamilies = families.length;

    // Calculate optimal distribution
    var numGroups = Math.ceil(totalFamilies / optimalGroupSize);
    var baseSize = Math.floor(totalFamilies / numGroups);
    var remainder = totalFamilies % numGroups;

    var startIdx = 0;
    for (var g = 0; g < numGroups; g++) {
        // Distribute remainder across first groups to keep sizes between 4-8
        var groupSize = baseSize + (g < remainder ? 1 : 0);

        // Ensure group size is between 4 and 8
        if (groupSize < 4 && startIdx + 4 <= totalFamilies) {
            groupSize = 4;
        } else if (groupSize > 8) {
            groupSize = 8;
        }

        var endIdx = Math.min(startIdx + groupSize, totalFamilies);
        var groupFamilies = families.slice(startIdx, endIdx);

        if (groupFamilies.length === 0) break;

        // Create alphabetical range name
        var firstName = groupFamilies[0].name;
        var lastName = groupFamilies[groupFamilies.length - 1].name;

        // Get first letter of first and last names
        var firstLetter = firstName.charAt(0).toUpperCase();
        var lastLetter = lastName.charAt(0).toUpperCase();

        var groupName;
        if (firstLetter === lastLetter) {
            // Same letter: "A (Applications, Analytics, ...)"
            groupName = firstLetter;
        } else {
            // Range: "A - C"
            groupName = firstLetter + ' - ' + lastLetter;
        }

        groups.push({
            name: groupName,
            families: groupFamilies,
            index: groups.length
        });

        startIdx = endIdx;
    }

    return groups;
}

// Render tabs with optional search filtering
function renderTabs(searchTerm) {
    searchTerm = searchTerm || '';
    var tabsHtml = '';
    var visibleGroups = [];
    var firstVisibleIndex = -1;

    familyGroups.forEach(function(group, idx) {
        // Check if this group has any products matching the search
        var hasMatchingProducts = false;
        if (searchTerm) {
            var familyIds = group.families.map(function(f) { return f.id; });
            hasMatchingProducts = allProducts.some(function(product) {
                var inGroup = product.families.some(function(f) { return familyIds.indexOf(f.id) !== -1; });
                var matchesSearch = product.name.toLowerCase().includes(searchTerm);
                return inGroup && matchesSearch;
            });
        } else {
            hasMatchingProducts = true; // Show all tabs when no search term
        }

        if (hasMatchingProducts) {
            visibleGroups.push(idx);
            if (firstVisibleIndex === -1) {
                firstVisibleIndex = idx;
            }
            var activeClass = (idx === currentGroupIndex || (currentGroupIndex === -1 && idx === firstVisibleIndex)) ? 'active' : '';
            tabsHtml += '<li role="presentation" class="' + activeClass + '">' +
                '<a href="#group' + idx + '" role="tab" data-toggle="tab" data-group-index="' + idx + '">' +
                group.name + ' (' + group.families.length + ')' +
                '</a></li>';
        }
    });

    // If current tab is no longer visible, switch to first visible tab
    if (visibleGroups.indexOf(currentGroupIndex) === -1 && firstVisibleIndex !== -1) {
        currentGroupIndex = firstVisibleIndex;
    }

    $('#familyGroupTabs').html(tabsHtml);

    // Attach tab change handler
    $('#familyGroupTabs a[data-toggle="tab"]').off('shown.bs.tab').on('shown.bs.tab', function(e) {
        var groupIndex = parseInt($(e.target).data('group-index'));
        currentGroupIndex = groupIndex;
        renderCurrentGroupRadar();
    });
}

// Render radar for current group
function renderCurrentGroupRadar() {
    var currentGroup = familyGroups[currentGroupIndex];
    var searchTerm = $('#searchInput').val().toLowerCase();

    // Show all families in current group
    var visibleFamilies = currentGroup.families;

    // Get family IDs in current group
    var familyIds = visibleFamilies.map(function(f) { return f.id; });

    // Filter products
    var filteredProducts = allProducts.filter(function(product) {
        // Must be in visible families
        var inGroup = product.families.some(function(f) { return familyIds.indexOf(f.id) !== -1; });
        if (!inGroup) return false;

        // Apply search in both name and description
        if (searchTerm) {
            var nameMatch = product.name.toLowerCase().includes(searchTerm);
            var descMatch = product.description.toLowerCase().includes(searchTerm);
            if (!nameMatch && !descMatch) return false;
        }

        return true;
    });

    // Update stats
    $('#currentCount').text(filteredProducts.length);
    $('#statsSection').show();

    console.log('Rendering radar for tab', currentGroupIndex, 'with', visibleFamilies.length, 'families');

    // Use single shared radar container
    var radarContainerId = 'sharedRadarContainer';
    var radarContainer = $('#' + radarContainerId);

    // Create container if it doesn't exist
    if (radarContainer.length === 0) {
        $('#radarContainer').html('<div class="tech-radar-container" id="' + radarContainerId + '"></div>');
        radarContainer = $('#' + radarContainerId);
    }

    // Create radar items and build productId to display number mapping
    var radarItems = [];
    var itemId = 1;
    productIdToDisplayNumber = {}; // Reset mapping

    filteredProducts.forEach(function(product) {
        product.families.forEach(function(family) {
            if (familyIds.indexOf(family.id) === -1) return;

            var displayId = itemId++;

            // Store the first display number for this product
            if (!productIdToDisplayNumber[product.productId]) {
                productIdToDisplayNumber[product.productId] = displayId;
            }

            radarItems.push({
                id: displayId,
                label: product.name,
                familyId: family.id,
                familyName: family.name,
                ring: product.ring,
                productId: product.id,
                supplier: product.supplier,
                lifecycleName: product.lifecycleName,
                color: product.color
            });
        });
    });

    console.log('Rendering', radarItems.length, 'items');

    // Render radar with only visible families
    var radar = new TechRadar(radarContainerId, {
        radius: 350
    });

    radar.setData(radarItems, visibleFamilies, lifecycleStatuses.slice(0, 4));
    radar.render();

    // Setup blip click handlers after SVG is rendered
    setTimeout(function() {
        setupBlipClickHandlers();
    }, 100);

    // Update product list
    renderProductList();
}

// Initialize
$(document).ready(function() {
    loadViewerAPIData(viewAPIDataTechProducts)
    .then(function(response) {
        console.log('Tech Products API loaded successfully');

        var techProducts = response.technology_products || [];
        var filters = response.filters || [];

        // Process lifecycle colors and statuses
        var lifecycleSequences = [];
        var lifecycleNames = {};

        filters.forEach(function(filter) {
            if (filter.slotName === 'vendor_product_lifecycle_status') {
                filter.values.forEach(function(val) {
                    var seq = parseInt(val.sequence) || 0;
                    lifecycleSequences.push(seq);
                    lifecycleColors[val.id] = { sequence: seq };
                    lifecycleNames[val.id] = val.name || val.id;
                    lifecycleStatuses.push({
                        id: val.id,
                        name: val.name || val.id,
                        sequence: seq
                    });
                });
            }
        });

        lifecycleStatuses.sort(function(a, b) { return a.sequence - b.sequence; });

        // Calculate color gradient
        var minSeq = Math.min.apply(Math, lifecycleSequences);
        var maxSeq = Math.max.apply(Math, lifecycleSequences);

        Object.keys(lifecycleColors).forEach(function(statusId) {
            var seq = lifecycleColors[statusId].sequence;
            var colors = getColorForSequence(seq, minSeq, maxSeq);
            lifecycleColors[statusId].bg = colors.bg;
        });

        // Build product families map
        var familyMap = new Map();

        techProducts.forEach(function(product) {
            var families = product.member_of_technology_product_families || [];
            families.forEach(function(family) {
                if (family.id && family.name) {
                    familyMap.set(family.id, family);
                }
            });
        });

        var allFamilies = Array.from(familyMap.values());
        allFamilies.sort(function(a, b) { return a.name.localeCompare(b.name); });

        // Create family groups for tabs
        familyGroups = createFamilyGroups(allFamilies);

        // Create family-to-color mapping using the colorblind-safe palette
        var familyColors = {};
        allFamilies.forEach(function(family, index) {
            familyColors[family.id] = COLORBLIND_SAFE_COLORS[index % COLORBLIND_SAFE_COLORS.length];
        });

        // Process products
        techProducts.forEach(function(product) {
            var families = product.member_of_technology_product_families || [];
            var lifecycleId = product.status;
            var ring = 3;

            if (lifecycleId && lifecycleStatuses.length > 0) {
                var statusIndex = lifecycleStatuses.findIndex(function(s) { return s.id === lifecycleId; });
                if (statusIndex !== -1) {
                    ring = Math.min(3, Math.floor(statusIndex / Math.max(1, lifecycleStatuses.length / 4)));
                }
            }

            var statusColors = lifecycleColors[lifecycleId] || {bg: '#efafa9'};

            // Get the first family's color (products can have multiple families)
            var primaryFamilyColor = '#cccccc'; // default gray
            if (families.length > 0 && families[0].id) {
                primaryFamilyColor = familyColors[families[0].id] || '#cccccc';
            }

            allProducts.push({
                id: product.id,
                productId: product.id,  // Explicit productId for clarity
                name: product.name,
                description: product.description || '',
                families: families,
                ring: ring,
                lifecycleId: lifecycleId,
                lifecycleName: lifecycleNames[lifecycleId] || 'Unknown',
                supplier: product.supplier,
                color: statusColors.bg,  // Lifecycle/ring color
                familyColor: primaryFamilyColor  // Sector color
            });
        });

        $('#totalCount').text(techProducts.length);

        // Render tabs and initial radar
        renderTabs();
        renderCurrentGroupRadar();

        // Attach filter handler
        $('#searchInput').on('keyup', function() {
            var searchTerm = $(this).val().toLowerCase();
            renderTabs(searchTerm);
            renderCurrentGroupRadar();
        });

        // Hide loading, show radar container
        $('#loadingSpinner').hide();
        $('#radarContainer').show();

        // Setup panel toggle
        setupPanelToggle();

        console.log('Radar rendered with ' + allProducts.length + ' products across ' +
                  familyGroups.length + ' tabs');

    }).catch(function(error) {
        console.error('Error loading data:', error);
        $('#loadingSpinner').html('<div class="alert alert-danger">Error loading data. Please refresh the page.</div>');
    });
});
