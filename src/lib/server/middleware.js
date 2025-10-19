export class AccessMiddleware {
  constructor(userSettings) {
    this.settings = userSettings;
    this.limitations = userSettings?.limitations || {};
  }

  checkBrandAccess(brandSlug) {
    const allowedBrands = this.limitations.brand_slugs;
    if (!allowedBrands || allowedBrands.length === 0) return true;
    return allowedBrands.includes(brandSlug);
  }

  checkUserAccess(userId) {
    const allowedUsers = this.limitations.user_ids;
    if (!allowedUsers || allowedUsers.length === 0) return true;
    return allowedUsers.includes(parseInt(userId));
  }

  filterResponse(data, entityType) {
    if (!this.hasLimitations()) return data;

    try {
      switch (entityType) {
        case 'brand':
          return Array.isArray(data)
            ? data.filter(brand => this.checkBrandAccess(brand.slug))
            : this.checkBrandAccess(data.slug) ? data : null;

        case 'user':
          return Array.isArray(data)
            ? data.filter(user => this.checkUserAccess(user.id))
            : this.checkUserAccess(data.id) ? data : null;

        default:
          return data;
      }
    } catch (error) {
      console.error('Error filtering response:', error);
      throw new Error('Access denied: response filtering failed');
    }
  }


  hasLimitations() {
    return this.limitations.brand_slugs?.length > 0 || 
            this.limitations.user_ids?.length > 0;
  }

  validateRequest(path, method, body = null) {
    if (!this.hasLimitations()) return { allowed: true };

    const brandMatch = path.match(/\/brands\/([^\/]+)/);
    if (brandMatch && !this.checkBrandAccess(brandMatch[1])) {
      return { allowed: false, error: 'Access denied for this brand' };
    }

    const userMatch = path.match(/\/users\/(\d+)/);
    if (userMatch && !this.checkUserAccess(userMatch[1])) {
      return { allowed: false, error: 'Access denied for this user' };
    }

    const url = new URL(path, 'http://dummy.com');
    const email = url.searchParams.get('email');
    const crm = url.searchParams.get('crm');

    if (email || crm) {
      return { allowed: true, needsFiltering: true };
    }

    return { allowed: true };
  }
}