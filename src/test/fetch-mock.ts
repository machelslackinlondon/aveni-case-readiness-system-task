type FetchExpectation = {
  url: string;
  method?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseBody: unknown;
  status?: number;
};

const originalFetch = globalThis.fetch;

export function installFetchMock(expectations: FetchExpectation[]) {
  const remainingExpectations = [...expectations];
  const fetchMock = jest.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const expectation = remainingExpectations.shift();

      if (expectation === undefined) {
        throw new Error(`Unexpected fetch request: ${String(input)}`);
      }

      const url = typeof input === "string" || input instanceof URL
        ? String(input)
        : input.url;
      const method = init?.method ?? "GET";

      expect(url).toBe(expectation.url);
      expect(method).toBe(expectation.method ?? "GET");

      if (expectation.requestHeaders !== undefined) {
        const headers = init?.headers as Record<string, string> | undefined;

        for (const [name, value] of Object.entries(
          expectation.requestHeaders,
        )) {
          expect(headers?.[name]).toBe(value);
        }
      }

      if (expectation.requestBody !== undefined) {
        expect(JSON.parse(String(init?.body))).toEqual(
          expectation.requestBody,
        );
      }

      const status = expectation.status ?? 200;

      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => expectation.responseBody,
      } as Response;
    },
  );

  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    writable: true,
    value: fetchMock,
  });

  return fetchMock;
}

export function restoreFetch() {
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    writable: true,
    value: originalFetch,
  });
}
