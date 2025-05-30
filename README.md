# n8n Voltage Node

A custom n8n community node for integrating with the Voltage API. This node allows you to interact with Voltage's Bitcoin Lightning Network services directly from your n8n workflows and **is fully compatible with AI agents**.

## Features

### Wallet Operations

- **Get All Wallets**: Retrieve all wallets in an organization
- **Get Wallet**: Retrieve a specific wallet by ID
- **Create Wallet**: Create a new Lightning wallet
- **Delete Wallet**: Delete an existing wallet

### AI Agent Integration

- **Fully compatible** with n8n AI agents
- **Proper TypeScript support** with full type checking
- **Enhanced error handling** for better AI agent feedback
- **Structured responses** optimized for AI agent processing

## Installation

```bash
npm install n8n-nodes-voltage
```

## Prerequisites

1. A Voltage Cloud account
2. API access credentials
3. Organization ID from your Voltage dashboard

## Setup

### 1. Get Your API Credentials

1. Log in to [Voltage Cloud](https://voltage.cloud)
2. Navigate to your organization settings
3. Generate an API key
4. Note your Organization ID

### 2. Configure in n8n

1. In n8n, add the **Voltage** node to your workflow
2. Create new credentials:
   - **Name**: VoltageApi
   - **API Key**: Your Voltage API key

## Usage

### Node Parameters

- **Resource**: Choose "Wallet"
- **Operation**:
  - "Get All" - Get all wallets in organization
  - "Get" - Get specific wallet by ID
  - "Create" - Create a new wallet
  - "Delete" - Delete an existing wallet
- **Organization ID**: The organization ID to query (required)
- **Wallet ID**: The specific wallet ID (required for "Get" and "Delete" operations)
- **Wallet Details**: JSON object with wallet configuration (for "Create" operation)

### Wallet Creation Details

When creating a wallet, provide a JSON object with:

```json
{
	"name": "My AI Wallet",
	"network": "mainnet",
	"environment_id": "your_environment_id",
	"line_of_credit_id": "your_line_of_credit_id",
	"limit": 1000000,
	"metadata": {
		"purpose": "AI agent payments"
	}
}
```

## AI Agent Usage

### Setting Up with AI Agents

1. Add the **AI Agent** node to your workflow
2. Connect the **Voltage** node as a tool to your AI Agent
3. Configure your AI agent's system message to include Bitcoin/Lightning context
4. The AI agent can now autonomously:
   - Manage Lightning wallets
   - Check wallet balances
   - Create wallets for different purposes
   - Monitor wallet status

### Example AI Agent Prompts

```
"Create a new Lightning wallet for micropayments"
"Check the balance of wallet abc123"
"List all available wallets in our organization"
"Delete the test wallet xyz789"
```

## Payment Operations (Coming Soon)

The current SDK only supports wallet management operations. Payment operations (sending/receiving) will be added in a future version using the Voltage HTTP API directly.

## Error Handling

The node includes comprehensive error handling:

- **Authentication errors**: Clear messages about API key issues
- **Network errors**: Timeout and connectivity information
- **Validation errors**: Detailed parameter validation feedback
- **API errors**: Voltage-specific error details with status codes

## Development

To build this project:

```bash
npm run build
```

To run in development mode:

```bash
npm run dev
```

## Support

For issues related to:

- **This n8n node**: Open an issue on this repository
- **Voltage API**: Check [Voltage Documentation](https://docs.voltage.cloud)
- **n8n platform**: Visit [n8n Community](https://community.n8n.io)

## License

MIT License - see LICENSE file for details.
