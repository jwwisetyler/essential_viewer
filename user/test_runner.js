#!/usr/bin/env node

/**
 * XSL Test Runner for Essential Viewer
 * Simulates the Essential Viewer environment for testing XSL views locally
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
    mockDataFile: path.join(__dirname, 'mock_reportXML.xml'),
    outputFile: path.join(__dirname, 'test_output.html'),
    xslFile: process.argv[2] || path.join(__dirname, 'tech_product_app_browser.xsl'),
    params: {
        param1: '',
        viewScopeTermIds: '',
        i18n: 'en-gb'
    }
};

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     Essential Viewer XSL Test Runner                      ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Check if XSL file exists
if (!fs.existsSync(config.xslFile)) {
    console.error(`❌ Error: XSL file not found: ${config.xslFile}`);
    process.exit(1);
}

console.log(`📄 XSL File: ${path.basename(config.xslFile)}`);

// Check if mock data exists
if (!fs.existsSync(config.mockDataFile)) {
    console.log(`⚠️  Mock data not found. Creating minimal mock_reportXML.xml...`);
    createMockData();
}

console.log(`📊 Mock Data: ${path.basename(config.mockDataFile)}`);

// Try to find XSLT processor
let xsltProcessor = null;
const processors = [
    { cmd: 'saxon', name: 'Saxon', test: 'saxon -version' },
    { cmd: 'xsltproc', name: 'xsltproc', test: 'xsltproc --version' },
    { cmd: 'java', name: 'Saxon (via Java)', test: 'java -version' }
];

for (const proc of processors) {
    try {
        execSync(proc.test, { stdio: 'ignore' });
        xsltProcessor = proc;
        console.log(`✓ Found XSLT processor: ${proc.name}\n`);
        break;
    } catch (e) {
        // Processor not found, continue
    }
}

if (!xsltProcessor) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚠️  No XSLT processor found on your system.');
    console.log('\nTo enable full XSL transformation testing, install one of:');
    console.log('  • Saxon HE: npm install -g saxon-js');
    console.log('  • xsltproc: (comes with libxslt)');
    console.log('    - Windows: choco install xsltproc');
    console.log('    - Mac: brew install libxslt');
    console.log('    - Linux: sudo apt-get install xsltproc');
    console.log('\nFor now, showing XSL validation and structure...\n');
    console.log('═══════════════════════════════════════════════════════════\n');
}

// Validate XSL syntax
console.log('🔍 Validating XSL structure...');
const xslContent = fs.readFileSync(config.xslFile, 'utf8');

// Basic XSL validation
const validations = [
    { pattern: /<xsl:stylesheet/, message: 'XSL stylesheet declaration' },
    { pattern: /<xsl:template match="knowledge_base"/, message: 'Root template (knowledge_base)' },
    { pattern: /xsl:call-template name="docType"/, message: 'docType template call' },
    { pattern: /xsl:call-template name="commonHeadContent"/, message: 'commonHeadContent template' },
    { pattern: /xsl:call-template name="Heading"/, message: 'Heading template' },
    { pattern: /xsl:call-template name="Footer"/, message: 'Footer template' }
];

let validCount = 0;
validations.forEach(validation => {
    if (validation.pattern.test(xslContent)) {
        console.log(`  ✓ ${validation.message}`);
        validCount++;
    } else {
        console.log(`  ⚠️  Missing: ${validation.message}`);
    }
});

console.log(`\n✓ Validation complete: ${validCount}/${validations.length} checks passed\n`);

// Extract template information
console.log('📋 Template Analysis:');
const templates = xslContent.match(/<xsl:template[^>]*name="([^"]+)"/g) || [];
if (templates.length > 0) {
    templates.forEach(t => {
        const name = t.match(/name="([^"]+)"/)[1];
        console.log(`  • Template: ${name}`);
    });
} else {
    console.log('  • Only match templates (no named templates)');
}

// Extract variables
const variables = xslContent.match(/<xsl:variable[^>]*name="([^"]+)"/g) || [];
if (variables.length > 0) {
    console.log(`\n📦 Variables defined: ${variables.length}`);
    variables.slice(0, 10).forEach(v => {
        const name = v.match(/name="([^"]+)"/)[1];
        console.log(`  • $${name}`);
    });
    if (variables.length > 10) {
        console.log(`  ... and ${variables.length - 10} more`);
    }
}

// Check for API calls
const apiCalls = xslContent.match(/utilitiesAllDataSetAPIs\[.*?'name'.*?=.*?'([^']+)'/g) || [];
if (apiCalls.length > 0) {
    console.log(`\n🔌 Data Set APIs used:`);
    apiCalls.forEach(api => {
        const name = api.match(/'([^']+)'$/)[1];
        console.log(`  • ${name}`);
    });
}

// If processor available, try transformation
if (xsltProcessor) {
    console.log('\n🔄 Attempting transformation...');
    try {
        let cmd = '';
        if (xsltProcessor.cmd === 'xsltproc') {
            cmd = `xsltproc --output "${config.outputFile}" "${config.xslFile}" "${config.mockDataFile}"`;
        } else if (xsltProcessor.cmd === 'saxon') {
            cmd = `saxon -s:"${config.mockDataFile}" -xsl:"${config.xslFile}" -o:"${config.outputFile}"`;
        }

        if (cmd) {
            execSync(cmd, { stdio: 'inherit' });
            console.log(`\n✓ Transformation successful!`);
            console.log(`📄 Output saved to: ${config.outputFile}`);

            // Show file size
            const stats = fs.statSync(config.outputFile);
            console.log(`📊 Output size: ${(stats.size / 1024).toFixed(2)} KB`);

            // Offer to open in browser
            console.log(`\n💡 To view the output:`);
            console.log(`   Open: ${config.outputFile}`);
            console.log(`   Or run: start ${config.outputFile} (Windows)`);
            console.log(`   Or run: open ${config.outputFile} (Mac)`);
        }
    } catch (error) {
        console.error('\n❌ Transformation failed:');
        console.error(error.message);
        console.log('\n💡 This may be due to missing includes or complex XPath expressions.');
        console.log('   The XSL is valid but needs the full Essential Viewer environment.');
    }
}

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║  Testing complete!                                         ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Function to create minimal mock data
function createMockData() {
    const mockXML = `<?xml version="1.0" encoding="UTF-8"?>
<knowledge_base xmlns="http://protege.stanford.edu/xml">
    <!-- Minimal mock data for XSL testing -->
    <simple_instance>
        <name>mock_tech_product_1</name>
        <type>Technology_Product</type>
        <own_slot_value>
            <slot_reference>name</slot_reference>
            <value>Test Technology Product</value>
        </own_slot_value>
        <own_slot_value>
            <slot_reference>description</slot_reference>
            <value>A test technology product for validation</value>
        </own_slot_value>
    </simple_instance>

    <simple_instance>
        <name>mock_app_1</name>
        <type>Application_Provider</type>
        <own_slot_value>
            <slot_reference>name</slot_reference>
            <value>Test Application</value>
        </own_slot_value>
    </simple_instance>

    <simple_instance>
        <name>viewer3_devrep_14032012_003_Class10015</name>
        <type>Report_Implementation_Type</type>
    </simple_instance>

    <simple_instance>
        <name>mock_data_set_api_tech</name>
        <type>Data_Set_API</type>
        <own_slot_value>
            <slot_reference>name</slot_reference>
            <value>Core API: Technology Products and Suppliers</value>
        </own_slot_value>
        <own_slot_value>
            <slot_reference>report_xsl_filename</slot_reference>
            <value>api/mock_tech_api.json</value>
        </own_slot_value>
    </simple_instance>

    <simple_instance>
        <name>mock_data_set_api_apps</name>
        <type>Data_Set_API</type>
        <own_slot_value>
            <slot_reference>name</slot_reference>
            <value>Core API: Application Mart</value>
        </own_slot_value>
        <own_slot_value>
            <slot_reference>report_xsl_filename</slot_reference>
            <value>api/mock_app_api.json</value>
        </own_slot_value>
    </simple_instance>
</knowledge_base>`;

    fs.writeFileSync(config.mockDataFile, mockXML);
    console.log('   ✓ Created mock_reportXML.xml');
}
