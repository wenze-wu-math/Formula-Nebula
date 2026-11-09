/**
 * Enhanced API Documentation Generator
 * Creates comprehensive API docs with examples, test endpoints, and multiple formats
 */

export class EnhancedDocumentationGenerator {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://api.formula-nebula.com';
    this.apiVersion = config.apiVersion || '1.0.0';
  }

  /**
   * Generate complete documentation package
   */
  async generateDocumentation(endpoints) {
    return {
      markdown: this.generateMarkdownDocs(endpoints),
      examples: this.generateCodeExamples(endpoints),
      testCollection: this.generatePostmanCollection(endpoints),
      html: this.generateHTMLDocs(endpoints)
    };
  }

  /**
   * Generate comprehensive Markdown documentation
   */
  generateMarkdownDocs(endpoints) {
    const markdown = `# Formula Nebula API Documentation

**Version:** ${this.apiVersion}

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

## Introduction

Welcome to the Formula Nebula API. This API provides access to mathematical formula discovery, proof generation, and mathematical computation services.

### Base URL
\`\`\`
${this.baseUrl}
\`\`\`

### Supported Formats
- JSON (application/json)
- Protocol Buffers (optional)

## Authentication

The Formula Nebula API uses API Key or Bearer Token authentication.

### Methods

#### 1. Bearer Token (Recommended)
\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

#### 2. API Key Header
\`\`\`
X-API-Key: YOUR_API_KEY
\`\`\`

#### 3. Query Parameter (Development only)
\`\`\`
?apiKey=YOUR_API_KEY
\`\`\`

### Getting Started

1. Create a Formula Nebula account
2. Generate an API key from the dashboard
3. Include the key in your requests

## API Endpoints

${this.generateEndpointsSectionMarkdown(endpoints)}

## Error Handling

All errors are returned as JSON with the following format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Invalid request parameters",
    "details": {
      "field": "formula",
      "issue": "Missing required field"
    }
  }
}
\`\`\`

### Common Status Codes

| Code | Title | Description |
|------|-------|-------------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid parameters or malformed request |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Endpoint or resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

## Rate Limiting

API requests are rate limited to prevent abuse.

### Rate Limit Headers

Every response includes rate limit information:

\`\`\`
X-RateLimit-Limit-Minute: 60
X-RateLimit-Remaining-Minute: 55
X-RateLimit-Reset-Minute: 1673456789
Retry-After: 60
\`\`\`

### Limits by Plan

- **Free**: 10 requests per minute
- **Pro**: 100 requests per minute
- **Enterprise**: Custom limits

## Examples

${this.generateExamplesSectionMarkdown(endpoints)}

---

**Last Updated:** ${new Date().toISOString()}
**Maintained by:** Formula Nebula Team
`;

    return markdown;
  }

  /**
   * Generate endpoints section for markdown
   */
  generateEndpointsSectionMarkdown(endpoints) {
    let section = '';

    // Group endpoints by tag
    const grouped = this.groupEndpointsByTag(endpoints);

    for (const [tag, endpointList] of Object.entries(grouped)) {
      section += `\n### ${tag}\n\n`;

      endpointList.forEach(endpoint => {
        section += `#### ${endpoint.method} ${endpoint.path}

**Description:** ${endpoint.description || 'No description provided'}

**Operation ID:** \`${endpoint.operationId || this.generateOperationId(endpoint)}\`

`;

        // Parameters
        if (endpoint.queryParams && endpoint.queryParams.length > 0) {
          section += `**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
`;
          endpoint.queryParams.forEach(param => {
            section += `| ${param.name} | ${param.type || 'string'} | ${param.required ? 'Yes' : 'No'} | ${param.description || ''} |\n`;
          });
          section += '\n';
        }

        // Request body
        if (endpoint.requestBody) {
          section += `**Request Body:**

\`\`\`json
${JSON.stringify(endpoint.requestBody.example || {}, null, 2)}
\`\`\`

`;
        }

        // Response
        section += `**Response (200):**

\`\`\`json
${JSON.stringify(endpoint.responseExample || { success: true, data: {} }, null, 2)}
\`\`\`

`;
      });
    }

    return section;
  }

  /**
   * Generate examples section for markdown
   */
  generateExamplesSectionMarkdown(endpoints) {
    let section = '';

    const mainEndpoint = endpoints[0];
    if (!mainEndpoint) return section;

    section += `### JavaScript / Node.js

\`\`\`javascript
const axios = require('axios');

const client = axios.create({
  baseURL: '${this.baseUrl}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

async function discoverFormula(input) {
  try {
    const response = await client.post('${mainEndpoint.path}', {
      query: input,
      limit: 10
    });

    console.log('Formulas found:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error:', error.response?.data?.error || error.message);
  }
}

discoverFormula('fibonacci');
\`\`\`

### Python

\`\`\`python
import requests
import json

API_KEY = 'YOUR_API_KEY'
BASE_URL = '${this.baseUrl}'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

def discover_formula(query):
    try:
        response = requests.post(
            f'{BASE_URL}${mainEndpoint.path}',
            headers=headers,
            json={'query': query, 'limit': 10}
        )
        response.raise_for_status()

        data = response.json()
        print(f'Formulas found: {data["data"]}')
        return data['data']
    except requests.exceptions.RequestException as e:
        print(f'Error: {e.response.json() if hasattr(e, "response") else str(e)}')

discover_formula('fibonacci')
\`\`\`

### cURL

\`\`\`bash
curl -X POST '${this.baseUrl}${mainEndpoint.path}' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "query": "fibonacci",
    "limit": 10
  }'
\`\`\`

### TypeScript

\`\`\`typescript
import axios, { AxiosInstance } from 'axios';

interface FormulaDiscoveryRequest {
  query: string;
  limit?: number;
}

interface FormulaDiscoveryResponse {
  success: boolean;
  data: any[];
}

class FormulaNebulaClient {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: '${this.baseUrl}',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      }
    });
  }

  async discoverFormulas(request: FormulaDiscoveryRequest): Promise<FormulaDiscoveryResponse> {
    const response = await this.client.post('${mainEndpoint.path}', request);
    return response.data;
  }
}

const client = new FormulaNebulaClient('YOUR_API_KEY');
client.discoverFormulas({ query: 'fibonacci', limit: 10 })
  .then(result => console.log(result))
  .catch(error => console.error(error));
\`\`\`

`;

    return section;
  }

  /**
   * Generate code examples for various languages
   */
  generateCodeExamples(endpoints) {
    const examples = {};

    endpoints.forEach((endpoint, _index) => {
      const key = `${endpoint.method}_${endpoint.path}`.replace(/[{}/:]/g, '_');

      examples[key] = {
        javascript: this.generateJavaScriptExample(endpoint),
        python: this.generatePythonExample(endpoint),
        curl: this.generateCurlExample(endpoint),
        typescript: this.generateTypeScriptExample(endpoint),
        go: this.generateGoExample(endpoint),
        java: this.generateJavaExample(endpoint)
      };
    });

    return examples;
  }

  generateJavaScriptExample(endpoint) {
    return `const axios = require('axios');

const client = axios.create({
  baseURL: '${this.baseUrl}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

async function example() {
  try {
    const response = await client.${endpoint.method.toLowerCase()}('${endpoint.path}', ${
      endpoint.method !== 'GET' ? JSON.stringify(endpoint.requestBody?.example || {}, null, 2) : ''
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data?.error);
  }
}

example();`;
  }

  generatePythonExample(endpoint) {
    return `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

url = '${this.baseUrl}${endpoint.path}'

try:
    response = requests.${endpoint.method.toLowerCase()}(
        url,
        headers=headers${endpoint.method !== 'GET' ? `,\n        json=${JSON.stringify(endpoint.requestBody?.example || {}, null, 2).split('\n').join('\n        ')}` : ''}
    )
    response.raise_for_status()
    print('Success:', response.json())
except requests.exceptions.RequestException as e:
    print('Error:', e.response.json() if e.response else str(e))`;
  }

  generateCurlExample(endpoint) {
    const dataArg = endpoint.method !== 'GET'
      ? ` \\\n  -d '${JSON.stringify(endpoint.requestBody?.example || {})}'`
      : '';

    return `curl -X ${endpoint.method} '${this.baseUrl}${endpoint.path}' \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'${dataArg}`;
  }

  generateTypeScriptExample(endpoint) {
    return `import axios from 'axios';

interface RequestBody {
  [key: string]: any;
}

interface Response {
  success: boolean;
  data: any;
}

async function callAPI(): Promise<Response> {
  const response = await axios.${endpoint.method.toLowerCase()}<Response>(
    '${this.baseUrl}${endpoint.path}',
    ${endpoint.method !== 'GET' ? JSON.stringify(endpoint.requestBody?.example || {}, null, 2) + ',' : ''}
    {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

callAPI().catch(console.error);`;
  }

  generateGoExample(endpoint) {
    return `package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "bytes"
    "encoding/json"
)

func main() {
    url := "${this.baseUrl}${endpoint.path}"

    ${endpoint.method !== 'GET' ? `payload := map[string]interface{}{
        // Add request body here
    }
    jsonData, _ := json.Marshal(payload)
    req, _ := http.NewRequest("${endpoint.method}", url, bytes.NewBuffer(jsonData))` : `req, _ := http.NewRequest("${endpoint.method}", url, nil)`}

    req.Header.Add("Authorization", "Bearer YOUR_API_KEY")
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    defer resp.Body.Close()

    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println("Response:", string(body))
}`;
  }

  generateJavaExample(endpoint) {
    return `import okhttp3.*;
import com.google.gson.Gson;

public class ApiClient {
    private static final String API_KEY = "YOUR_API_KEY";
    private static final String BASE_URL = "${this.baseUrl}";

    public static void main(String[] args) throws Exception {
        OkHttpClient client = new OkHttpClient();

        ${endpoint.method !== 'GET' ? `String json = new Gson().toJson(new Object(){
            // Add fields here
        });
        RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));
        Request request = new Request.Builder()
            .url(BASE_URL + "${endpoint.path}")
            .${endpoint.method.toLowerCase()}(body)` : `Request request = new Request.Builder()
            .url(BASE_URL + "${endpoint.path}")
            .${endpoint.method.toLowerCase()}()`}
            .addHeader("Authorization", "Bearer " + API_KEY)
            .addHeader("Content-Type", "application/json")
            .build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println("Response: " + response.body().string());
        }
    }
}`;
  }

  /**
   * Generate Postman collection for testing
   */
  generatePostmanCollection(endpoints) {
    const collection = {
      info: {
        name: 'Formula Nebula API',
        description: 'Complete API collection for Formula Nebula',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: endpoints.map(endpoint => this.generatePostmanItem(endpoint)),
      variable: [
        {
          key: 'base_url',
          value: this.baseUrl,
          type: 'string'
        },
        {
          key: 'api_key',
          value: 'YOUR_API_KEY',
          type: 'string'
        }
      ]
    };

    return collection;
  }

  /**
   * Generate single Postman request item
   */
  generatePostmanItem(endpoint) {
    const item = {
      name: `${endpoint.method} ${endpoint.path}`,
      request: {
        method: endpoint.method,
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{api_key}}',
            type: 'text'
          },
          {
            key: 'Content-Type',
            value: 'application/json',
            type: 'text'
          }
        ],
        url: {
          raw: '{{base_url}}' + endpoint.path,
          host: ['{{base_url}}'],
          path: endpoint.path.split('/').filter(p => p)
        }
      },
      response: []
    };

    // Add query parameters
    if (endpoint.queryParams) {
      item.request.url.query = endpoint.queryParams.map(param => ({
        key: param.name,
        value: '',
        disabled: !param.required
      }));
    }

    // Add request body
    if (endpoint.method !== 'GET' && endpoint.requestBody) {
      item.request.body = {
        mode: 'raw',
        raw: JSON.stringify(endpoint.requestBody.example || {}, null, 2)
      };
    }

    return item;
  }

  /**
   * Generate HTML documentation
   */
  generateHTMLDocs(endpoints) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formula Nebula API Documentation</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            color: #333;
            background: #f5f5f5;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 20px;
            text-align: center;
        }
        header h1 { font-size: 2.5em; margin-bottom: 10px; }
        header p { font-size: 1.1em; opacity: 0.9; }
        .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        .endpoint {
            background: white;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .endpoint h3 {
            margin-bottom: 10px;
            color: #667eea;
        }
        .endpoint-method {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 3px;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
            margin-right: 10px;
        }
        .method-get { background: #61affe; }
        .method-post { background: #49cc90; }
        .method-put { background: #fca130; }
        .method-delete { background: #f93e3e; }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
        }
        footer {
            background: #333;
            color: white;
            padding: 20px;
            text-align: center;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <header>
        <h1>📐 Formula Nebula API</h1>
        <p>Mathematical Formula Discovery & Proof Generation</p>
    </header>

    <div class="container">
        <h2>API Endpoints</h2>
        ${endpoints.map(endpoint => `
        <div class="endpoint">
            <h3>
                <span class="endpoint-method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <code>${endpoint.path}</code>
            </h3>
            <p>${endpoint.description || 'No description'}</p>
        </div>
        `).join('')}
    </div>

    <footer>
        <p>&copy; 2024 Formula Nebula. All rights reserved.</p>
    </footer>
</body>
</html>`;
  }

  /**
   * Helper: Group endpoints by tag
   */
  groupEndpointsByTag(endpoints) {
    const grouped = {};
    endpoints.forEach(endpoint => {
      const tag = endpoint.tag || 'General';
      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push(endpoint);
    });
    return grouped;
  }

  /**
   * Helper: Generate operation ID
   */
  generateOperationId(endpoint) {
    const method = endpoint.method.toLowerCase();
    const path = endpoint.path
      .replace(/\{([^}]+)\}/g, 'By$1')
      .replace(/[/-]/g, '_')
      .replace(/^_/, '');
    return `${method}_${path}`;
  }
}

export default EnhancedDocumentationGenerator;
