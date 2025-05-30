const { VoltageClient } = require('voltage-api-sdk');

// Debug script to test payment creation directly
async function debugPaymentCreation() {
	console.log('Debug: Testing payment creation with voltage-api-sdk');

	// These should be replaced with actual values for testing
	const config = {
		apiKey: process.env.VOLTAGE_API_KEY || 'your-api-key-here',
		baseUrl: 'https://voltageapi.com/v1', // or your custom base URL
	};

	const organizationId = process.env.VOLTAGE_ORG_ID || 'your-org-id-here';
	const environmentId = process.env.VOLTAGE_ENV_ID || 'your-env-id-here';
	const walletId = process.env.VOLTAGE_WALLET_ID || 'your-wallet-id-here';

	console.log('Debug: Configuration:', {
		hasApiKey: !!config.apiKey && config.apiKey !== 'your-api-key-here',
		baseUrl: config.baseUrl,
		organizationId: organizationId !== 'your-org-id-here' ? organizationId : '[NOT SET]',
		environmentId: environmentId !== 'your-env-id-here' ? environmentId : '[NOT SET]',
		walletId: walletId !== 'your-wallet-id-here' ? walletId : '[NOT SET]',
	});

	if (
		config.apiKey === 'your-api-key-here' ||
		organizationId === 'your-org-id-here' ||
		environmentId === 'your-env-id-here' ||
		walletId === 'your-wallet-id-here'
	) {
		console.log('\n❌ Please set the following environment variables:');
		console.log('   VOLTAGE_API_KEY=your_actual_api_key');
		console.log('   VOLTAGE_ORG_ID=your_actual_org_id');
		console.log('   VOLTAGE_ENV_ID=your_actual_env_id');
		console.log('   VOLTAGE_WALLET_ID=your_actual_wallet_id');
		console.log('\nOr edit this script to hardcode the values for testing.');
		return;
	}

	try {
		const client = new VoltageClient(config);
		console.log('Debug: VoltageClient created successfully');

		// Test the exact same payload that n8n would send
		const paymentData = {
			// id is optional - SDK will auto-generate
			wallet_id: walletId,
			currency: 'btc',
			payment_kind: 'bolt11',
			amount_msats: 150000, // 150 sats
			description: 'Debug test payment',
		};

		console.log('Debug: Payment data:', JSON.stringify(paymentData, null, 2));

		const requestParams = {
			organization_id: organizationId,
			environment_id: environmentId,
			payment: paymentData,
		};

		console.log('Debug: Full request params:', JSON.stringify(requestParams, null, 2));

		console.log('Debug: Calling createPaymentRequest...');
		const payment = await client.createPaymentRequest(requestParams);

		console.log('✅ Success! Payment created:', {
			id: payment.id,
			status: payment.status,
			payment_request: payment.payment_request ? 'Generated' : 'None',
			address: payment.address ? 'Generated' : 'None',
		});
	} catch (error) {
		console.log('\n❌ Error occurred:');
		console.log('Error type:', error.constructor.name);
		console.log('Error message:', error.message);

		if (error.status) {
			console.log('HTTP Status:', error.status);
		}

		if (error.details) {
			console.log('Error details:', JSON.stringify(error.details, null, 2));
		}

		console.log('\nFull error object:', error);
	}
}

// Run the debug function
debugPaymentCreation().catch(console.error);
