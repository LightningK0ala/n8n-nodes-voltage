import { Voltage } from '../nodes/Voltage/Voltage.node';

describe('Voltage Node Features', () => {
	let voltageNode: Voltage;

	beforeEach(() => {
		voltageNode = new Voltage();
	});

	describe('Node Description', () => {
		it('should have all resources defined', () => {
			const resourceProperty = voltageNode.description.properties.find(
				(prop) => prop.name === 'resource',
			);

			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');
			expect(resourceProperty?.options).toEqual([
				{ name: 'Wallet', value: 'wallet' },
				{ name: 'Payment', value: 'payment' },
				{ name: 'Line of Credit', value: 'lineOfCredit' },
				{ name: 'Webhook', value: 'webhook' },
			]);
		});

		it('should have wallet operations defined', () => {
			const walletOperations = voltageNode.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('wallet'),
			);

			expect(walletOperations).toBeDefined();
			expect(walletOperations?.type).toBe('options');
			expect(walletOperations?.options).toHaveLength(3);

			const operationValues = (walletOperations?.options as any[])?.map((op) => op.value);
			expect(operationValues).toContain('getAll');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('getLedger');
		});

		it('should have payment operations defined', () => {
			const paymentOperations = voltageNode.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('payment'),
			);

			expect(paymentOperations).toBeDefined();
			expect(paymentOperations?.type).toBe('options');
			expect(paymentOperations?.options).toHaveLength(5);

			const operationValues = (paymentOperations?.options as any[])?.map((op) => op.value);
			expect(operationValues).toContain('createPaymentRequest');
			expect(operationValues).toContain('getPayment');
			expect(operationValues).toContain('sendPayment');
			expect(operationValues).toContain('getPayments');
			expect(operationValues).toContain('getPaymentHistory');
		});

		it('should have line of credit operations defined', () => {
			const lineOfCreditOperations = voltageNode.description.properties.find(
				(prop) =>
					prop.name === 'operation' &&
					prop.displayOptions?.show?.resource?.includes('lineOfCredit'),
			);

			expect(lineOfCreditOperations).toBeDefined();
			expect(lineOfCreditOperations?.type).toBe('options');
			expect(lineOfCreditOperations?.options).toHaveLength(2);

			const operationValues = (lineOfCreditOperations?.options as any[])?.map((op) => op.value);
			expect(operationValues).toContain('getAll');
			expect(operationValues).toContain('get');
		});

		it('should have webhook operations defined', () => {
			const webhookOperations = voltageNode.description.properties.find(
				(prop) =>
					prop.name === 'operation' && prop.displayOptions?.show?.resource?.includes('webhook'),
			);

			expect(webhookOperations).toBeDefined();
			expect(webhookOperations?.type).toBe('options');
			expect(webhookOperations?.options).toHaveLength(8);

			const operationValues = (webhookOperations?.options as any[])?.map((op) => op.value);
			expect(operationValues).toContain('getAll');
			expect(operationValues).toContain('get');
			expect(operationValues).toContain('create');
			expect(operationValues).toContain('update');
			expect(operationValues).toContain('delete');
			expect(operationValues).toContain('start');
			expect(operationValues).toContain('stop');
			expect(operationValues).toContain('generateKey');
		});

		it('should have send payment type options', () => {
			const sendPaymentTypeField = voltageNode.description.properties.find(
				(prop) => prop.name === 'sendPaymentType',
			);

			expect(sendPaymentTypeField).toBeDefined();
			expect(sendPaymentTypeField?.type).toBe('options');
			expect(sendPaymentTypeField?.options).toHaveLength(3);

			const typeValues = (sendPaymentTypeField?.options as any[])?.map((op) => op.value);
			expect(typeValues).toContain('bolt11');
			expect(typeValues).toContain('onchain');
			expect(typeValues).toContain('bip21');
		});

		it('should have event types for webhooks', () => {
			const eventTypesField = voltageNode.description.properties.find(
				(prop) => prop.name === 'eventTypes',
			);

			expect(eventTypesField).toBeDefined();
			expect(eventTypesField?.type).toBe('multiOptions');
			expect(eventTypesField?.options).toHaveLength(7);

			const eventValues = (eventTypesField?.options as any[])?.map((op) => op.value);
			expect(eventValues).toContain('send.created');
			expect(eventValues).toContain('send.succeeded');
			expect(eventValues).toContain('send.failed');
			expect(eventValues).toContain('receive.created');
			expect(eventValues).toContain('receive.paid');
			expect(eventValues).toContain('receive.expired');
			expect(eventValues).toContain('test.event');
		});

		it('should have comprehensive filtering options', () => {
			const filtersField = voltageNode.description.properties.find(
				(prop) => prop.name === 'filters',
			);

			expect(filtersField).toBeDefined();
			expect(filtersField?.type).toBe('collection');
			expect(filtersField?.options).toBeDefined();
			expect(Array.isArray(filtersField?.options)).toBe(true);
			expect((filtersField?.options as any[])?.length).toBeGreaterThan(5);
		});

		it('should have additional options for polling', () => {
			const additionalOptionsField = voltageNode.description.properties.find(
				(prop) => prop.name === 'additionalOptions',
			);

			expect(additionalOptionsField).toBeDefined();
			expect(additionalOptionsField?.type).toBe('collection');
			expect(additionalOptionsField?.options).toBeDefined();
			expect(Array.isArray(additionalOptionsField?.options)).toBe(true);
			expect((additionalOptionsField?.options as any[])?.length).toBe(3);
		});
	});

	describe('Node Properties', () => {
		it('should have correct node metadata', () => {
			expect(voltageNode.description.displayName).toBe('Voltage');
			expect(voltageNode.description.name).toBe('voltage');
			expect(voltageNode.description.version).toBe(1);
			expect(voltageNode.description.description).toBe('Interact with Voltage API');
		});

		it('should require voltageApi credentials', () => {
			expect(voltageNode.description.credentials).toEqual([
				{
					name: 'voltageApi',
					required: true,
				},
			]);
		});

		it('should have proper input/output configuration', () => {
			expect(voltageNode.description.inputs).toEqual(['main']);
			expect(voltageNode.description.outputs).toEqual(['main']);
		});
	});

	describe('Field Validation', () => {
		it('should have required fields properly configured', () => {
			const properties = voltageNode.description.properties;

			// Organization ID should be required
			const orgIdField = properties.find((prop) => prop.name === 'organizationId');
			expect(orgIdField?.required).toBe(true);

			// Environment ID should be required for payments
			const envIdField = properties.find((prop) => prop.name === 'environmentId');
			expect(envIdField?.required).toBe(true);
			expect(envIdField?.displayOptions?.show?.resource).toEqual(['payment']);

			// Wallet ID should be required for specific wallet operations
			const walletIdField = properties.find((prop) => prop.name === 'walletId');
			expect(walletIdField?.required).toBe(true);
			expect(walletIdField?.displayOptions?.show?.resource).toEqual(['wallet']);
			expect(walletIdField?.displayOptions?.show?.operation).toEqual(['get', 'getLedger']);

			// Send Wallet ID should be required for send payment
			const sendWalletIdField = properties.find((prop) => prop.name === 'sendWalletId');
			expect(sendWalletIdField?.required).toBe(true);
			expect(sendWalletIdField?.displayOptions?.show?.operation).toEqual(['sendPayment']);

			// Webhook URL should be required for webhook creation
			const webhookUrlField = properties.find((prop) => prop.name === 'webhookUrl');
			expect(webhookUrlField?.required).toBe(true);
			expect(webhookUrlField?.displayOptions?.show?.operation).toEqual(['create']);
		});

		it('should have conditional field display logic', () => {
			const properties = voltageNode.description.properties;

			// Lightning invoice should only show for bolt11 send payments
			const bolt11Field = properties.find((prop) => prop.name === 'bolt11Invoice');
			expect(bolt11Field?.displayOptions?.show?.sendPaymentType).toEqual(['bolt11']);

			// On-chain address should only show for onchain send payments
			const onchainField = properties.find((prop) => prop.name === 'onchainAddress');
			expect(onchainField?.displayOptions?.show?.sendPaymentType).toEqual(['onchain']);

			// BIP21 URI should only show for bip21 send payments
			const bip21Field = properties.find((prop) => prop.name === 'bip21Uri');
			expect(bip21Field?.displayOptions?.show?.sendPaymentType).toEqual(['bip21']);
		});
	});

	describe('Feature Coverage', () => {
		it('should support all major Voltage API features', () => {
			const properties = voltageNode.description.properties;

			// Check that we have fields for all major features
			const fieldNames = properties.map((prop) => prop.name);

			// Wallet features
			expect(fieldNames).toContain('walletId');

			// Payment features
			expect(fieldNames).toContain('paymentId');
			expect(fieldNames).toContain('sendPaymentType');
			expect(fieldNames).toContain('bolt11Invoice');
			expect(fieldNames).toContain('onchainAddress');
			expect(fieldNames).toContain('bip21Uri');

			// Line of credit features
			expect(fieldNames).toContain('lineOfCreditId');

			// Webhook features
			expect(fieldNames).toContain('webhookId');
			expect(fieldNames).toContain('webhookUrl');
			expect(fieldNames).toContain('eventTypes');

			// Filtering and pagination
			expect(fieldNames).toContain('filters');
			expect(fieldNames).toContain('additionalOptions');
		});
	});
});
