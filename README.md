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
- ✨ **Auto-Resolved Schemas**: All `$ref` references automatically resolved - no manual resolution needed!
- 📝 **Example Data**: Includes request/response examples when available in OpenAPI spec
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

**Returns:**
- ✨ **Fully resolved schemas** - All `$ref` references automatically resolved!
- 📝 **Example request data** - Concrete JSON examples when available
- 📝 **Example response data** - See actual response structures
- Request body schema with all nested properties
- Parameters (path, query, headers)
- Response schemas for all status codes
- Authentication requirements

**Enhanced in v1.1.0:** No need to call `get_schema_details` separately anymore!

### `search_endpoints`
Search and filter endpoints by various criteria.

**Parameters:**
- `query` (optional): Search term for path or description
- `tag` (optional): Filter by API tag
- `method` (optional): Filter by HTTP method

**Returns:** List of matching endpoints

### `get_schema_details`
Retrieve complete schema/model definitions (rarely needed).

**Parameters:**
- `schemaName` (required): Name of the schema (e.g., `UserLoginRequest`)

**Returns:** Full JSON schema with all properties, types, and requirements

**Note:** With auto-resolution in `get_endpoint_details`, you rarely need this tool anymore!

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

### Enhanced Example: See Everything in One Call ✨

**Old way** (required 2+ calls):
```typescript
// Call 1: Get endpoint details
get_endpoint_details(method="POST", path="/api/users/login")
// Returns: { $ref: "#/components/schemas/UserLoginRequest" }

// Call 2: Resolve the schema reference
get_schema_details(schemaName="UserLoginRequest")
```

**New way** (single call):
```typescript
// One call gets everything!
get_endpoint_details(method="POST", path="/api/users/login")
```

Returns:
```markdown
# POST /api/users/login

**Request Body**
Content-Type: application/json

**Schema:**
{
  "type": "object",
  "properties": {
    "email": { "type": "string", "format": "email" },
    "password": { "type": "string", "minLength": 8 }
  },
  "required": ["email", "password"]
}

**Example Request:**
{
  "email": "user@example.com",
  "password": "secret123"
}

**Responses**
### 200 OK

**Schema:**
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "data": {
      "type": "object",
      "properties": {
        "token": { "type": "string" },
        "user": { ... }
      }
    }
  }
}

**Example Response:**
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "email": "user@example.com" }
  }
}
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

## 🔧 Development Workflow

### Do I Need to Start the Server Manually?

**No!** The MCP server starts **automatically** when your AI client (Cline, Claude Desktop, etc.) needs it. You don't run `npm start` manually.

### Complete Development Setup

1. **Build the Project** (required after any code changes):
   ```bash
   npm run build
   ```
   This compiles TypeScript to `dist/index.js` which your MCP config references.

2. **Start Your Laravel API** (must be running):
   ```bash
   # In your Laravel project
   php artisan serve
   # Should run on http://localhost:8000
   ```

3. **Configure Your MCP Client** (one-time setup):
   
   **For Cline (VS Code)** - Edit `.vscode/mcp.json` or Cline settings:
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
   
   **For Claude Desktop** - Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:
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
   
   ⚠️ **Replace `/absolute/path/to/palanca-play-mcp-api`** with your actual absolute path!

4. **Restart Your AI Client**: 
   - Cline: Reload VS Code window or restart Cline
   - Claude Desktop: Quit and restart the application

### When Making Changes

```bash
# 1. Edit TypeScript files in src/
# 2. Rebuild
npm run build

# 3. Restart your AI client to load the new version
# That's it!
```

### Quick Reference

| Action | Do You Need To... |
|--------|-------------------|
| Use MCP server | ❌ Manually start it (auto-starts) |
| After code changes | ✅ Run `npm run build` |
| After building | ✅ Restart your AI client |
| During development | ✅ Keep Laravel API running on localhost:8000 |
| For local testing | ✅ Use `.env` file + `npm test` |
| For MCP deployment | ✅ Use MCP config env vars |

### Development Tips

**Watch Mode** (auto-rebuild on save):
```bash
npm run watch
```
Keep this running in a terminal during development. Still need to restart AI client after rebuilds.

**Testing Without AI Client**:
```bash
# Uses .env file configuration
npm test              # Full MCP test
npm run test:fetch    # Test spec fetching only
npm run test:guide    # Test getting started guide
```

## 🔍 How It Works

1. **Startup**: Server loads OpenAPI spec from HTTP endpoint or file
2. **Resources**: Exposes formatted views of the specification
3. **Tools**: Provides query capabilities for AI agents
4. **Dynamic**: Fetches fresh data on each request (HTTP mode)
5. **Configuration**: Uses `.env` for local dev, MCP config env vars for deployment
6. **Auto-Start**: MCP client launches the server automatically when AI needs it

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
