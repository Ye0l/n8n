import {
	OPENCODE_GO_SESSION_HEADER,
	isOpenCodeGoEndpoint,
	withOpenCodeGoSession,
} from '../opencode-go-session';

describe('isOpenCodeGoEndpoint', () => {
	it('accepts OpenCode Go base URLs', () => {
		expect(isOpenCodeGoEndpoint('https://opencode.ai/zen/go/v1')).toBe(true);
		expect(isOpenCodeGoEndpoint('https://OpenCode.ai/zen/go')).toBe(true);
	});

	it('rejects other and invalid URLs', () => {
		expect(isOpenCodeGoEndpoint('https://opencode.ai/zen/v1')).toBe(false);
		expect(isOpenCodeGoEndpoint('https://opencode.ai/zen/golang/v1')).toBe(false);
		expect(isOpenCodeGoEndpoint('https://api.deepseek.com/v1')).toBe(false);
		expect(isOpenCodeGoEndpoint('')).toBe(false);
		expect(isOpenCodeGoEndpoint(undefined)).toBe(false);
		expect(isOpenCodeGoEndpoint('not-a-url')).toBe(false);
	});
});

describe('withOpenCodeGoSession', () => {
	const config = {
		id: 'custom/deepseek-v4' as const,
		url: 'https://opencode.ai/zen/go/v1',
		apiKey: 'sk-test',
	};

	it('adds the session header for OpenCode Go configs', () => {
		expect(withOpenCodeGoSession(config, 'thread-abc')).toEqual({
			...config,
			headers: { [OPENCODE_GO_SESSION_HEADER]: 'thread-abc' },
		});
	});

	it('keeps other headers and replaces a prior session header in any case', () => {
		const withHeaders = {
			...config,
			headers: { 'X-Custom': 'value', 'X-OpenCode-Session': 'old-thread' },
		};
		expect(withOpenCodeGoSession(withHeaders, 'thread-new')).toEqual({
			...config,
			headers: { 'X-Custom': 'value', [OPENCODE_GO_SESSION_HEADER]: 'thread-new' },
		});
	});

	it('returns the same reference when the session id is already set', () => {
		const sticky = withOpenCodeGoSession(config, 'thread-abc');
		expect(withOpenCodeGoSession(sticky, 'thread-abc')).toBe(sticky);
	});

	it('is a no-op for other endpoints and non-endpoint configs', () => {
		const other = { ...config, url: 'https://api.deepseek.com/v1' };
		expect(withOpenCodeGoSession(other, 'thread-abc')).toBe(other);
		expect(withOpenCodeGoSession('anthropic/claude-opus-4-8', 'thread-abc')).toBe(
			'anthropic/claude-opus-4-8',
		);
		expect(withOpenCodeGoSession(config, '   ')).toBe(config);
	});
});
