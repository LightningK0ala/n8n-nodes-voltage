# n8n Voltage Node

A comprehensive n8n community node for integrating with the Voltage API. This node provides complete access to Voltage's Bitcoin Lightning Network services directly from your n8n workflows.

## Features

### Wallet Management

- **Get All Wallets**: Retrieve all wallets in an organization with pagination
- **Get Wallet**: Retrieve a specific wallet by ID with balance and hold information
- **Get Wallet Ledger**: Retrieve wallet transaction history with filtering and pagination

### Payment Operations

- **Create Payment Request**: Create Lightning, On-chain, or BIP21 payment requests (invoices) with automatic polling
- **Send Payment**: Send Lightning (bolt11), On-chain, or BIP21 payments with automatic completion polling
- **Get Payment**: Retrieve payment details by ID
- **Get All Payments**: List all payments with comprehensive filtering (status, kind, direction, date range, etc.)
- **Get Payment History**: Retrieve detailed event history for payment debugging and tracking

### Lines of Credit

- **Get All Lines of Credit**: Retrieve all lines of credit with pagination
- **Get Line of Credit**: Retrieve specific line of credit details including status and limits

### Webhook Management

- **Get All Webhooks**: List all webhooks with filtering options
- **Get Webhook**: Retrieve specific webhook details
- **Create Webhook**: Create new webhooks with event type subscriptions
- **Update Webhook**: Update existing webhook configuration
- **Delete Webhook**: Remove webhooks
- **Start/Stop Webhook**: Control webhook lifecycle
- **Generate Webhook Key**: Generate new signing keys for webhook security

### Advanced Features

- **Comprehensive Filtering**: Advanced filtering for payments, ledger entries, and other resources
- **Pagination Support**: Efficient handling of large datasets with offset/limit controls
- **Auto-ID Generation**: Automatic generation of payment and webhook IDs when not provided
- **Configurable Polling**: Customizable polling behavior for async operations
- **Error Handling**: Robust error handling with detailed error messages and debugging information

## Installation

### Prerequisites

1. n8n installed globally: `npm install n8n -g`
2. The Voltage API SDK: `npm install voltage-api-sdk`

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

- **Resource**: Choose between "Wallet", "Payment", "Line of Credit", or "Webhook"
- **Organization ID**: The organization ID to query (required for all operations)

#### Wallet Operations

- **Get All**: Retrieve all wallets in an organization
- **Get**: Retrieve a specific wallet by ID
- **Get Ledger**: Retrieve wallet transaction history

#### Payment Operations

- **Create Payment Request**: Create a new payment request (invoice) and wait for it to be ready
- **Send Payment**: Send a payment via Lightning or on-chain
- **Get Payment**: Retrieve payment details by ID
- **Get All Payments**: Retrieve all payments with optional filtering
- **Get Payment History**: Retrieve payment event history

#### Line of Credit Operations

- **Get All**: Retrieve all lines of credit
- **Get**: Retrieve a specific line of credit by ID

#### Webhook Operations

- **Get All**: Retrieve all webhooks
- **Get**: Retrieve a specific webhook by ID
- **Create**: Create a new webhook
- **Update**: Update an existing webhook
- **Delete**: Delete a webhook
- **Start**: Start a webhook
- **Stop**: Stop a webhook
- **Generate Key**: Generate a new webhook signing key

### Payment Parameters

#### Create Payment Request

- **Environment ID**: The environment ID (required)
- **Payment Wallet ID**: Wallet ID for the payment request
- **Payment Kind**: Type of payment (Lightning/Bolt11, On-chain, or BIP21)
- **Currency**: BTC or USD
- **Amount (millisats)**: Amount in millisatoshis (leave empty for "any amount" invoice)
- **Description**: Description for the payment request

#### Send Payment

- **Environment ID**: The environment ID (required)
- **Send Payment Type**: Lightning (Bolt11), On-chain, or BIP21
- **Send Wallet ID**: The wallet ID to send payment from
- **Lightning Invoice**: The bolt11 invoice to pay (for Lightning payments)
- **On-chain Address**: Bitcoin address to send to (for on-chain payments)
- **Amount (millisats)**: Amount to send (for on-chain payments)
- **BIP21 URI**: The BIP21 payment URI (for BIP21 payments)

### Filtering Options

The node supports comprehensive filtering for various operations:

- **Limit**: Maximum number of results to return (default: 50)
- **Offset**: Number of results to skip (default: 0)
- **Wallet ID Filter**: Filter by specific wallet ID
- **Payment Statuses**: Filter by payment statuses (created, ready, paid, failed, expired, succeeded)
- **Payment Kind**: Filter by payment type (bolt11, onchain, bip21)
- **Payment Direction**: Filter by direction (send, receive)
- **Start Date**: Filter results after this date
- **End Date**: Filter results before this date
- **Sort Key**: Field to sort by (created_at, updated_at)
- **Sort Order**: Sort order (ascending, descending)

### Webhook Configuration

- **Webhook URL**: The URL to send webhook events to
- **Webhook Description**: Optional description for the webhook
- **Event Types**: Types of events to subscribe to:
  - Send events: created, succeeded, failed
  - Receive events: created, paid, expired
  - Test events: event

