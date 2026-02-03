# Tech Product Radar Enhancement Plan

## Overview

Enhance the existing tech product radar (`user/custom_tech_product_radar.xsl`) with:
1. **Collapsible side panel** displaying products grouped by lifecycle status rings
2. **Standard Essential context menu** on radar blips using `RenderInstanceLinkJavascript` pattern
3. **Navigation opens in new tab** to preserve the radar view context
4. **Synchronized filtering** - product list updates with search and tab changes

## User Requirements (Updated)

- Use **standard Essential context menu** (not custom implementation)
- Context menu navigation should **open in new tab** (not replace current page)
- Plan saved in `user/plans/` folder

## Current Implementation

- **Radar**: Custom D3.js v4 visualization with 4 lifecycle rings and product family sectors
- **Data**: Products loaded with properties (id, name, familyId, ring, lifecycleId, lifecycleName, color, supplier)
- **Structure**: Tab-based navigation for product families, search filtering, hover tooltips
- **Context Menu**: Already registered for Technology_Product class via `RenderInstanceLinkJavascript` (line 50)

## Technical Approach: Standard Essential Context Menu Pattern

Essential's context menu system works by:
1. **Registering classes** with `RenderInstanceLinkJavascript` (already done for Technology_Product)
2. **Creating HTML links** with class `context-menu-techProdGenMenu`
3. **Framework handles** right-click menu, navigation, and modal previews automatically

**Challenge**: Radar uses SVG elements (circles/groups), not HTML links.

**Solution**: Create hidden HTML links that correspond to each blip, then trigger clicks on those links when blips are clicked.

**Example from tech_product_app_browser.xsl (line 399)**:
```xml
<a href="?XML=reportXML.xml&PMA={instance.id}&cl={language}"
   class="context-menu-techProdGenMenu"
   target="_blank">
    {product name}
</a>
```

## Critical Files to Modify

### 1. `user/custom.css` (CSS Styles)
Add ~200 lines of styles for side panel, product list, and responsive layout

### 2. `user/custom_tech_product_radar.xsl` (XSL Template)
Modify HTML structure to add collapsible side panel (no new library includes needed - context menu already registered)

### 3. `user/js/custom_tech_product_radar.js` (JavaScript - 701 lines)
Add product list rendering, panel toggle, and click delegation to HTML links

## Implementation Steps

### Step 1: Update CSS Styles

**File**: `user/custom.css`
**Location**: Append to end of file (after line 166)

Add styles for:
- **Side Panel Layout**
  - `.tech-radar-side-panel` - Collapsible container (col-md-3, collapses to 60px)
  - `.tech-radar-panel-body` - Scrollable content (max-height: 600px)
  - `.tech-radar-column` - Radar container (col-md-9, expands to col-md-12 when panel collapsed)
  - `.tech-radar-panel-toggle` - Toggle button with rotate animation on chevron icon

- **Product List Styling**
  - `.tech-radar-ring-section` - Container for each ring group
  - `.tech-radar-ring-heading` - Clickable headers with chevron (collapsible sections)
  - `.tech-radar-ring-count` - Badge showing product count per ring
  - `.tech-radar-product-list` - Unordered list of products
  - `.tech-radar-product-item` - List item links with hover effects
  - `.tech-radar-product-item-number` - Circular numbered badges (matching radar blip numbers)

- **Link Styling**
  - Override default link colors for product list items
  - Hover effect: translateX(3px), border-color #5bc0de
  - Remove underline from product names

- **Responsive Design**
  - `@media (max-width: 991px)`: Stack panel above radar
  - Mobile: Single column layout

**Color Scheme**: #5bc0de (Essential blue), #f5f5f5 (background), #e0e0e0 (borders)

---

### Step 2: Update XSL Template

**File**: `user/custom_tech_product_radar.xsl`

#### Change A: Modify Radar Display Section (lines 107-119)

Replace the single-column radar container with a two-column responsive layout:

