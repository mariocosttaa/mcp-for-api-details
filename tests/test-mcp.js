#!/usr/bin/env node

/**
 * Interactive test script for the MCP server
 * This simulates what an MCP client would do
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

console.log('🧪 Testing Laravel API MCP Server\n');
console.log('='.repeat(50));

async function testMCPServer() {
  // Start the MCP server
  const serverProcess = spawn('node', ['dist/index.js'], {
    env: {
      ...process.env,
      API_BASE_URL: 'http://localhost:8000',
      API_SPEC_PATH: '/docs/api.json',
    },
  });

  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    env: {
      API_BASE_URL: 'http://localhost:8000',
      API_SPEC_PATH: '/docs/api.json',
    },
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    console.log('\n📡 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected!\n');

    // Test 1: List Resources
    console.log('Test 1: List Resources');
    console.log('-'.repeat(50));
    const resources = await client.listResources();
    console.log(`Found ${resources.resources.length} resources:`);
    resources.resources.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name}`);
      console.log(`     URI: ${r.uri}`);
      console.log(`     Description: ${r.description}`);
    });

    // Test 2: Read endpoints list
    console.log('\n\nTest 2: Read Endpoints List');
    console.log('-'.repeat(50));
    const endpointsList = await client.readResource({
      uri: 'laravel-api://endpoints-list',
    });
    const endpointsText = endpointsList.contents[0].text;
    const lines = endpointsText.split('\n').slice(0, 30); // First 30 lines
    console.log(lines.join('\n'));
    console.log(`\n... (${endpointsText.split('\n').length - 30} more lines)\n`);

    // Test 3: List Tools
    console.log('\nTest 3: List Tools');
    console.log('-'.repeat(50));
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} tools:`);
    tools.tools.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name}`);
      console.log(`     Description: ${t.description}`);
    });

    // Test 4: Get endpoint details
    console.log('\n\nTest 4: Get Endpoint Details');
    console.log('-'.repeat(50));
    console.log('Querying: POST /business/v1/business-users/login\n');
    const endpointDetails = await client.callTool({
      name: 'get_endpoint_details',
      arguments: {
        method: 'POST',
        path: '/business/v1/business-users/login',
      },
    });
    const detailsText = endpointDetails.content[0].text;
    const detailsLines = detailsText.split('\n').slice(0, 40); // First 40 lines
    console.log(detailsLines.join('\n'));
    console.log(`\n... (${detailsText.split('\n').length - 40} more lines)\n`);

    // Test 5: Search endpoints
    console.log('\nTest 5: Search Endpoints');
    console.log('-'.repeat(50));
    console.log('Searching for: "booking"\n');
    const searchResults = await client.callTool({
      name: 'search_endpoints',
      arguments: {
        query: 'booking',
      },
    });
    const searchText = searchResults.content[0].text;
    const searchLines = searchText.split('\n').slice(0, 25); // First 25 lines
    console.log(searchLines.join('\n'));
    console.log(`\n... (${searchText.split('\n').length - 25} more lines)\n`);

    // Test 6: Get schema details
    console.log('\nTest 6: Get Schema Details');
    console.log('-'.repeat(50));
    console.log('Querying schema: BusinessUserLoginRequest\n');
    const schemaDetails = await client.callTool({
      name: 'get_schema_details',
      arguments: {
        schemaName: 'BusinessUserLoginRequest',
      },
    });
    console.log(schemaDetails.content[0].text);

    console.log('\n\n' + '='.repeat(50));
    console.log('✅ All tests passed successfully!');
    console.log('='.repeat(50));
    console.log('\nThe MCP server is working correctly and ready to use.');
    console.log('Configure it in your IDE to give AI agents access to your API docs.\n');

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Your Laravel API is running (php artisan serve)');
    console.error('  2. The API is accessible at http://localhost:8000');
    console.error('  3. The OpenAPI spec is available at /docs/api.json\n');
    process.exit(1);
  }
}

testMCPServer();
