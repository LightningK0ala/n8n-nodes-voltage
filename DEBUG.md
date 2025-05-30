# Debugging Payment Creation Issues

If you're getting errors when creating payment requests in n8n, here's how to debug them:

## Enhanced Error Messages

The n8n node now provides much more detailed error information, including:

- **HTTP Status Codes**: 422 (validation), 401 (auth), 403 (permissions), 404 (not found), 500+ (server errors)
- **Request Data**: The exact data that was sent to the API for debugging
- **Detailed Error Information**: Original error details from the Voltage API

## Common Issues and Solutions

### 422 Validation Error

This means the request data is invalid. Check:

1. **Organization ID**: Make sure it's correct and you have access
2. **Environment ID**: Verify this environment exists in your organization
3. **Wallet ID**: Ensure the wallet exists in the specified environment
4. **Payment Kind**: Must be exactly `bolt11`, `onchain`, or `bip21`
5. **Currency**: Must be exactly `btc` or `usd`
6. **Amount**: For Lightning (`bolt11`), amount should be in millisatoshis (1 sat = 1000 msats)

### 401 Authentication Error

- Check your API key is correct and starts with `vltg_`
- Verify the base URL is correct (usually `https://voltageapi.com/v1`)

### 404 Not Found Error

- Organization ID doesn't exist or you don't have access
- Environment ID doesn't exist in the organization
- Wallet ID doesn't exist in the environment

## Debug Script

Use the included `debug-test.js` script to test payment creation directly:

1. Set environment variables:

   ```bash
   export VOLTAGE_API_KEY="your_api_key_here"
   export VOLTAGE_ORG_ID="your_org_id_here"
   export VOLTAGE_ENV_ID="your_env_id_here"
   export VOLTAGE_WALLET_ID="your_wallet_id_here"
   ```

2. Run the debug script:
   ```bash
   node debug-test.js
   ```

This will test the exact same API call that n8n makes and show detailed error information.

## Example Error Output

With the improved error handling, you'll now see errors like:

```json
{
	"error": "Validation Error (422): The request data is invalid. Please check your parameters.",
	"errorDetails": {
		"status": 422,
		"statusText": "Unprocessable Entity",
		"requestData": {
			"organization_id": "your-org-id",
			"environment_id": "your-env-id",
			"payment": {
				"wallet_id": "invalid-wallet-id",
				"currency": "btc",
				"payment_kind": "bolt11",
				"amount_msats": 150000,
				"description": "Test payment"
			}
		}
	}
}
```

This makes it much easier to identify exactly what's wrong with your request.
