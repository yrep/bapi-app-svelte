export const fieldRules = {
  admin: {
    admin: {
      allowed: ['*'],
      excluded: ['password_hash']
    },
    support_engineer: {
      allowed: ['*'],
      excluded: ['password_hash', 'refresh_token', 'refresh_token_exp']
    },
    moderator: {
      allowed: ['id', 'brand_slug', 'email', 'is_verified', 'dt_ins', 'dt_upd', 'enable'],
      excluded: ['*']
    },
    user: {
      allowed: ['id', 'brand_slug', 'email', 'is_verified'],
      excluded: ['*']
    }
  },
  user: {
    admin: {
      allowed: ['*'],
      excluded: ['password_hash']
    },
    support_engineer: {
      allowed: ['*'],
      excluded: ['password_hash', 'refresh_token', 'refresh_token_exp']
    },
    moderator: {
      allowed: ['id', 'brand_slug', 'email', 'is_verified', 'dt_ins', 'dt_upd', 'enable'],
      excluded: ['*']
    },
    user: {
      allowed: ['id', 'brand_slug', 'email', 'is_verified'],
      excluded: ['*']
    }
  },
  brand: {
    admin: {
      allowed: ['*'],
      excluded: []
    },
    support_engineer: {
      allowed: ['*'],
      excluded: ['api_key', 'secret_key']
    },
    moderator: {
      allowed: ['id', 'slug', 'name', 'description', 'enable'],
      excluded: ['*']
    },
    user: {
      allowed: ['id', 'slug', 'name'],
      excluded: ['*']
    }
  }
};

export const getFieldRules = (entityType, userRole, method = 'GET') => {
  const rules = fieldRules[entityType]?.[userRole] || fieldRules[entityType]?.user;
  
  if (!rules) {
    return { allowed: ['*'], excluded: [] };
  }

  if (method === 'POST' || method === 'PUT') {
    const writeRules = fieldRules[entityType]?.[`${userRole}_write`] || rules;
    return writeRules;
  }

  return rules;
};