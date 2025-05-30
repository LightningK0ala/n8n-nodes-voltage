# Voltage n8n Workflows for AI Agents

This document provides AI agents with the necessary information to interact with Voltage API through n8n workflows to retrieve wallet information.

## Overview

The n8n-nodes-voltage package provides two workflow configurations for AI agents to get all wallets from a Voltage organization:

1. **Manual Trigger Workflow** (`voltage-get-all-wallets-workflow.json`) - For testing and manual execution
2. **Webhook API Workflow** (`voltage-ai-agent-webhook-workflow.json`) - For programmatic AI agent integration

## Prerequisites

### Required Credentials

Before using these workflows, you need to configure Voltage API credentials in n8n:

```json
{
	"apiKey": "vltg_your_api_key_here",
	"baseUrl": "https://voltageapi.com/v1",
	"timeout": 30000
}
```

### Required Parameters

- **organizationId**: The Voltage organization ID to retrieve wallets from (required)

## Workflow 1: Manual Trigger Workflow

### Purpose

Designed for testing and manual execution of wallet retrieval operations.

### Usage

1. Import the workflow JSON into your n8n instance
2. Configure the Voltage API credentials
3. Set the organization ID in the node parameters
4. Execute manually through the n8n interface

### Response Format

```json
{
	"success": true,
	"count": 5,
	"wallets": [
		{
			"id": "wallet_123",
			"name": "Main Wallet",
			"type": "lightning",
			"status": "active",
			"organization_id": "org_456",
			"created_at": "2024-01-15T10:00:00.000Z",
			"updated_at": "2024-01-15T10:00:00.000Z"
		}
	],
	"timestamp": "2024-01-15T10:30:00.000Z",
	"operation": "get_all_wallets"
}
```

## Workflow 2: Webhook API Workflow (Recommended for AI Agents)

### Purpose

Provides a REST API endpoint that AI agents can call programmatically to retrieve all wallets.

### Endpoint Configuration

- **Method**: POST
- **Path**: `/voltage/wallets/get-all`
- **Content-Type**: application/json

### Request Methods

#### Method 1: Request Body

```bash
curl -X POST \
  "https://your-n8n-instance.com/webhook/voltage/wallets/get-all" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "your-organization-id"
  }'
```

#### Method 2: Query Parameters

```bash
curl -X POST \
  "https://your-n8n-instance.com/webhook/voltage/wallets/get-all?organizationId=your-organization-id" \
  -H "Content-Type: application/json"
```

#### Method 3: Headers

```bash
curl -X POST \
  "https://your-n8n-instance.com/webhook/voltage/wallets/get-all" \
  -H "Content-Type: application/json" \
  -H "X-Organization-Id: your-organization-id"
```

### Response Format

#### Success Response (200 OK)

```json
{
	"success": true,
	"data": {
		"wallets": [
			{
				"id": "wallet_123",
				"name": "Main Wallet",
				"type": "lightning",
				"status": "active",
				"organization_id": "org_456",
				"created_at": "2024-01-15T10:00:00.000Z",
				"updated_at": "2024-01-15T10:00:00.000Z",
				"balance": "1000000",
				"currency": "satoshi",
				"network": "mainnet",
				"address": "lnbc1..."
			}
		],
		"count": 1,
		"organization_id": "org_456"
	},
	"meta": {
		"request_id": "req_1705320000_abc123",
		"timestamp": "2024-01-15T10:30:00.000Z",
		"operation": "get_all_wallets",
		"api_version": "v1"
	}
}
```

#### Error Response (400 Bad Request)

```json
{
	"success": false,
	"error": {
		"code": "VALIDATION_ERROR",
		"message": "Missing required parameter: organizationId",
		"details": {
			"type": "validation_error",
			"cause": "Missing or invalid organizationId"
		}
	},
	"meta": {
		"request_id": "req_1705320000_def456",
		"timestamp": "2024-01-15T10:30:00.000Z",
		"operation": "get_all_wallets",
		"api_version": "v1"
	}
}
```

#### API Error Response (400 Bad Request)