### Additional Options

- **Max Polling Attempts**: Maximum number of polling attempts (default: 30)
- **Polling Interval (ms)**: Interval between polling attempts (default: 1000ms)
- **Timeout (ms)**: Total timeout for polling (default: 30000ms)

## Usage Examples

### Wallet Operations

#### Get All Wallets with Pagination

```json
{
	"resource": "wallet",
	"operation": "getAll",
	"organizationId": "your-organization-id",
	"filters": {
		"limit": 10,
		"offset": 0
	}
}
```

#### Get Wallet Ledger with Date Filtering

```json
{
	"resource": "wallet",
	"operation": "getLedger",
	"organizationId": "your-organization-id",
	"walletId": "your-wallet-id",
	"filters": {
		"start_date": "2024-01-01T00:00:00Z",
		"end_date": "2024-12-31T23:59:59Z",
		"limit": 50
	}
}
```

### Payment Operations

#### Create Lightning Invoice

```json
{
	"resource": "payment",
	"operation": "createPaymentRequest",
	"organizationId": "your-organization-id",
	"environmentId": "your-environment-id",
	"paymentWalletId": "your-wallet-id",
	"paymentKind": "bolt11",
	"currency": "btc",
	"amountMsats": 150000,
	"description": "Payment for services"
}
```

#### Send Lightning Payment

```json
{
	"resource": "payment",
	"operation": "sendPayment",
	"organizationId": "your-organization-id",
	"environmentId": "your-environment-id",
	"sendPaymentType": "bolt11",
	"sendWalletId": "your-wallet-id",
	"bolt11Invoice": "lnbc1500n1..."
}
```

#### Get Payments with Filtering

```json
{
	"resource": "payment",
	"operation": "getPayments",
	"organizationId": "your-organization-id",
	"environmentId": "your-environment-id",
	"filters": {
		"statuses": ["paid", "succeeded"],
		"direction": "receive",
		"kind": "bolt11",
		"limit": 25
	}
}
```

### Line of Credit Operations

#### Get All Lines of Credit

```json
{
	"resource": "lineOfCredit",
	"operation": "getAll",
	"organizationId": "your-organization-id"
}
```

### Webhook Operations

#### Create Webhook

```json
{
	"resource": "webhook",
	"operation": "create",
	"organizationId": "your-organization-id",
	"webhookUrl": "https://your-domain.com/webhook",
	"webhookDescription": "Payment notifications",
	"eventTypes": ["receive.paid", "send.succeeded"]
}
```

#### Update Webhook

```json
{
	"resource": "webhook",
	"operation": "update",
	"organizationId": "your-organization-id",
	"webhookId": "your-webhook-id",
	"webhookUrl": "https://new-domain.com/webhook",
	"eventTypes": ["receive.paid", "receive.expired"]
}
```

## Advanced Use Cases

### Payment Processing Workflow

1. Create payment request for customer
2. Monitor payment status with polling
3. Send webhook notifications on completion
4. Update internal systems via additional n8n nodes

### Financial Reporting

1. Get wallet ledger for specific date range
2. Filter transactions by type and amount
3. Generate reports using n8n's data transformation nodes
4. Export to spreadsheets or databases

### Automated Payment Distribution

1. Monitor incoming payments via webhooks
2. Automatically distribute funds to multiple wallets
3. Send confirmation notifications
4. Log all transactions for audit trails

## Error Handling

The node provides comprehensive error handling with detailed error messages:

- **422 Validation Error**: Invalid request parameters
- **401 Authentication Error**: Invalid API credentials
- **403 Permission Error**: Insufficient API key permissions
- **404 Not Found**: Resource not found
- **500+ Server Error**: Voltage API service issues

Error responses include:

- HTTP status codes
- Detailed error messages
- Request context for debugging
- Suggestions for resolution

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
├── __tests__/                       # Test files
│   ├── basic.test.ts               # Basic functionality tests
│   └── voltage-features.test.ts    # Feature-specific tests
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

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
npm run lintfix  # Auto-fix issues
```

## Dependencies

- **voltage-api-sdk**: The official Voltage API SDK (v0.2.4+)
- **n8n-workflow**: n8n workflow types and utilities
- **n8n-core**: n8n core functionality

## API Reference

This node uses the [Voltage API SDK](https://github.com/voltage-api/sdk) to interact with the Voltage API. For detailed API documentation, visit [https://voltageapi.com/docs](https://voltageapi.com/docs).

## Version History

### v0.3.0 (Latest)

- Added send payment functionality (Lightning, On-chain, BIP21)
- Added payment listing with comprehensive filtering
- Added wallet ledger for transaction history
- Added payment history for event tracking
- Added lines of credit management
- Added complete webhook management (CRUD + lifecycle)
- Added advanced filtering and pagination
- Enhanced error handling and debugging
- Comprehensive test coverage

### v0.2.x

- Basic wallet and payment request functionality
- Initial API integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests: `npm run lint && npm test`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues related to this n8n node, please open an issue in this repository.
For Voltage API support, visit [https://voltageapi.com/docs](https://voltageapi.com/docs).
