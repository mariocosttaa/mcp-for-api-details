# OpenAPI MCP Server

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-Model_Context_Protocol-blue?style=for-the-badge)
![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1.0-6BA539?style=for-the-badge&logo=openapi-initiative&logoColor=white)

A **Model Context Protocol (MCP) server** that exposes OpenAPI 3.x specifications to AI agents, enabling them to understand and interact with any REST API documentation programmatically.

## 🎯 What is This?

This MCP server acts as a bridge between AI agents (like Claude, GPT, or custom AI assistants) and your API documentation. Instead of manually explaining your API to AI agents, they can query this server to understand:

- Available endpoints and their purposes
- Request/response schemas
- Required vs optional parameters  
- Authentication requirements
- Data models and validations

## ✨ Features

- 🔄 **Dual Source Mode**: Fetch OpenAPI spec from HTTP endpoint OR load from local file
- 📚 **4 Resources**: Getting started guide, endpoints list, tags list, and full spec
- 🔧 **3 Tools**: Query endpoint details, search endpoints, and retrieve schemas
- 🎯 **Self-Documenting**: Built-in getting started guide that AI agents can read
- 🔐 **Auth Detection**: Automatically identifies public vs protected endpoints
- 📊 **Live Statistics**: Real-time API metrics (endpoints, schemas, tags count)
- ⚡ **Always Current**: Fetches fresh data on each request (HTTP mode)

## 📋 Requirements

- **Node.js** 18+
- **TypeScript** 5+
- An **OpenAPI 3.x** specification (JSON format)
  - From an HTTP endpoint (e.g., Laravel Scramble, FastAPI, Express with swagger)
  - OR from a local JSON file

## 🚀 Quick Start

### 1. Install

```bash
git clone <your-repo-url>
cd palanca-play-mcp-api
npm install
npm run build
```

### 2. Configuration - Two Methods

#### Method A: For Local Development/Testing (.env file) 💻

Use this when running tests locally or developing the server.

```bash
# Copy example and configure
cp .env.example .env

# Edit .env file:
API_MODE=http
API_BASE_URL=http://localhost:8000
API_SPEC_PATH=/docs/api.json

# Run tests easily
npm test
```

**Why?** Convenient for local development - no need to set environment variables every time.

#### Method B: For MCP Deployment (Required) 🚀

Use this when deploying to Cline, Claude Desktop, or any MCP client.

**Cline (VS Code):**

```json
{
  "mcpServers": {
    "openapi": {
      "command": "node",
      "args": ["/absolute/path/to/palanca-play-mcp-api/dist/index.js"],
      "env": {
        "API_MODE": "http",
        "API_BASE_URL": "http://localhost:8000",
        "API_SPEC_PATH": "/docs/api.json"
      }
    }
  }
}
```

**Claude Desktop:**

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openapi": {
      "command": "node",
      "args": ["/absolute/path/to/palanca-play-mcp-api/dist/index.js"],
      "env": {
        "API_MODE": "http",
        "API_BASE_URL": "http://localhost:8000",
        "API_SPEC_PATH": "/docs/api.json"
      }
    }
  }
}
```

**Important:** MCP config environment variables **override** `.env` if both exist.

### 3. Start Using

**For Local Testing:**
```bash
npm test
```

**For MCP Clients:**  
Restart your IDE/application to load the MCP server.

## ⚙️ Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_MODE` | No | `http` | How to load spec: `http` or `file` |
| `API_BASE_URL` | When `API_MODE=http` | `http://localhost:8000` | Base URL of your API |
| `API_SPEC_PATH` | When `API_MODE=http` | `/docs/api.json` | Path to OpenAPI spec endpoint |
| `API_SPEC_FILE` | When `API_MODE=file` | - | Absolute path to local OpenAPI JSON file |

### Configuration Examples

#### Laravel + Scramble
```json
"env": {
  "API_MODE": "http",
  "API_BASE_URL": "http://localhost:8000",
  "API_SPEC_PATH": "/docs/api.json"
}
```

#### FastAPI
```json
"env": {
  "API_MODE": "http",
  "API_BASE_URL": "http://localhost:8000",
  "API_SPEC_PATH": "/openapi.json"
}
```

#### Express + Swagger
```json
"env": {
  "API_MODE": "http",
  "API_BASE_URL": "http://localhost:3000",
  "API_SPEC_PATH": "/api-docs/swagger.json"
}
```