```json
{
	"success": false,
	"error": {
		"code": "VOLTAGE_API_ERROR",
		"message": "API returned non-JSON response (Status: 401). Check your API credentials and organization ID.",
		"details": {
			"status": 401,
			"organization_id": "org_456"
		}
	},
	"meta": {
		"request_id": "req_1705320000_ghi789",
		"timestamp": "2024-01-15T10:30:00.000Z",
		"operation": "get_all_wallets",
		"api_version": "v1"
	}
}
```

## AI Agent Integration Examples

### Python Example

```python
import requests
import json

class VoltageWalletClient:
    def __init__(self, n8n_webhook_url):
        self.webhook_url = n8n_webhook_url

    def get_all_wallets(self, organization_id):
        """Get all wallets for a given organization"""
        try:
            response = requests.post(
                self.webhook_url,
                json={"organizationId": organization_id},
                headers={"Content-Type": "application/json"}
            )

            if response.status_code == 200:
                data = response.json()
                if data["success"]:
                    return data["data"]["wallets"]
                else:
                    raise Exception(f"API Error: {data['error']['message']}")
            else:
                raise Exception(f"HTTP Error: {response.status_code}")

        except Exception as e:
            print(f"Error fetching wallets: {e}")
            return None

# Usage
client = VoltageWalletClient("https://your-n8n-instance.com/webhook/voltage/wallets/get-all")
wallets = client.get_all_wallets("your-organization-id")
```

### JavaScript/Node.js Example

```javascript
class VoltageWalletClient {
	constructor(webhookUrl) {
		this.webhookUrl = webhookUrl;
	}

	async getAllWallets(organizationId) {
		try {
			const response = await fetch(this.webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ organizationId }),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				return data.data.wallets;
			} else {
				throw new Error(data.error?.message || 'Unknown error');
			}
		} catch (error) {
			console.error('Error fetching wallets:', error);
			return null;
		}
	}
}

// Usage
const client = new VoltageWalletClient(
	'https://your-n8n-instance.com/webhook/voltage/wallets/get-all',
);
const wallets = await client.getAllWallets('your-organization-id');
```

## Setup Instructions

### 1. Install the Voltage Package

Ensure the n8n-nodes-voltage package is installed in your n8n instance:

```bash
npm install n8n-nodes-voltage
```

### 2. Configure Credentials

1. In n8n, go to Settings > Credentials
2. Create new "Voltage API" credentials
3. Enter your API key, base URL, and timeout settings

### 3. Import Workflow

1. Copy the desired workflow JSON
2. In n8n, go to Workflows > Import from JSON
3. Paste the workflow JSON and save

### 4. Configure Organization ID

- For manual workflow: Set the organizationId parameter in the Voltage node
- For webhook workflow: Pass organizationId in requests as documented above

### 5. Activate Workflow

1. Save the workflow
2. Click "Active" to enable the webhook endpoint (for webhook workflow)

## Error Handling

The workflows include comprehensive error handling for:

- Missing or invalid organization ID
- API authentication failures
- Network timeouts
- Invalid API responses
- Rate limiting

## Security Considerations

1. **API Key Protection**: Store Voltage API keys securely in n8n credentials
2. **Webhook Security**: Consider implementing webhook authentication
3. **Rate Limiting**: Implement appropriate rate limiting for AI agent requests
4. **Input Validation**: The workflow validates all input parameters
5. **Error Logging**: Monitor n8n execution logs for security issues

## Rate Limiting

Be mindful of Voltage API rate limits when integrating with AI agents. Implement appropriate backoff strategies and caching mechanisms as needed.

## Support

For issues related to:

- **n8n-nodes-voltage package**: Check the GitHub repository
- **Voltage API**: Refer to Voltage API documentation
- **n8n platform**: Consult n8n documentation

## Additional Operations

The Voltage node also supports:

- Getting a specific wallet by ID (`get` operation)
- Future operations as they become available in the SDK

To use the `get` operation, modify the workflow to include `walletId` parameter and set `operation` to `"get"`.
