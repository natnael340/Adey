class APIError extends Error {
  constructor(backendMessage: { [key: string]: string }) {
    super(JSON.stringify(backendMessage));
  }
}

export { APIError };
