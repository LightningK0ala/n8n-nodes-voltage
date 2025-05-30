import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';

declare const require: any;

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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('voltageApi');

		// Import the voltage-api-sdk CommonJS version directly
		const { VoltageClient } = require('voltage-api-sdk');

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
				}
			} catch (error) {
				if (this.continueOnFail()) {
					let errorMessage = error instanceof Error ? error.message : String(error);
					let errorDetails: any = {};

					// Check if it's a VoltageApiError with more details
					if (error && typeof error === 'object' && 'status' in error) {
						errorDetails = {
							status: (error as any).status,
							code: (error as any).code,
							details: (error as any).details,
						};
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
				if (
					error &&
					typeof error === 'object' &&
					'message' in error &&
					(error as any).message === 'Failed to parse response as JSON'
				) {
					const apiError = error as any;
					enhancedError = new Error(
						`Voltage API returned non-JSON response (Status: ${apiError.status}). This usually indicates an authentication issue or invalid organization ID. Please check your API credentials and organization ID.`,
					);
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
