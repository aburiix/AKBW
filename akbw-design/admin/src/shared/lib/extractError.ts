export function extractError(error: unknown): string | null {
  if (!error) return null;

  const err = error as any;

  if (err?.response?.data) {
    const data = err.response.data;
    if (typeof data.message === 'string' && data.message) return data.message;
    if (typeof data.error === 'string' && data.error) return data.error;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map(String).join('; ');
    }
  }

  if (err?.message) {
    const msg: string = err.message;
    if (msg === 'Network Error') return 'Tarmoq xatoligi. Internet aloqasini tekshiring';
    return msg;
  }

  return null;
}
