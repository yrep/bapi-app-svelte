export class BapiResponseBody {
  constructor(response) {
    this.response = response;
  }

  isOK() {
    return this.response?.ok === true;
  }

  getData() {
    return this.response?.data || null;
  }

  isDataEmpty() {
    const data = this.getData();
    if (data === null || data === undefined) return true;
    if (Array.isArray(data)) return data.length === 0;
    if (typeof data === 'object') {
      return Object.values(data).every(value => 
        value === null || 
        value === undefined || 
        value === '' || 
        value === 0 || 
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
      );
    }
    return false;
  }

  getErrors() {
    return this.response?.errors || [];
  }

  getMessage() {
    return this.response?.message || '';
  }

  hasErrors() {
    return this.getErrors().length > 0;
  }
}

export function createBapiResponse(response) {
  return new BapiResponseBody(response);
}