```xml
<!-- Radar Display with Side Panel -->
<div class="col-xs-12">
    <div class="row">
        <!-- Collapsible Side Panel (col-md-3) -->
        <div id="productListPanel" class="col-md-3 tech-radar-side-panel">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h4 class="panel-title">
                        <a id="togglePanelBtn" class="tech-radar-panel-toggle" href="javascript:void(0);">
                            <i class="fa fa-list"></i>
                            <xsl:value-of select="eas:i18n('Products by Status')"/>
                            <i class="fa fa-chevron-left pull-right tech-radar-toggle-icon"></i>
                        </a>
                    </h4>
                </div>
                <div id="productListContent" class="panel-body tech-radar-panel-body">
                    <!-- Product list populated by JavaScript -->
                </div>
            </div>
        </div>

        <!-- Radar Container (col-md-9) -->
        <div id="radarColumn" class="col-md-9 tech-radar-column">
            <!-- Loading spinner -->
            <div id="loadingSpinner" class="tech-radar-loading-spinner">
                <div><i class="fa fa-spinner fa-spin"></i></div>
                <div><xsl:value-of select="eas:i18n('Loading technology products...')"/></div>
            </div>

            <!-- Radar container -->
            <div id="radarContainer" style="display: none;">
                <!-- Radar will be rendered here -->
            </div>

            <!-- Tooltip -->
            <div id="tech-radar-tooltip"></div>

            <!-- Hidden links for context menu (populated by JavaScript) -->
            <div id="hiddenProductLinks" style="position: absolute; left: -9999px;">
                <!-- Links generated by JavaScript for each product -->
            </div>
        </div>
    </div>
</div>
```

**Key Changes**:
- Bootstrap 3 grid: `col-md-3` (panel) + `col-md-9` (radar) = responsive 12-column layout
- Panel heading uses `eas:i18n()` for internationalization
- Added `#hiddenProductLinks` container for HTML link generation (invisible, used for context menu delegation)
- Existing `#radarContainer` and `#tech-radar-tooltip` preserved

**Note**: No new library includes needed - `RenderInstanceLinkJavascript` already registered on line 50 for Technology_Product class

---

### Step 3: Update JavaScript

**File**: `user/js/custom_tech_product_radar.js`

#### Change A: Add Global Variables (after line 28)
```javascript
var isPanelCollapsed = false;
var currentFilteredProducts = [];
```

#### Change B: Add Product List Rendering Function (after line 407, after TechRadar class)

**Function 1: `renderProductList()`**

**Purpose**: Generate HTML for product list grouped by lifecycle rings

**Logic**:
1. Get current filtered products (based on active tab and search term)
2. Group products by ring index (0-3) using `product.ring` property
3. Sort alphabetically within each ring
4. Build HTML structure:
   - Ring section with collapsible header (ring name + count badge)
   - Product list with anchor tags using Essential's standard pattern
5. Generate hidden links for radar blip context menu delegation
6. Attach collapse handlers to ring headings

**HTML Structure Generated**:
```html
<!-- For product list -->
<div class="tech-radar-ring-section">
    <div class="tech-radar-ring-heading" data-ring-index="0">
        <i class="fa fa-chevron-down"></i>
        Active (15)
        <span class="tech-radar-ring-count">(15)</span>
    </div>
    <ul class="tech-radar-product-list" data-ring-index="0">
        <li>
            <a href="?XML=reportXML.xml&PMA=prod_123&cl=en"
               class="context-menu-techProdGenMenu tech-radar-product-item"
               data-product-id="prod_123"
               target="_blank">
                <span class="tech-radar-product-item-number">1</span>
                <span class="tech-radar-product-item-name">Oracle Database 19c</span>
            </a>
        </li>
        ...
    </ul>
</div>

<!-- For hidden links (used by radar blips) -->
<div id="hiddenProductLinks">
    <a href="?XML=reportXML.xml&PMA=prod_123&cl=en"
       id="hiddenLink_prod_123"
       class="context-menu-techProdGenMenu"
       target="_blank">Oracle Database 19c</a>
    ...
</div>
```

**Key Points**:
- Links use `context-menu-techProdGenMenu` class (registered in XSL with RenderInstanceLinkJavascript)
- `target="_blank"` opens in new tab
- Hidden links have IDs like `hiddenLink_{productId}` for easy lookup
- Use global `essLinkLanguage` variable for language parameter

