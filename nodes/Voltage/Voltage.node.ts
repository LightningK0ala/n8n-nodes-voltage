import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';

import { VoltageClient } from 'voltage-api-sdk';

export class Voltage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Voltage',
		name: 'voltage',
		icon: 'file:voltage.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Voltage API',
		defaults: {
			name: 'Voltage',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'voltageApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Wallet',
						value: 'wallet',
					},
					{
						name: 'Payment',
						value: 'payment',
					},
					{
						name: 'Line of Credit',
						value: 'lineOfCredit',
					},
					{
						name: 'Webhook',
						value: 'webhook',
					},
				],
				default: 'wallet',
			},
			// Wallet Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['wallet'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all wallets in an organization',
						action: 'Get all wallets',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a specific wallet by ID',
						action: 'Get a wallet',
					},
					{
						name: 'Get Ledger',
						value: 'getLedger',
						description: 'Get wallet transaction history',
						action: 'Get wallet ledger',
					},
				],
				default: 'getAll',
			},
			// Payment Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['payment'],
					},
				},
				options: [
					{
						name: 'Create Payment Request',
						value: 'createPaymentRequest',
						description: 'Create a new payment request (invoice) and wait for it to be ready',
						action: 'Create a payment request',
					},
					{
						name: 'Get Payment',
						value: 'getPayment',
						description: 'Get an existing payment by ID',
						action: 'Get a payment',
					},
					{
						name: 'Send Payment',
						value: 'sendPayment',
						description: 'Send a payment via Lightning or on-chain',
						action: 'Send a payment',
					},
					{
						name: 'Get All Payments',
						value: 'getPayments',
						description: 'Get all payments with optional filtering',
						action: 'Get all payments',
					},
					{
						name: 'Get Payment History',
						value: 'getPaymentHistory',
						description: 'Get payment event history',
						action: 'Get payment history',
					},
				],
				default: 'createPaymentRequest',
			},
			// Line of Credit Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['lineOfCredit'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all lines of credit',
						action: 'Get all lines of credit',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a specific line of credit by ID',
						action: 'Get a line of credit',
					},
				],
				default: 'getAll',
			},
			// Webhook Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all webhooks',
						action: 'Get all webhooks',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a specific webhook by ID',
						action: 'Get a webhook',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new webhook',
						action: 'Create a webhook',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing webhook',
						action: 'Update a webhook',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a webhook',
						action: 'Delete a webhook',
					},
					{
						name: 'Start',
						value: 'start',
						description: 'Start a webhook',
						action: 'Start a webhook',
					},
					{
						name: 'Stop',
						value: 'stop',
						description: 'Stop a webhook',
						action: 'Stop a webhook',
					},
					{
						name: 'Generate Key',
						value: 'generateKey',
						description: 'Generate a new webhook signing key',
						action: 'Generate webhook key',
					},
				],
				default: 'getAll',
			},
			// Common Organization ID field
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				required: true,
				default: '',
				description: 'The organization ID',
			},
			// Wallet-specific fields
			{
				displayName: 'Wallet ID',
				name: 'walletId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['wallet'],
						operation: ['get', 'getLedger'],
					},
				},
				default: '',
				description: 'The specific wallet ID',
			},
			// Payment Environment ID
			{
				displayName: 'Environment ID',
				name: 'environmentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
					},
				},
				default: '',
				description: 'The environment ID for the payment',
			},
			// Payment ID field
			{
				displayName: 'Payment ID',
				name: 'paymentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['getPayment', 'getPaymentHistory'],
					},
				},
				default: '',
				description: 'The payment ID',
			},
			// Payment Request fields
			{
				displayName: 'Wallet ID',
				name: 'paymentWalletId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['createPaymentRequest'],
					},
				},
				default: '',
				description: 'The wallet ID for the payment request',
			},
			{
				displayName: 'Payment Kind',
				name: 'paymentKind',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['createPaymentRequest'],
					},
				},
				options: [
					{
						name: 'Lightning (Bolt11)',
						value: 'bolt11',
						description: 'Lightning Network payment',
					},
					{
						name: 'On-chain',
						value: 'onchain',
						description: 'Bitcoin on-chain payment',
					},
					{
						name: 'BIP21',
						value: 'bip21',
						description: 'Unified payment (Lightning + On-chain)',
					},
				],
				default: 'bolt11',
				description: 'Type of payment to create',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['createPaymentRequest'],
					},
				},
				options: [
					{
						name: 'BTC',
						value: 'btc',
					},
					{
						name: 'USD',
						value: 'usd',
					},
				],
				default: 'btc',
				description: 'Currency for the payment',
			},
			{
				displayName: 'Amount (millisats)',
				name: 'amountMsats',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['createPaymentRequest'],
					},
				},
				default: '',
				description: 'Amount in millisatoshis. Leave empty for "any amount" invoice.',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['createPaymentRequest'],
					},
				},
				default: '',
				description: 'Description for the payment request',
			},
			// Send Payment fields
			{
				displayName: 'Send Payment Type',
				name: 'sendPaymentType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['sendPayment'],
					},
				},
				options: [
					{
						name: 'Lightning (Bolt11)',
						value: 'bolt11',
						description: 'Pay a Lightning invoice',
					},
					{
						name: 'On-chain',
						value: 'onchain',
						description: 'Send Bitcoin on-chain',
					},
					{
						name: 'BIP21',
						value: 'bip21',
						description: 'Pay using BIP21 URI',
					},
				],
				default: 'bolt11',
				description: 'Type of payment to send',
			},
			{
				displayName: 'Send Wallet ID',
				name: 'sendWalletId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['sendPayment'],
					},
				},
				default: '',
				description: 'The wallet ID to send payment from',
			},
			{
				displayName: 'Lightning Invoice',
				name: 'bolt11Invoice',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['sendPayment'],
						sendPaymentType: ['bolt11'],
					},
				},
				default: '',
				description: 'The Lightning invoice (bolt11) to pay',
			},
			{
				displayName: 'On-chain Address',
				name: 'onchainAddress',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['sendPayment'],
						sendPaymentType: ['onchain'],
					},
				},
				default: '',
				description: 'The Bitcoin address to send to',
			},
			{
				displayName: 'Amount (millisats)',
				name: 'sendAmountMsats',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['sendPayment'],
						sendPaymentType: ['onchain'],
					},
				},
				default: '',
				description: 'Amount to send in millisatoshis',
			},
			{
				displayName: 'BIP21 URI',
				name: 'bip21Uri',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['sendPayment'],
						sendPaymentType: ['bip21'],
					},
				},
				default: '',
				description: 'The BIP21 payment URI',
			},
			// Line of Credit fields
			{
				displayName: 'Line of Credit ID',
				name: 'lineOfCreditId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['lineOfCredit'],
						operation: ['get'],
					},
				},
				default: '',
				description: 'The specific line of credit ID',
			},
			// Webhook fields
			{
				displayName: 'Webhook ID',
				name: 'webhookId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['get', 'update', 'delete', 'start', 'stop', 'generateKey'],
					},
				},
				default: '',
				description: 'The webhook ID',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The URL to send webhook events to',
			},
			{
				displayName: 'Webhook Description',
				name: 'webhookDescription',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				description: 'Description for the webhook',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				displayOptions: {
					show: {
						resource: ['webhook'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						name: 'Send - Created',
						value: 'send.created',
					},
					{
						name: 'Send - Succeeded',
						value: 'send.succeeded',
					},
					{
						name: 'Send - Failed',
						value: 'send.failed',
					},
					{
						name: 'Receive - Created',
						value: 'receive.created',
					},
					{
						name: 'Receive - Paid',
						value: 'receive.paid',
					},
					{
						name: 'Receive - Expired',
						value: 'receive.expired',
					},
					{
						name: 'Test - Event',
						value: 'test.event',
					},
				],
				default: [],
				description: 'Types of events to subscribe to',
			},
			// Filtering and pagination options
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				displayOptions: {
					show: {
						resource: ['payment', 'wallet', 'lineOfCredit', 'webhook'],
						operation: ['getPayments', 'getLedger', 'getAll'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 50,
						description: 'Maximum number of results to return',
					},
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'Number of results to skip',
					},
					{
						displayName: 'Wallet ID Filter',
						name: 'wallet_id',
						type: 'string',
						default: '',
						description: 'Filter by wallet ID',
					},
					{
						displayName: 'Payment Statuses',
						name: 'statuses',
						type: 'multiOptions',
						displayOptions: {
							show: {
								'/resource': ['payment'],
							},
						},
						options: [
							{ name: 'Created', value: 'created' },
							{ name: 'Ready', value: 'ready' },
							{ name: 'Paid', value: 'paid' },
							{ name: 'Failed', value: 'failed' },
							{ name: 'Expired', value: 'expired' },
							{ name: 'Succeeded', value: 'succeeded' },
						],
						default: [],
						description: 'Filter by payment statuses',
					},
					{
						displayName: 'Payment Kind',
						name: 'kind',
						type: 'options',
						displayOptions: {
							show: {
								'/resource': ['payment'],
							},
						},
						options: [
							{ name: 'Lightning (Bolt11)', value: 'bolt11' },
							{ name: 'On-chain', value: 'onchain' },
							{ name: 'BIP21', value: 'bip21' },
						],
						default: '',
						description: 'Filter by payment kind',
					},
					{
						displayName: 'Payment Direction',
						name: 'direction',
						type: 'options',
						displayOptions: {
							show: {
								'/resource': ['payment'],
							},
						},
						options: [
							{ name: 'Send', value: 'send' },
							{ name: 'Receive', value: 'receive' },
						],
						default: '',
						description: 'Filter by payment direction',
					},
					{
						displayName: 'Start Date',
						name: 'start_date',
						type: 'dateTime',
						default: '',
						description: 'Filter results after this date',
					},
					{
						displayName: 'End Date',
						name: 'end_date',
						type: 'dateTime',
						default: '',
						description: 'Filter results before this date',
					},
					{
						displayName: 'Sort Key',
						name: 'sort_key',
						type: 'options',
						options: [
							{ name: 'Created At', value: 'created_at' },
							{ name: 'Updated At', value: 'updated_at' },
						],
						default: 'created_at',
						description: 'Field to sort by',
					},
					{
						displayName: 'Sort Order',
						name: 'sort_order',
						type: 'options',
						options: [
							{ name: 'Ascending', value: 'asc' },
							{ name: 'Descending', value: 'desc' },
						],
						default: 'desc',
						description: 'Sort order',
					},
				],
			},
			// Additional Options for Payment Request
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['createPaymentRequest', 'sendPayment'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Max Polling Attempts',
						name: 'maxAttempts',
						type: 'number',
						default: 30,
						description: 'Maximum number of polling attempts',
					},
					{
						displayName: 'Polling Interval (ms)',
						name: 'intervalMs',
						type: 'number',
						default: 1000,
						description: 'Interval between polling attempts in milliseconds',
					},
					{
						displayName: 'Timeout (ms)',
						name: 'timeoutMs',
						type: 'number',
						default: 30000,
						description: 'Total timeout for polling in milliseconds',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('voltageApi');

		// Initialize Voltage client
		const client = new VoltageClient({
			apiKey: credentials.apiKey as string,
			baseUrl: credentials.baseUrl as string,
			timeout: credentials.timeout as number,
		});

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'wallet') {
					if (operation === 'getAll') {
						// Get all wallets
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

						const params: any = {
							organization_id: organizationId,
						};

						if (filters.limit) params.limit = filters.limit;
						if (filters.offset) params.offset = filters.offset;

						const wallets = await client.getWallets(params);

						if (Array.isArray(wallets)) {
							wallets.forEach((wallet) => {
								returnData.push({
									json: wallet as unknown as IDataObject,
									pairedItem: { item: i },
								});
							});
						} else {
							returnData.push({
								json: wallets as unknown as IDataObject,
								pairedItem: { item: i },
							});
						}
					} else if (operation === 'get') {
						// Get specific wallet
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const walletId = this.getNodeParameter('walletId', i) as string;

						const wallet = await client.getWallet({
							organization_id: organizationId,
							wallet_id: walletId,
						});

						returnData.push({
							json: wallet as unknown as IDataObject,
							pairedItem: { item: i },
						});
					} else if (operation === 'getLedger') {
						// Get wallet ledger
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const walletId = this.getNodeParameter('walletId', i) as string;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

						const params: any = {
							organization_id: organizationId,
							wallet_id: walletId,
						};

						if (filters.limit) params.limit = filters.limit;
						if (filters.offset) params.offset = filters.offset;
						if (filters.start_date)
							params.start_date = new Date(filters.start_date as string).toISOString();
						if (filters.end_date)
							params.end_date = new Date(filters.end_date as string).toISOString();
						if (filters.sort_key) params.sort_key = filters.sort_key;
						if (filters.sort_order) params.sort_order = filters.sort_order;

						const ledger = await client.getWalletLedger(params);

						returnData.push({
							json: ledger as unknown as IDataObject,
							pairedItem: { item: i },
						});
					}
				} else if (resource === 'payment') {
					const organizationId = this.getNodeParameter('organizationId', i) as string;
					const environmentId = this.getNodeParameter('environmentId', i) as string;

					if (operation === 'createPaymentRequest') {
						// Create payment request
						const paymentWalletId = this.getNodeParameter('paymentWalletId', i) as string;
						const paymentKind = this.getNodeParameter('paymentKind', i) as string;
						const currency = this.getNodeParameter('currency', i) as string;
						const amountMsats = this.getNodeParameter('amountMsats', i) as number;
						const description = this.getNodeParameter('description', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

						const paymentData = {
							wallet_id: paymentWalletId,
							currency: currency as 'btc' | 'usd',
							payment_kind: paymentKind as 'bolt11' | 'onchain' | 'bip21',
							amount_msats: amountMsats || null,
							description: description || null,
						};

						const pollingConfig: any = {};
						if (additionalOptions.maxAttempts)
							pollingConfig.maxAttempts = additionalOptions.maxAttempts;
						if (additionalOptions.intervalMs)
							pollingConfig.intervalMs = additionalOptions.intervalMs;
						if (additionalOptions.timeoutMs) pollingConfig.timeoutMs = additionalOptions.timeoutMs;

						const payment = await client.createPaymentRequest(
							{
								organization_id: organizationId,
								environment_id: environmentId,
								payment: paymentData,
							},
							Object.keys(pollingConfig).length > 0 ? pollingConfig : undefined,
						);

						returnData.push({
							json: payment as unknown as IDataObject,
							pairedItem: { item: i },
						});
					} else if (operation === 'getPayment') {
						// Get payment
						const paymentId = this.getNodeParameter('paymentId', i) as string;

						const payment = await client.getPayment({
							organization_id: organizationId,
							environment_id: environmentId,
							payment_id: paymentId,
						});

						returnData.push({
							json: payment as unknown as IDataObject,
							pairedItem: { item: i },
						});
					} else if (operation === 'sendPayment') {
						// Send payment
						const sendPaymentType = this.getNodeParameter('sendPaymentType', i) as string;
						const sendWalletId = this.getNodeParameter('sendWalletId', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

						let paymentData: any = {
							wallet_id: sendWalletId,
						};

						if (sendPaymentType === 'bolt11') {
							const bolt11Invoice = this.getNodeParameter('bolt11Invoice', i) as string;
							paymentData = {
								...paymentData,
								bolt11: bolt11Invoice,
							};
						} else if (sendPaymentType === 'onchain') {
							const onchainAddress = this.getNodeParameter('onchainAddress', i) as string;
							const sendAmountMsats = this.getNodeParameter('sendAmountMsats', i) as number;
							paymentData = {
								...paymentData,
								address: onchainAddress,
								amount_msats: sendAmountMsats,
							};
						} else if (sendPaymentType === 'bip21') {
							const bip21Uri = this.getNodeParameter('bip21Uri', i) as string;
							paymentData = {
								...paymentData,
								bip21: bip21Uri,
							};
						}

						const pollingConfig: any = {};
						if (additionalOptions.maxAttempts)
							pollingConfig.maxAttempts = additionalOptions.maxAttempts;
						if (additionalOptions.intervalMs)
							pollingConfig.intervalMs = additionalOptions.intervalMs;
						if (additionalOptions.timeoutMs) pollingConfig.timeoutMs = additionalOptions.timeoutMs;

						const payment = await client.sendPayment(
							{
								organization_id: organizationId,
								environment_id: environmentId,
								payment: paymentData,
							},
							Object.keys(pollingConfig).length > 0 ? pollingConfig : undefined,
						);

						returnData.push({
							json: payment as unknown as IDataObject,
							pairedItem: { item: i },
						});
					} else if (operation === 'getPayments') {
						// Get all payments with filtering
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

						const params: any = {
							organization_id: organizationId,
							environment_id: environmentId,
						};

						if (filters.limit) params.limit = filters.limit;
						if (filters.offset) params.offset = filters.offset;
						if (filters.wallet_id) params.wallet_id = filters.wallet_id;
						if (
							filters.statuses &&
							Array.isArray(filters.statuses) &&
							filters.statuses.length > 0
						) {
							params.statuses = filters.statuses;
						}
						if (filters.kind) params.kind = filters.kind;
						if (filters.direction) params.direction = filters.direction;
						if (filters.start_date)
							params.start_date = new Date(filters.start_date as string).toISOString();
						if (filters.end_date)
							params.end_date = new Date(filters.end_date as string).toISOString();
						if (filters.sort_key) params.sort_key = filters.sort_key;
						if (filters.sort_order) params.sort_order = filters.sort_order;

						const payments = await client.getPayments(params);

						if (Array.isArray(payments)) {
							payments.forEach((payment) => {
								returnData.push({
									json: payment as unknown as IDataObject,
									pairedItem: { item: i },
								});
							});
						} else {
							returnData.push({
								json: payments as unknown as IDataObject,
								pairedItem: { item: i },
							});
						}
					} else if (operation === 'getPaymentHistory') {
						// Get payment history
						const paymentId = this.getNodeParameter('paymentId', i) as string;

						const history = await client.getPaymentHistory({
							organization_id: organizationId,
							environment_id: environmentId,
							payment_id: paymentId,
						});

						returnData.push({
							json: history as unknown as IDataObject,
							pairedItem: { item: i },
						});
					}
				} else if (resource === 'lineOfCredit') {
					const organizationId = this.getNodeParameter('organizationId', i) as string;

					if (operation === 'getAll') {
						// Get all lines of credit
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

						const params: any = {
							organization_id: organizationId,
						};

						if (filters.limit) params.limit = filters.limit;
						if (filters.offset) params.offset = filters.offset;

						const linesOfCredit = await client.getLinesOfCredit(params);

						if (Array.isArray(linesOfCredit)) {
							linesOfCredit.forEach((loc) => {
								returnData.push({
									json: loc as unknown as IDataObject,
									pairedItem: { item: i },
								});
							});
						} else {
							returnData.push({
								json: linesOfCredit as unknown as IDataObject,
								pairedItem: { item: i },
							});
						}
					} else if (operation === 'get') {
						// Get specific line of credit
						const lineOfCreditId = this.getNodeParameter('lineOfCreditId', i) as string;

						const lineOfCredit = await client.getLineOfCredit({
							organization_id: organizationId,
							line_id: lineOfCreditId,
						});

						returnData.push({
							json: lineOfCredit as unknown as IDataObject,
							pairedItem: { item: i },
						});
					}
				} else if (resource === 'webhook') {
					const organizationId = this.getNodeParameter('organizationId', i) as string;

					if (operation === 'getAll') {
						// Get all webhooks
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;

						const params: any = {
							organization_id: organizationId,
						};

						if (filters.limit) params.limit = filters.limit;
						if (filters.offset) params.offset = filters.offset;

						const webhooks = await client.getWebhooks(params);

						if (Array.isArray(webhooks)) {
							webhooks.forEach((webhook) => {
								returnData.push({
									json: webhook as unknown as IDataObject,
									pairedItem: { item: i },
								});
							});
						} else {
							returnData.push({
								json: webhooks as unknown as IDataObject,
								pairedItem: { item: i },
							});
						}
					} else if (operation === 'get') {
						// Get specific webhook
						const webhookId = this.getNodeParameter('webhookId', i) as string;

						const webhook = await client.getWebhook({
							organization_id: organizationId,
							webhook_id: webhookId,
						});

						returnData.push({
							json: webhook as unknown as IDataObject,
							pairedItem: { item: i },
						});
					} else if (operation === 'create') {
						// Create webhook
						const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;
						const webhookDescription = this.getNodeParameter('webhookDescription', i, '') as string;
						const eventTypes = this.getNodeParameter('eventTypes', i, []) as string[];

						const webhookData: any = {
							url: webhookUrl,
							event_types: eventTypes,
						};

						if (webhookDescription) {
							webhookData.description = webhookDescription;
						}

						const webhook = await client.createWebhook({
							organization_id: organizationId,
							webhook: webhookData,
						});

						returnData.push({
							json: webhook as unknown as IDataObject,
							pairedItem: { item: i },
						});
					} else if (operation === 'update') {
						// Update webhook
						const webhookId = this.getNodeParameter('webhookId', i) as string;
						const webhookUrl = this.getNodeParameter('webhookUrl', i, '') as string;
						const webhookDescription = this.getNodeParameter('webhookDescription', i, '') as string;
						const eventTypes = this.getNodeParameter('eventTypes', i, []) as string[];

						const updateData: any = {};

						if (webhookUrl) updateData.url = webhookUrl;
						if (webhookDescription) updateData.description = webhookDescription;
						if (eventTypes.length > 0) updateData.event_types = eventTypes;

						const webhook = await client.updateWebhook({
							organization_id: organizationId,
							webhook_id: webhookId,
							webhook: updateData,
						});

						returnData.push({
							json: webhook as unknown as IDataObject,
							pairedItem: { item: i },
						});
					} else if (operation === 'delete') {
						// Delete webhook
						const webhookId = this.getNodeParameter('webhookId', i) as string;

						await client.deleteWebhook({
							organization_id: organizationId,
							webhook_id: webhookId,
						});

						returnData.push({
							json: { success: true, message: 'Webhook deleted successfully' },
							pairedItem: { item: i },
						});
					} else if (operation === 'start') {
						// Start webhook
						const webhookId = this.getNodeParameter('webhookId', i) as string;

						const webhook = await client.startWebhook({
							organization_id: organizationId,
							webhook_id: webhookId,
						});

						returnData.push({
							json: webhook as unknown as IDataObject,
							pairedItem: { item: i },
						});
					} else if (operation === 'stop') {
						// Stop webhook
						const webhookId = this.getNodeParameter('webhookId', i) as string;

						const webhook = await client.stopWebhook({
							organization_id: organizationId,
							webhook_id: webhookId,
						});

						returnData.push({
							json: webhook as unknown as IDataObject,
							pairedItem: { item: i },
						});
					} else if (operation === 'generateKey') {
						// Generate webhook key
						const webhookId = this.getNodeParameter('webhookId', i) as string;

						const webhookSecret = await client.generateWebhookKey({
							organization_id: organizationId,
							webhook_id: webhookId,
						});

						returnData.push({
							json: webhookSecret as unknown as IDataObject,
							pairedItem: { item: i },
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					let errorMessage = error instanceof Error ? error.message : String(error);
					let errorDetails: any = {};

					// Enhanced error details for better debugging
					if (error && typeof error === 'object') {
						errorDetails = {
							status: (error as any).status,
							statusText: (error as any).statusText,
							code: (error as any).code,
							details: (error as any).details,
							originalError: error,
						};

						// For HTTP errors, try to extract more information
						if ((error as any).status) {
							const status = (error as any).status;

							if (status === 422) {
								errorMessage = `Validation Error (422): The request data is invalid. Please check your parameters.`;
							} else if (status === 401) {
								errorMessage = `Authentication Error (401): Invalid API key or credentials.`;
							} else if (status === 403) {
								errorMessage = `Permission Error (403): Access denied. Check your API key permissions.`;
							} else if (status === 404) {
								errorMessage = `Not Found (404): Organization, environment, or resource not found.`;
							} else if (status >= 500) {
								errorMessage = `Server Error (${status}): The Voltage API is experiencing issues.`;
							}
						}

						// Provide more helpful message for JSON parsing errors
						if (errorMessage === 'Failed to parse response as JSON') {
							errorMessage = `API returned non-JSON response (Status: ${(error as any).status}). Check your API credentials and organization ID.`;
						}
					}

					returnData.push({
						json: {
							error: errorMessage,
							errorDetails,
						},
						pairedItem: { item: i },
					});
					continue;
				}

				// Enhanced error message for better debugging
				let enhancedError = error;
				if (error && typeof error === 'object') {
					const apiError = error as any;

					if (apiError.status === 422) {
						enhancedError = new Error(
							`Voltage API Validation Error (422): ${JSON.stringify(
								{
									status: apiError.status,
									message: 'Validation Error: The request data is invalid',
									resource,
									operation,
								},
								null,
								2,
							)}`,
						);
					} else if (apiError.message === 'Failed to parse response as JSON') {
						enhancedError = new Error(
							`Voltage API returned non-JSON response (Status: ${apiError.status}). This usually indicates an authentication issue or invalid organization ID. Please check your API credentials and organization ID.`,
						);
					}
				}

				throw new NodeOperationError(
					this.getNode(),
					enhancedError instanceof Error ? enhancedError : new Error(String(enhancedError)),
					{
						itemIndex: i,
					},
				);
			}
		}

		return [returnData];
	}
}
