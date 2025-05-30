# n8n Voltage Node

A custom n8n community node for integrating with the Voltage API. This node allows you to interact with Voltage's Bitcoin Lightning Network services directly from your n8n workflows.

## Features

- **Get All Wallets**: Retrieve all wallets in an organization
- **Get Wallet**: Retrieve a specific wallet by ID
- **Configurable Authentication**: Support for API key, base URL, and timeout settings
- **Error Handling**: Robust error handling with detailed error messages

## Installation

### Prerequisites

1. n8n installed globally: `npm install n8n -g`
2. The Voltage API SDK linked: `npm link @voltage/api-sdk`

### Install the Node

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Link the node: `npm link`
6. In your n8n installation directory, link the node: `npm link n8n-nodes-voltage`

### Alternative Installation (Development)

For development, you can install directly from the source:

```bash
# In your n8n custom nodes directory (~/.n8n/custom/)
git clone <this-repository>
cd n8n-nodes-voltage
npm install
npm run build
```

## Configuration

### Credentials

The node requires Voltage API credentials with the following fields:

- **API Key**: Your Voltage API key (starts with `vltg_`)
- **Base URL**: The Voltage API base URL (default: `https://voltageapi.com/api/v1`)
- **Timeout**: Request timeout in milliseconds (default: 30000)

### Node Parameters

- **Resource**: Currently supports "Wallet"
- **Operation**:
  - "Get All" - Retrieve all wallets in an organization
  - "Get" - Retrieve a specific wallet by ID
- **Organization ID**: The organization ID to query (required)
- **Wallet ID**: The specific wallet ID (required for "Get" operation)

## Usage

1. Add the Voltage node to your workflow
2. Configure the credentials with your Voltage API key
3. Set the organization ID
4. Choose the operation (Get All or Get specific wallet)
5. If getting a specific wallet, provide the wallet ID
6. Execute the workflow

## Example Workflow

```json
{
	"nodes": [
		{
			"name": "Get Wallets",
			"type": "n8n-nodes-voltage.voltage",
			"parameters": {
				"resource": "wallet",
				"operation": "getAll",
				"organizationId": "your-organization-id"
			},
			"credentials": {
				"voltageApi": "your-voltage-credentials"
			}
		}
	]
}
```

## Development

### Project Structure

```
├── credentials/
│   └── VoltageApi.credentials.ts    # Credential definition
├── nodes/
│   └── Voltage/
│       ├── Voltage.node.ts          # Main node implementation
│       ├── Voltage.node.json        # Node metadata
│       └── voltage.svg              # Node icon
├── package.json                     # Package configuration
├── tsconfig.json                    # TypeScript configuration
└── README.md                        # This file
```

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## Dependencies

- **@voltage/api-sdk**: The official Voltage API SDK
- **n8n-workflow**: n8n workflow types and utilities
- **n8n-core**: n8n core functionality

## API Reference

This node uses the [Voltage API SDK](https://github.com/voltage-api/sdk) to interact with the Voltage API. For detailed API documentation, visit [https://voltageapi.com/docs](https://voltageapi.com/docs).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues related to this n8n node, please open an issue in this repository.
For Voltage API support, visit [https://voltageapi.com/docs](https://voltageapi.com/docs).
