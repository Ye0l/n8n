import type { ModelConfig } from '../types';
import { isEndpointModelConfig } from './modal-session';

/** OpenCode Go rejects requests without this header. It must stay stable for one conversation. */
export const OPENCODE_GO_SESSION_HEADER = 'x-opencode-session';

export function isOpenCodeGoEndpoint(url: string | undefined): boolean {
	if (!url?.trim()) return false;
	try {
		const { hostname, pathname } = new URL(url);
		return hostname.toLowerCase() === 'opencode.ai' && /^\/zen\/go(\/|$)/.test(pathname);
	} catch {
		return false;
	}
}

export function withOpenCodeGoSession(modelId: ModelConfig, sessionId: string): ModelConfig {
	const trimmedSessionId = sessionId.trim();
	if (!trimmedSessionId || !isEndpointModelConfig(modelId)) return modelId;
	if (!isOpenCodeGoEndpoint(modelId.url)) return modelId;

	const headers = Object.fromEntries(
		Object.entries(modelId.headers ?? {}).filter(
			([name]) => name.toLowerCase() !== OPENCODE_GO_SESSION_HEADER,
		),
	);
	if (modelId.headers?.[OPENCODE_GO_SESSION_HEADER] === trimmedSessionId) return modelId;

	return {
		...modelId,
		headers: { ...headers, [OPENCODE_GO_SESSION_HEADER]: trimmedSessionId },
	};
}
