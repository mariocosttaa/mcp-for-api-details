/**
 * OpenAPI 3.1.0 Specification Types
 */

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  servers: Array<{
    url: string;
  }>;
  security?: Array<Record<string, string[]>>;
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, Schema>;
    responses?: Record<string, Response>;
    securitySchemes?: Record<string, SecurityScheme>;
  };
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
  options?: Operation;
  head?: Operation;
  trace?: Operation;
}

export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  requestBody?: RequestBody;
  parameters?: Parameter[];
  responses: Record<string, Response>;
  security?: Array<Record<string, string[]>>;
}

export interface RequestBody {
  required?: boolean;
  content: Record<string, MediaType>;
}

export interface MediaType {
  schema: Schema | Reference;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema: Schema | Reference;
}

export interface Response {
  description: string;
  content?: Record<string, MediaType>;
  $ref?: string;
}

export interface Schema {
  type?: string;
  properties?: Record<string, Schema | Reference>;
  required?: string[];
  items?: Schema | Reference;
  enum?: any[];
  $ref?: string;
  allOf?: Array<Schema | Reference>;
  anyOf?: Array<Schema | Reference>;
  oneOf?: Array<Schema | Reference>;
}

export interface Reference {
  $ref: string;
}

export interface SecurityScheme {
  type: string;
  scheme?: string;
  bearerFormat?: string;
}

export interface EndpointInfo {
  method: string;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  requiresAuth: boolean;
  operationId?: string;
}