#### Static OpenAPI File
```json
"env": {
  "API_MODE": "file",
  "API_SPEC_FILE": "/absolute/path/to/my-api-spec.json"
}
```

## 📚 Available Resources

Once configured, AI agents can access these resources:

| Resource URI | Description |
|-------------|-------------|
| `laravel-api://getting-started` | 📖 Complete usage guide with examples and API statistics |
| `laravel-api://endpoints-list` | 📝 All endpoints organized by tags with auth indicators |
| `laravel-api://tags-list` | 🏷️ List of all API tags for navigation |
| `laravel-api://full-spec` | 📄 Complete OpenAPI specification (JSON) |

## 🔨 Available Tools

AI agents can use these tools to query your API:

### `get_endpoint_details`
Get comprehensive information about a specific endpoint.

**Parameters:**
- `method` (required): HTTP method (GET, POST, PUT, DELETE, etc.)
- `path` (required): Endpoint path (e.g., `/api/users/login`)

**Returns:** Request body schema, parameters, responses, authentication requirements

### `search_endpoints`
Search and filter endpoints by various criteria.

**Parameters:**
- `query` (optional): Search term for path or description
- `tag` (optional): Filter by API tag
- `method` (optional): Filter by HTTP method

**Returns:** List of matching endpoints

### `get_schema_details`
Retrieve complete schema/model definitions.

**Parameters:**
- `schemaName` (required): Name of the schema (e.g., `UserLoginRequest`)

**Returns:** Full JSON schema with all properties, types, and requirements

## 💡 Usage Examples

### First Interaction
Ask AI: *"Can you read the getting started guide?"*

AI will read `laravel-api://getting-started` and learn:
- How to use all available tools
- Your API statistics (endpoint count, schemas, etc.)
- Common use cases and examples

### Query Specific Endpoints
Ask AI: *"What parameters does the user registration endpoint need?"*

AI will call:
```typescript
get_endpoint_details(
  method="POST", 
  path="/api/users/register"
)
```

### Find Related Endpoints
Ask AI: *"Show me all authentication-related endpoints"*

AI will call:
```typescript
search_endpoints(query="auth")
```

### Understand Data Structures
Ask AI: *"What fields are required in the CreateUserRequest?"*

AI will call:
```typescript
get_schema_details(schemaName="CreateUserRequest")
```

## 🏗️ Project Structure

```
palanca-play-mcp-api/
├── src/
│   ├── index.ts              # Main MCP server
│   └── types.ts              # TypeScript type definitions
├── tests/
│   ├── test-fetch.js         # Test HTTP/file spec loading
│   ├── test-mcp.js           # Test full MCP functionality
│   └── test-getting-started.js  # Test getting started guide
├── examples/                 # Example OpenAPI specs (optional)
├── dist/                     # Compiled JavaScript (generated)
├── .env.example              # Environment example for local dev
├── cline-mcp-config.json     # Example MCP config for Cline
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Development

```bash
# Watch mode (auto-rebuild on changes)
npm run watch

# Build
npm run build

# Run tests (using .env file)
npm test

# Individual tests
npm run test:fetch    # Test spec fetching
npm run test:guide    # Test getting started guide
```

## 🔍 How It Works

1. **Startup**: Server loads OpenAPI spec from HTTP endpoint or file
2. **Resources**: Exposes formatted views of the specification
3. **Tools**: Provides query capabilities for AI agents
4. **Dynamic**: Fetches fresh data on each request (HTTP mode)
5. **Configuration**: Uses `.env` for local dev, MCP config env vars for deployment

## 📦 Dependencies

- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - MCP server framework
- [node-fetch](https://www.npmjs.com/package/node-fetch) - HTTP client for fetching specs
- [dotenv](https://www.npmjs.com/package/dotenv) - Load .env for local development
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development

## 🤝 Contributing

This is a generalizable MCP server that works with any OpenAPI 3.x specification. Feel free to:

- Add support for OpenAPI 2.x (Swagger)
- Implement caching mechanisms
- Add more query tools
- Improve error handling

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol)
- Designed to work with any OpenAPI-compliant API
- Inspired by the need to give AI agents programmatic access to API documentation

---

**Made with ❤️ for the AI agent ecosystem**
