import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
	IDataObject,
} from 'n8n-workflow';

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

		// Dynamically import the voltage-api-sdk to handle ES module compatibility
		const { VoltageClient } = await import('voltage-api-sdk');

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
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw new NodeOperationError(
					this.getNode(),
					error instanceof Error ? error : new Error(String(error)),
					{
						itemIndex: i,
					},
				);
			}
		}

		return [returnData];
	}
}
