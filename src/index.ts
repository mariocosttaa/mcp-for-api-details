#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import type { OpenAPISpec, EndpointInfo, Operation, PathItem, Schema } from './types.js';

// Configuration
const API_MODE = process.env.API_MODE || 'http'; // 'http' or 'file'
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const API_SPEC_PATH = process.env.API_SPEC_PATH || '/docs/api.json';
const API_SPEC_FILE = process.env.API_SPEC_FILE; // Path to local OpenAPI spec file
const SPEC_URL = `${API_BASE_URL}${API_SPEC_PATH}`;

/**
 * Fetch the OpenAPI specification from the API endpoint or local file
 */
async function fetchOpenAPISpec(): Promise<OpenAPISpec> {
  try {
    if (API_MODE === 'file') {
      // Load from local file
      if (!API_SPEC_FILE) {
        throw new Error('API_SPEC_FILE environment variable is required when API_MODE is "file"');
      }
      
      const filePath = resolve(API_SPEC_FILE);
      const fileContent = await readFile(filePath, 'utf-8');
      return JSON.parse(fileContent) as OpenAPISpec;
    } else {
      // Fetch from HTTP endpoint (default)
      const response = await fetch(SPEC_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch API spec: ${response.status} ${response.statusText}`);
      }
      return await response.json() as OpenAPISpec;
    }
  } catch (error) {
    if (API_MODE === 'file') {
      throw new Error(`Error loading OpenAPI spec from file ${API_SPEC_FILE}: ${error}`);
    } else {
      throw new Error(`Error fetching OpenAPI spec from ${SPEC_URL}: ${error}`);
    }
  }
}

/**
 * Extract all endpoints from the OpenAPI spec
 */
function extractEndpoints(spec: OpenAPISpec): EndpointInfo[] {
  const endpoints: EndpointInfo[] = [];

  for (const [path, pathItem] of Object.entries(spec.paths)) {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;

    for (const method of methods) {
      const operation = pathItem[method];
      if (operation) {
        // Check if security is required (empty array or no security field means public)
        const requiresAuth = operation.security !== undefined 
          ? operation.security.length > 0
          : (spec.security !== undefined && spec.security.length > 0);

        endpoints.push({
          method: method.toUpperCase(),
          path,
          summary: operation.summary,
          description: operation.description,
          tags: operation.tags,
          requiresAuth,
          operationId: operation.operationId,
        });
      }
    }
  }

  return endpoints;
}

/**
 * Get all unique tags from the spec
 */
function extractTags(spec: OpenAPISpec): string[] {
  const tags = new Set<string>();

  for (const pathItem of Object.values(spec.paths)) {
    const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'] as const;

    for (const method of methods) {
      const operation = pathItem[method];
      if (operation?.tags) {
        operation.tags.forEach(tag => tags.add(tag));
      }
    }
  }

  return Array.from(tags).sort();
}

/**
 * Find an operation by method and path
 */
function findOperation(spec: OpenAPISpec, method: string, path: string): Operation | null {
  const pathItem = spec.paths[path];
  if (!pathItem) return null;

  const methodLower = method.toLowerCase() as keyof PathItem;
  return pathItem[methodLower] as Operation || null;
}

/**
 * Resolve a schema reference
 */
function resolveSchemaRef(spec: OpenAPISpec, ref: string): Schema | null {
  // References are in format: #/components/schemas/SchemaName
  const parts = ref.split('/');
  if (parts[0] !== '#' || parts[1] !== 'components' || parts[2] !== 'schemas') {
    return null;
  }

  const schemaName = parts[3];
  return spec.components?.schemas?.[schemaName] as Schema || null;
}

/**
 * Format endpoint details for display
 */
function formatEndpointDetails(operation: Operation, method: string, path: string, spec: OpenAPISpec): string {
  let output = `# ${method.toUpperCase()} ${path}\n\n`;

  if (operation.summary) {
    output += `**Summary:** ${operation.summary}\n\n`;
  }

  if (operation.description) {
    output += `**Description:** ${operation.description}\n\n`;
  }

  if (operation.tags && operation.tags.length > 0) {
    output += `**Tags:** ${operation.tags.join(', ')}\n\n`;
  }

  if (operation.operationId) {
    output += `**Operation ID:** ${operation.operationId}\n\n`;
  }

  // Authentication
  const requiresAuth = operation.security !== undefined 
    ? operation.security.length > 0
    : (spec.security !== undefined && spec.security.length > 0);
  output += `**Authentication Required:** ${requiresAuth ? 'Yes' : 'No'}\n\n`;

  // Parameters
  if (operation.parameters && operation.parameters.length > 0) {
    output += `## Parameters\n\n`;
    for (const param of operation.parameters) {
      output += `- **${param.name}** (${param.in})${param.required ? ' *required*' : ''}\n`;
      if (param.description) {
        output += `  - ${param.description}\n`;
      }
    }
    output += '\n';
  }

  // Request Body
  if (operation.requestBody) {
    output += `## Request Body\n\n`;
    output += `**Required:** ${operation.requestBody.required ? 'Yes' : 'No'}\n\n`;

    for (const [contentType, mediaType] of Object.entries(operation.requestBody.content)) {
      output += `**Content-Type:** ${contentType}\n\n`;
      output += '```json\n';
      output += JSON.stringify(mediaType.schema, null, 2);
      output += '\n```\n\n';
    }
  }

  // Responses
  if (operation.responses) {
    output += `## Responses\n\n`;
    for (const [statusCode, response] of Object.entries(operation.responses)) {
      output += `### ${statusCode}\n\n`;
      
      if ('$ref' in response && response.$ref) {
        output += `Reference: ${response.$ref}\n\n`;
      } else if ('description' in response) {
        output += `${response.description}\n\n`;
        
        if (response.content) {
          for (const [contentType, mediaType] of Object.entries(response.content)) {
            output += `**Content-Type:** ${contentType}\n\n`;
            output += '```json\n';
            output += JSON.stringify(mediaType.schema, null, 2);
            output += '\n```\n\n';
          }
        }
      }
    }
  }

  return output;
}

/**
 * Format endpoints list for display
 */
function formatEndpointsList(endpoints: EndpointInfo[]): string {
  let output = '# API Endpoints\n\n';

  // Group by tags
  const groupedByTag = new Map<string, EndpointInfo[]>();
  
  for (const endpoint of endpoints) {
    const tags = endpoint.tags && endpoint.tags.length > 0 ? endpoint.tags : ['Untagged'];
    
    for (const tag of tags) {
      if (!groupedByTag.has(tag)) {
        groupedByTag.set(tag, []);
      }
      groupedByTag.get(tag)!.push(endpoint);
    }
  }

  // Sort tags
  const sortedTags = Array.from(groupedByTag.keys()).sort();

  for (const tag of sortedTags) {
    output += `## ${tag}\n\n`;
    
    const tagEndpoints = groupedByTag.get(tag)!;
    for (const endpoint of tagEndpoints) {
      const authIcon = endpoint.requiresAuth ? '🔒' : '🔓';
      output += `- ${authIcon} **${endpoint.method}** \`${endpoint.path}\``;
      
      if (endpoint.summary) {
        output += ` - ${endpoint.summary}`;
      }
      
      output += '\n';
    }
    
    output += '\n';
  }

  return output;
}

/**
 * Generate getting started guide
 */
function generateGettingStartedGuide(spec: OpenAPISpec): string {
  const endpoints = extractEndpoints(spec);
  const tags = extractTags(spec);
  const schemaCount = Object.keys(spec.components?.schemas || {}).length;
  const authEndpoints = endpoints.filter(e => e.requiresAuth).length;
  const publicEndpoints = endpoints.filter(e => !e.requiresAuth).length;

  return `# 🚀 Laravel API - MCP Server Guide

Welcome! This MCP server provides access to your Laravel API documentation powered by Scramble.

## 📊 API Statistics

- **Total Endpoints:** ${endpoints.length}
- **Public Endpoints:** ${publicEndpoints} 🔓
- **Protected Endpoints:** ${authEndpoints} 🔒
- **API Tags:** ${tags.length}
- **Data Schemas:** ${schemaCount}
- **API Version:** ${spec.info.version}

## 🔧 Available Tools

### 1. \`get_endpoint_details\`
Get complete information about a specific endpoint.

**Usage:**
\`\`\`
get_endpoint_details(method="POST", path="/business/v1/business-users/login")
\`\`\`

**Returns:**
- Request body schema
- Parameters (path, query, headers)
- Response schemas for all status codes
- Authentication requirements

### 2. \`search_endpoints\`
Search and filter endpoints.

**Usage:**
\`\`\`
search_endpoints(query="booking")  # Search by keyword
search_endpoints(tag="[API-BUSINESS] Auth")  # Filter by tag
search_endpoints(method="POST")  # Filter by HTTP method
\`\`\`

### 3. \`get_schema_details\`
Get data schema/model definitions.

**Usage:**
\`\`\`
get_schema_details(schemaName="BusinessUserLoginRequest")
\`\`\`

**Returns:** Complete JSON schema with all properties, types, and requirements

## 📚 Available Resources

### \`laravel-api://getting-started\`
This guide you're reading now!

### \`laravel-api://endpoints-list\`
Formatted list of all endpoints organized by tags.

### \`laravel-api://tags-list\`
List of all API tags for navigation.

### \`laravel-api://full-spec\`
Complete OpenAPI 3.1.0 specification (JSON).

## 💡 Common Use Cases

### Example 1: Understand an endpoint
\`\`\`
Q: "What parameters does the registration endpoint need?"
A: Use get_endpoint_details(method="POST", path="/business/v1/business-users/register")
\`\`\`

### Example 2: Find related endpoints
\`\`\`
Q: "Show me all booking endpoints"
A: Use search_endpoints(query="booking")
\`\`\`

### Example 3: Understand data structure
\`\`\`
Q: "What fields are in the CreateBookingRequest?"
A: Use get_schema_details(schemaName="CreateBookingRequest")
\`\`\`

### Example 4: Filter by authentication
\`\`\`
Q: "Show me all public endpoints"
A: Read laravel-api://endpoints-list and look for 🔓 icons
\`\`\`

## 🏷️ API Tags Available

${tags.slice(0, 10).map(tag => `- ${tag}`).join('\n')}
${tags.length > 10 ? `\n... and ${tags.length - 10} more\n` : ''}

## 🎯 Quick Start

1. **Browse all endpoints:**
   Read \`laravel-api://endpoints-list\` resource

2. **Get endpoint details:**
   Use \`get_endpoint_details\` tool with method and path

3. **Search for specific functionality:**
   Use \`search_endpoints\` tool with a keyword

4. **Check data requirements:**
   Use \`get_schema_details\` tool with schema name

## 💪 Benefits for Frontend Development

✅ Always current API documentation
✅ Know exactly what parameters are required
✅ Understand request/response structures
✅ See authentication requirements
✅ Generate properly typed code
✅ Reduce API integration bugs

---

**API Base URL:** ${spec.servers?.[0]?.url || 'Not specified'}
**Documentation:** Auto-generated from Scramble OpenAPI
**Last fetched:** ${new Date().toISOString()}
`;
}

/**
 * Main server setup
 */
async function main() {
  const server = new Server(
    {
      name: 'laravel-api-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'laravel-api://getting-started',
          name: 'Getting Started Guide',
          description: '📚 How to use this MCP server - Start here! Includes API stats, available tools, and usage examples',
          mimeType: 'text/markdown',
        },
        {
          uri: 'laravel-api://endpoints-list',
          name: 'API Endpoints List',
          description: 'Formatted list of all API endpoints organized by tags',
          mimeType: 'text/markdown',
        },
        {
          uri: 'laravel-api://tags-list',
          name: 'API Tags',
          description: 'List of all API tags for navigation',
          mimeType: 'text/plain',
        },
        {
          uri: 'laravel-api://full-spec',
          name: 'Full OpenAPI Specification',
          description: 'Complete OpenAPI 3.1.0 specification from Laravel API',
          mimeType: 'application/json',
        },
      ],
    };
  });

  // Read resource content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const spec = await fetchOpenAPISpec();

    switch (request.params.uri) {
      case 'laravel-api://getting-started':
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'text/markdown',
              text: generateGettingStartedGuide(spec),
            },
          ],
        };

      case 'laravel-api://endpoints-list':
        const endpoints = extractEndpoints(spec);
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'text/markdown',
              text: formatEndpointsList(endpoints),
            },
          ],
        };

      case 'laravel-api://tags-list':
        const tags = extractTags(spec);
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'text/plain',
              text: tags.join('\n'),
            },
          ],
        };

      case 'laravel-api://full-spec':
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: 'application/json',
              text: JSON.stringify(spec, null, 2),
            },
          ],
        };

      default:
        throw new Error(`Unknown resource: ${request.params.uri}`);
    }
  });

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_endpoint_details',
          description: 'Get detailed information about a specific API endpoint including request/response schemas',
          inputSchema: {
            type: 'object',
            properties: {
              method: {
                type: 'string',
                description: 'HTTP method (GET, POST, PUT, PATCH, DELETE, etc.)',
                enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE'],
              },
              path: {
                type: 'string',
                description: 'Endpoint path (e.g., /business/v1/business-users/login)',
              },
            },
            required: ['method', 'path'],
          },
        },
        {
          name: 'search_endpoints',
          description: 'Search for API endpoints by path, tag, or HTTP method',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search term to match in path or summary',
              },
              tag: {
                type: 'string',
                description: 'Filter by specific tag',
              },
              method: {
                type: 'string',
                description: 'Filter by HTTP method',
                enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE'],
              },
            },
          },
        },
        {
          name: 'get_schema_details',
          description: 'Get details about a specific schema/model definition',
          inputSchema: {
            type: 'object',
            properties: {
              schemaName: {
                type: 'string',
                description: 'Name of the schema (e.g., BusinessUserLoginRequest)',
              },
            },
            required: ['schemaName'],
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const spec = await fetchOpenAPISpec();

    switch (request.params.name) {
      case 'get_endpoint_details': {
        const { method, path } = request.params.arguments as { method: string; path: string };
        
        const operation = findOperation(spec, method, path);
        if (!operation) {
          return {
            content: [
              {
                type: 'text',
                text: `Endpoint not found: ${method.toUpperCase()} ${path}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: formatEndpointDetails(operation, method, path, spec),
            },
          ],
        };
      }

      case 'search_endpoints': {
        const { query, tag, method } = request.params.arguments as {
          query?: string;
          tag?: string;
          method?: string;
        };

        let endpoints = extractEndpoints(spec);

        // Apply filters
        if (query) {
          const lowerQuery = query.toLowerCase();
          endpoints = endpoints.filter(
            ep =>
              ep.path.toLowerCase().includes(lowerQuery) ||
              ep.summary?.toLowerCase().includes(lowerQuery) ||
              ep.description?.toLowerCase().includes(lowerQuery)
          );
        }

        if (tag) {
          endpoints = endpoints.filter(ep => ep.tags?.includes(tag));
        }

        if (method) {
          endpoints = endpoints.filter(ep => ep.method === method.toUpperCase());
        }

        return {
          content: [
            {
              type: 'text',
              text: formatEndpointsList(endpoints),
            },
          ],
        };
      }

      case 'get_schema_details': {
        const { schemaName } = request.params.arguments as { schemaName: string };

        const schema = spec.components?.schemas?.[schemaName];
        if (!schema) {
          return {
            content: [
              {
                type: 'text',
                text: `Schema not found: ${schemaName}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `# Schema: ${schemaName}\n\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  const mode = API_MODE === 'file' ? `file: ${API_SPEC_FILE}` : `HTTP: ${SPEC_URL}`;
  console.error('OpenAPI MCP Server running on stdio');
  console.error(`API Mode: ${API_MODE}`);
  console.error(`Spec Source: ${mode}`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
