#!/usr/bin/env node

/**
 * Simple test script to verify the MCP server can fetch the OpenAPI spec
 */

import fetch from 'node-fetch';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const API_SPEC_PATH = process.env.API_SPEC_PATH || '/docs/api.json';
const SPEC_URL = `${API_BASE_URL}${API_SPEC_PATH}`;

async function testFetch() {
  console.log('Testing API spec fetch...');
  console.log(`URL: ${SPEC_URL}\n`);

  try {
    const response = await fetch(SPEC_URL);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch: ${response.status} ${response.statusText}`);
      process.exit(1);
    }

    const data = await response.json();

    console.log('✅ Successfully fetched OpenAPI spec!');
    console.log(`\nAPI Info:`);
    console.log(`  Title: ${data.info?.title}`);
    console.log(`  Version: ${data.info?.version}`);
    console.log(`  OpenAPI Version: ${data.openapi}`);
    
    const pathCount = Object.keys(data.paths || {}).length;
    console.log(`\nEndpoint Paths: ${pathCount}`);

    const schemas = Object.keys(data.components?.schemas || {});
    console.log(`Schemas: ${schemas.length}`);

    // Count total operations
    let totalOps = 0;
    for (const pathItem of Object.values(data.paths || {})) {
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];
      for (const method of methods) {
        if (pathItem[method]) totalOps++;
      }
    }
    console.log(`Total Operations: ${totalOps}`);

    // Extract tags
    const tags = new Set();
    for (const pathItem of Object.values(data.paths || {})) {
      const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'];
      for (const method of methods) {
        const op = pathItem[method];
        if (op?.tags) {
          op.tags.forEach(tag => tags.add(tag));
        }
      }
    }
    console.log(`\nTags found: ${tags.size}`);
    if (tags.size > 0) {
      console.log(`  ${Array.from(tags).slice(0, 5).join(', ')}${tags.size > 5 ? '...' : ''}`);
    }

    console.log('\n✅ MCP server should work correctly!');
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error('\nMake sure your Laravel API is running at', API_BASE_URL);
    process.exit(1);
  }
}

testFetch();
