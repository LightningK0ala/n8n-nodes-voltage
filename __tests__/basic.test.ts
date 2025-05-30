describe('Basic Tests', () => {
	test('should pass basic test', () => {
		expect(true).toBe(true);
	});

	test('should have proper package structure', () => {
		const packageJson = require('../package.json');
		expect(packageJson.name).toBe('n8n-nodes-voltage');
		expect(packageJson.version).toBeDefined();
		expect(packageJson.n8n).toBeDefined();
		expect(packageJson.n8n.credentials).toHaveLength(1);
		expect(packageJson.n8n.nodes).toHaveLength(1);
	});
});
