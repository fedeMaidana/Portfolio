export function logError(context: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[${context}] ${message}`);
}

export async function withFallback<T>(
    context: string,
    fn: () => Promise<T>,
    fallback: T
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        logError(context, error);
        return fallback;
    }
}
