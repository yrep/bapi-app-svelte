import { getFieldRules } from '$lib/config/field-rules.js';

export class AccessMiddleware {
  constructor(userSettings) {
    this.settings = userSettings;
    this.limitations = userSettings?.limitations || {};
    this.currentUserRole = userSettings?.role || null;
  }

  filterFields(data, entityType, method) {
    if (!data || typeof data !== 'object') return data;

    const rules = getFieldRules(entityType, this.currentUserRole, method);

    if (Array.isArray(data)) {
      return data.map(item => this.filterFields(item, entityType, method));
    }

    if (rules.allowed.includes('*') && rules.excluded.length === 0) {
      return data;
    }

    const filtered = {};

    Object.keys(data).forEach(key => {
      const isAllowed = rules.allowed.includes('*') || rules.allowed.includes(key);
      const isExcluded = rules.excluded.includes('*') || rules.excluded.includes(key);

      if (isAllowed && !isExcluded) {
        filtered[key] = data[key];
      }
    });

    return filtered;
  }

  filterResponse(data, entityType, method = 'GET') {
    let filteredData = data;

    if (this.hasLimitations()) {
      try {
        switch (entityType) {
          case 'brand':
            filteredData = Array.isArray(data)
              ? data.filter(brand => this.checkBrandAccess(brand.slug))
              : this.checkBrandAccess(data.slug) ? data : null;
            break;

          case 'user':
            filteredData = Array.isArray(data)
              ? data.filter(user => this.checkUserAccess(user.id))
              : this.checkUserAccess(data.id) ? data : null;
            break;
        }
      } catch (error) {
        console.error('Error filtering response:', error);
        throw new Error('Access denied: response filtering failed');
      }
    }

    return this.filterFields(filteredData, entityType, method);
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

  getEntityTypeFromPath(path) {
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/users')) return 'user';
    if (path.includes('/brands')) return 'brand';
    if (path.includes('/vendors')) return 'vendor';
    if (path.includes('/binds')) return 'bind';
    if (path.includes('/tasks')) return 'task';
    if (path.includes('/requests')) return 'request';
    return null;
  }
}