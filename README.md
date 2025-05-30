# n8n Voltage Node

A custom n8n community node for integrating with the Voltage API. This node allows you to interact with Voltage's Bitcoin Lightning Network services directly from your n8n workflows.

## Features

- **Get All Wallets**: Retrieve all wallets in an organization
- **Get Wallet**: Retrieve a specific wallet by ID
- **Create Payment Request**: Create Lightning, On-chain, or BIP21 payment requests (invoices) with automatic polling and auto-generated payment IDs
- **Get Payment**: Retrieve payment details by ID
- **Configurable Authentication**: Support for API key, base URL, and timeout settings
- **Error Handling**: Robust error handling with detailed error messages
- **Polling Support**: Automatic polling for payment request generation with configurable timeouts

## Installation

### Prerequisites

1. n8n installed globally: `npm install n8n -g`
2. The Voltage API SDK linked: `npm link voltage-api-sdk`

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
- **Base URL**: The Voltage API base URL (default: `https://voltageapi.com/v1`)
- **Timeout**: Request timeout in milliseconds (default: 30000)

### Node Parameters

- **Resource**: Choose between "Wallet" or "Payment"
- **Operation**:
  - **Wallet Operations**:
    - "Get All" - Retrieve all wallets in an organization
    - "Get" - Retrieve a specific wallet by ID
  - **Payment Operations**:
    - "Create Payment Request" - Create a new payment request (invoice) and wait for it to be ready
    - "Get Payment" - Retrieve payment details by ID
- **Organization ID**: The organization ID to query (required)
- **Environment ID**: The environment ID (required for payment operations)
- **Wallet ID**: The specific wallet ID (required for "Get wallet" operation)

#### Payment Request Parameters

- **Payment Wallet ID**: Wallet ID for the payment request
- **Payment Kind**: Type of payment (Lightning/Bolt11, On-chain, or BIP21)
- **Currency**: BTC or USD
- **Amount (millisats)**: Amount in millisatoshis (leave empty for "any amount" invoice)
- **Description**: Description for the payment request
- **Additional Options**: Configure polling behavior (max attempts, interval, timeout)

#### Get Payment Parameters

- **Payment ID**: The specific payment ID to retrieve

## Usage

### Wallet Operations

1. Add the Voltage node to your workflow
2. Configure the credentials with your Voltage API key
3. Set the resource to "Wallet"
4. Set the organization ID
5. Choose the operation (Get All or Get specific wallet)
6. If getting a specific wallet, provide the wallet ID
7. Execute the workflow

### Payment Operations

1. Add the Voltage node to your workflow
2. Configure the credentials with your Voltage API key
3. Set the resource to "Payment"
4. Set the organization ID and environment ID
5. Choose the operation:
   - **Create Payment Request**: Fill in wallet ID, payment kind, currency, amount, and description (payment IDs are automatically generated)
   - **Get Payment**: Provide the payment ID to retrieve
6. Execute the workflow

The node will automatically handle polling for payment request generation, waiting until the Lightning invoice or Bitcoin address is ready.

## Example Workflow

### Wallet Example

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

### Payment Request Example

```json
{
	"nodes": [
		{
			"name": "Create Lightning Invoice",
			"type": "n8n-nodes-voltage.voltage",
			"parameters": {
				"resource": "payment",
				"operation": "createPaymentRequest",
				"organizationId": "your-organization-id",
				"environmentId": "your-environment-id",
				"paymentWalletId": "your-wallet-id",
				"paymentKind": "bolt11",
				"currency": "btc",
				"amountMsats": 150000,
				"description": "Payment for services"
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

- **voltage-api-sdk**: The official Voltage API SDK
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