**Implementation**:
```javascript
function renderProductList() {
    var searchTerm = $('#searchInput').val().toLowerCase();
    var currentGroup = familyGroups[currentGroupIndex];
    var familyIds = currentGroup.families.map(function(f) { return f.id; });

    // Filter products for current view
    var visibleProducts = allProducts.filter(function(product) {
        var inGroup = product.families.some(function(f) { return familyIds.indexOf(f.id) !== -1; });
        if (!inGroup) return false;
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm)) return false;
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

        ringProducts.forEach(function(product, idx) {
            var linkHref = '?XML=reportXML.xml&PMA=' + product.id + '&cl=' + essLinkLanguage;

            // List item link (visible)
            listHtml += '<li>';
            listHtml += '<a href="' + linkHref + '" ';
            listHtml += 'class="context-menu-techProdGenMenu tech-radar-product-item" ';
            listHtml += 'data-product-id="' + product.id + '" ';
            listHtml += 'target="_blank">';
            listHtml += '<span class="tech-radar-product-item-number">' + product.id + '</span>';
            listHtml += '<span class="tech-radar-product-item-name">' + product.name + '</span>';
            listHtml += '</a>';
            listHtml += '</li>';

            // Hidden link for radar blips
            hiddenLinksHtml += '<a href="' + linkHref + '" ';
            hiddenLinksHtml += 'id="hiddenLink_' + product.id + '" ';
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
```

#### Change C: Add Panel Toggle Function (after renderProductList)

**Function 2: `setupPanelToggle()`**

**Purpose**: Handle collapse/expand of side panel

**Implementation**:
```javascript
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
```

#### Change D: Add Blip Click Handler Function (after setupPanelToggle)

**Function 3: `setupBlipClickHandlers()`**

