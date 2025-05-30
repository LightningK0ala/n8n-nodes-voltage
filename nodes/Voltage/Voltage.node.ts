import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';

import { VoltageClient, type VoltageApiConfig } from 'voltage-api-sdk';

export class Voltage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Voltage',
		name: 'voltage',
		icon: 'file:voltage.svg',
		group: ['ai', 'transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Bitcoin Lightning Network operations via Voltage API - compatible with AI agents',
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
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new wallet',
						action: 'Create a wallet',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a wallet',
						action: 'Delete a wallet',
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
				description: 'The organization ID to operate on',
			},
			{
				displayName: 'Wallet ID',
				name: 'walletId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['get', 'delete'],
					},
				},
				default: '',
				description: 'The specific wallet ID',
			},
			{
				displayName: 'Wallet Details',
				name: 'walletDetails',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				default:
					'{\n  "name": "My Wallet",\n  "network": "mainnet",\n  "environment_id": "env_id",\n  "line_of_credit_id": "loc_id"\n}',
				description: 'Wallet creation details',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Get credentials
		const credentials = await this.getCredentials('voltageApi');

		// Initialize Voltage client with proper typing
		const client = new VoltageClient({
			apiKey: credentials.apiKey as string,
			// baseUrl: credentials.baseUrl as string, // Uncomment if custom baseUrl is needed
		} as VoltageApiConfig);

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
					} else if (operation === 'create') {
						// Create a new wallet
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const walletDetails = this.getNodeParameter('walletDetails', i) as IDataObject;

						await client.createWallet({
							organization_id: organizationId,
							wallet: walletDetails as any, // Type assertion for wallet details
						});

						returnData.push({
							json: {
								message: 'Wallet creation initiated successfully',
								organization_id: organizationId,
								wallet_details: walletDetails,
							},
							pairedItem: {
								item: i,
							},
						});
					} else if (operation === 'delete') {
						// Delete a wallet
						const organizationId = this.getNodeParameter('organizationId', i) as string;
						const walletId = this.getNodeParameter('walletId', i) as string;

						await client.deleteWallet({
							organization_id: organizationId,
							wallet_id: walletId,
						});

						returnData.push({
							json: {
								message: 'Wallet deleted successfully',
							},
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
						// Provide more helpful messages for different operations
						if (errorMessage === 'Failed to parse response as JSON') {
							if (resource === 'wallet') {
								errorMessage = `Wallet operation failed (Status: ${(error as any).status}). Check wallet ID and organization ID.`;
							}
						}
					}

					returnData.push({
						json: {
							error: errorMessage,
							errorDetails,
							operation: `${resource}:${operation}`,
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
					if (resource === 'wallet') {
						enhancedError = new Error(
							`Wallet operation failed (Status: ${apiError.status}). This usually indicates an authentication issue or invalid organization ID. Please check your API credentials and organization ID.`,
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
