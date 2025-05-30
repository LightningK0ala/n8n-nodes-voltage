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
				],
				default: 'wallet',
			},
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
				],
				default: 'getAll',
			},
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
				],
				default: 'createPaymentRequest',
			},
			{
				displayName: 'Organization ID',
				name: 'organizationId',
				type: 'string',
				required: true,
				default: '',
				description: 'The organization ID to get wallets from',
			},
			{
				displayName: 'Wallet ID',
				name: 'walletId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
				default: '',
				description: 'The specific wallet ID to retrieve',
			},
			// Payment fields
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
			{
				displayName: 'Payment ID',
				name: 'paymentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['getPayment'],
					},
				},
				default: '',
				description: 'The payment ID to retrieve',
			},
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
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				displayOptions: {
					show: {
						resource: ['payment'],
						operation: ['createPaymentRequest'],
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

						const wallets = await client.getWallets({
							organization_id: organizationId,
						});

						if (Array.isArray(wallets)) {
							wallets.forEach((wallet) => {
								returnData.push({
									json: wallet as unknown as IDataObject,
									pairedItem: {
										item: i,
									},
								});
							});
						} else {
							returnData.push({
								json: wallets as unknown as IDataObject,
								pairedItem: {
									item: i,
								},
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
							pairedItem: {
								item: i,
							},
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
							// id is optional - SDK will auto-generate if not provided
							wallet_id: paymentWalletId,
							currency: currency as 'btc' | 'usd',
							payment_kind: paymentKind as 'bolt11' | 'onchain' | 'bip21',
							amount_msats: amountMsats || null,
							description: description || null,
						};

						// Build polling config if provided
						const pollingConfig: any = {};
						if (additionalOptions.maxAttempts) {
							pollingConfig.maxAttempts = additionalOptions.maxAttempts;
						}
						if (additionalOptions.intervalMs) {
							pollingConfig.intervalMs = additionalOptions.intervalMs;
						}
						if (additionalOptions.timeoutMs) {
							pollingConfig.timeoutMs = additionalOptions.timeoutMs;
						}

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
							pairedItem: {
								item: i,
							},
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
							pairedItem: {
								item: i,
							},
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

								// Add the request data that was sent for debugging
								if (resource === 'payment' && operation === 'createPaymentRequest') {
									const paymentWalletId = this.getNodeParameter('paymentWalletId', i) as string;
									const paymentKind = this.getNodeParameter('paymentKind', i) as string;
									const currency = this.getNodeParameter('currency', i) as string;
									const amountMsats = this.getNodeParameter('amountMsats', i) as number;
									const description = this.getNodeParameter('description', i) as string;
									const organizationId = this.getNodeParameter('organizationId', i) as string;
									const environmentId = this.getNodeParameter('environmentId', i) as string;

									errorDetails.requestData = {
										organization_id: organizationId,
										environment_id: environmentId,
										payment: {
											wallet_id: paymentWalletId,
											currency: currency,
											payment_kind: paymentKind,
											amount_msats: amountMsats || null,
											description: description || null,
										},
									};
								}
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
						pairedItem: {
							item: i,
						},
					});
					continue;
				}

				// Enhanced error message for better debugging
				let enhancedError = error;
				if (error && typeof error === 'object') {
					const apiError = error as any;

					if (apiError.status === 422) {
						const debugInfo: any = {
							status: apiError.status,
							message: 'Validation Error: The request data is invalid',
						};

						// Add request data for debugging
						if (resource === 'payment' && operation === 'createPaymentRequest') {
							const paymentWalletId = this.getNodeParameter('paymentWalletId', i) as string;
							const paymentKind = this.getNodeParameter('paymentKind', i) as string;
							const currency = this.getNodeParameter('currency', i) as string;
							const amountMsats = this.getNodeParameter('amountMsats', i) as number;
							const description = this.getNodeParameter('description', i) as string;
							const organizationId = this.getNodeParameter('organizationId', i) as string;
							const environmentId = this.getNodeParameter('environmentId', i) as string;

							debugInfo.requestData = {
								organization_id: organizationId,
								environment_id: environmentId,
								payment: {
									wallet_id: paymentWalletId,
									currency: currency,
									payment_kind: paymentKind,
									amount_msats: amountMsats || null,
									description: description || null,
								},
							};
						}

						enhancedError = new Error(
							`Voltage API Validation Error (422): ${JSON.stringify(debugInfo, null, 2)}`,
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