**Purpose**: Delegate clicks on radar blips to hidden HTML links (triggers Essential's context menu)

**Implementation**:
```javascript
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
```

**Rationale**: Essential's context menu framework listens for right-clicks on `.context-menu-techProdGenMenu` elements. By delegating blip clicks to hidden HTML links, we leverage the existing framework without custom menu implementation.

#### Change E: Modify TechRadar.render() Method (around line 405)

**Location**: After creating the group element, before event handlers

**Add**:
```javascript
// Add data-product-id to group for click delegation
group.attr('data-product-id', itemPos.item.id);

// Add class for easier targeting
group.attr('class', 'tech-radar-blip');
```

**Modify existing event handlers** (line 401-405):
```javascript
// Event handlers
group.on('mouseover', function() {
    showTooltip(itemPos.item, d3.event, itemPos.position);
}).on('mouseout', function() {
    hideTooltip();
});
// Note: Click handler now delegated via setupBlipClickHandlers()
```

**Remove** old click handler (if exists) since clicks are now handled by setupBlipClickHandlers()

#### Change F: Update renderCurrentGroupRadar() Function (around line 588)

**Location**: After `radar.render()` call (around line 693)

**Add**:
```javascript
radar.render();

// Setup blip click handlers after SVG is rendered
setTimeout(function() {
    setupBlipClickHandlers();
}, 100);

// Update product list
renderProductList();
```

**Rationale**: 100ms delay ensures SVG DOM is fully rendered before attaching delegated event handlers

#### Change G: Update Document Ready Handler (around line 691)

**Location**: After showing radar container (line 690-691)

**Add**:
```javascript
// Hide loading, show radar
$('#loadingSpinner').hide();
$('#radarContainer').show();

// Setup panel toggle
setupPanelToggle();

console.log('Radar rendered with ' + allProducts.length + ' products across ' + familyGroups.length + ' tabs');
```

#### Change H: Update Search Input Handler (line 683-686)

**No changes needed** - search handler already calls `renderCurrentGroupRadar()`, which now calls `renderProductList()`

---

## Data Structure

**Current Product Object** (line 664-673):
```javascript
{
    id: product.id,              // Essential instance ID (used for blip number AND navigation)
    name: product.name,
    families: families,
    ring: ring,                  // 0-3 (lifecycle ring index)
    lifecycleId: lifecycleId,
    lifecycleName: lifecycleNames[lifecycleId] || 'Unknown',
    supplier: product.supplier,
    color: statusColors.bg       // Lifecycle status color
}
```

**No changes needed** - `product.id` already contains Essential instance ID suitable for PMA parameter

---

## Testing Checklist

### Visual/Layout Tests
- [ ] Side panel appears on page load with products grouped by rings
- [ ] Panel toggle button collapses/expands panel smoothly
- [ ] Radar expands to full width (col-md-12) when panel collapsed
- [ ] Ring sections have chevron icons that rotate when collapsed
- [ ] Products sorted alphabetically within each ring
- [ ] Product count badges show correct numbers
- [ ] Numbered badges match radar blip numbers

### Context Menu Tests (Essential Standard)
- [ ] Left-click on radar blip shows Essential context menu
- [ ] Right-click on radar blip shows Essential context menu
- [ ] Context menu positioned near click location
- [ ] Menu shows standard options for Technology_Product class
- [ ] Context menu on list items works (Essential framework handles this automatically)

### Navigation Tests
- [ ] Clicking menu option opens product summary in **new tab**
- [ ] Original radar view remains open
- [ ] URL includes correct product ID (PMA parameter)
- [ ] Product summary page loads successfully
- [ ] Navigation works from both blip menu and list item menu

### Integration Tests
- [ ] Search filtering updates both radar and product list
- [ ] Product list only shows products in current tab
- [ ] Tab switching updates product list
- [ ] Hidden links regenerated on each render
- [ ] Multiple tab switches don't duplicate handlers

### Responsive Tests
- [ ] Desktop (>991px): Side-by-side layout (col-md-3 + col-md-9)
- [ ] Tablet (768-991px): Panel stacks above radar
- [ ] Mobile (<768px): Single column layout
- [ ] Panel collapse works on all screen sizes

---

## Implementation Order

1. **Create plans folder**: `user/plans/` (manual or via mkdir)
2. **CSS first** (`user/custom.css`) - Non-breaking, establishes visual foundation
3. **XSL template** (`user/custom_tech_product_radar.xsl`) - Add side panel DOM structure, hidden links container
4. **JavaScript** (`user/js/custom_tech_product_radar.js`) - Add 3 new functions, modify 2 existing sections
5. **Test integration** - Verify search, tabs, and filtering work correctly
6. **Test context menu** - Verify Essential's standard context menu appears and navigates correctly in new tabs

---

## Edge Cases Handled

1. **Empty rings**: Only render ring sections that have products
2. **Click delegation timing**: 100ms delay after radar render ensures SVG elements exist
3. **Search synchronization**: Product list uses same filter logic as radar
4. **Mobile responsiveness**: CSS media queries stack panel above radar on small screens
5. **Event handler cleanup**: `off()` before `on()` prevents duplicate handlers
6. **Hidden links regeneration**: Links regenerated on each `renderProductList()` call to stay synchronized

---

## Advantages of Standard Essential Context Menu Approach

✅ **Consistent UX**: Same context menu style/behavior as rest of Essential Viewer
✅ **Less code**: No custom jQuery contextMenu initialization needed
✅ **Automatic features**: Gets modal previews, authorization checks, menu updates for free
✅ **Maintainable**: Updates to Essential's context menu system automatically apply
✅ **New tab navigation**: Simple `target="_blank"` attribute on links
✅ **Type safety**: Framework handles Technology_Product class registration and routing

---

## Success Criteria

✅ Side panel displays products grouped by lifecycle ring
✅ Panel can collapse to save screen space
✅ Both left and right-click on blips show Essential's standard context menu
✅ Context menu navigates to product summary in new tab (preserves radar view)
✅ Product list synchronized with search/tab filtering
✅ Responsive layout works on mobile devices
✅ Uses Essential's standard patterns (RenderInstanceLinkJavascript, context-menu classes)

---

## Files Modified

1. **`user/custom.css`** - Add ~200 lines of styles (append to end)
2. **`user/custom_tech_product_radar.xsl`** - Modify lines 107-119 (add side panel structure and hidden links container)
3. **`user/js/custom_tech_product_radar.js`** - Add 3 new functions (~150 lines), modify 2 sections (~10 lines)

**Total estimated changes**: ~360 lines added/modified across 3 files
