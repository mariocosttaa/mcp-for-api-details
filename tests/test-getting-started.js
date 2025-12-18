#!/usr/bin/env node

/**
 * Test the new getting-started resource
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

console.log('🧪 Testing Getting Started Resource\n');
console.log('='.repeat(60));

async function testGettingStarted() {
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

    // List resources
    console.log('Available Resources:');
    console.log('-'.repeat(60));
    const resources = await client.listResources();
    resources.resources.forEach((r, i) => {
      console.log(`${i + 1}. ${r.name}`);
      console.log(`   URI: ${r.uri}`);
      console.log(`   📝 ${r.description}`);
      console.log();
    });

    // Read getting started guide
    console.log('\nReading Getting Started Guide:');
    console.log('='.repeat(60));
    const guide = await client.readResource({
      uri: 'laravel-api://getting-started',
    });
    console.log(guide.contents[0].text);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Getting Started guide is working!');
    console.log('='.repeat(60));

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGettingStarted();
