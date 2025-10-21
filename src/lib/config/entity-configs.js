const entityConfigs = {
  user: {
    displayName: 'User',
    searchForm: 'UserSearchForm',
    fields: {
      id: {
        component: 'TextField',
        editable: false,
        fetchButton: true,
        fetchEntity: 'user'
      },
      brand_slug: {
        component: 'TextField',
        editable: true
      },
      email: {
        component: 'TextField',
        editable: true
      },
      auth_type: {
        component: 'TextField',
        editable: true
      },
      is_verified: {
        component: 'BoolFieldIcon',
        editable: false
      },
      enable: {
        component: 'BoolFieldIcon',
        editable: true
      },
      dt_ins: {
        component: 'TextField',
        editable: false
      },
      dt_upd: {
        component: 'TextField',
        editable: false
      },
      refresh_token: {
        component: 'TextField',
        editable: false
      }
    },
    brief: ['id', 'brand_slug', 'email', 'is_verified', 'enable']
  },
  vendor: {
    displayName: 'Vendors',
    searchForm: 'BaseSearchForm',
    fields: {
      id: {
        component: 'TextField',
        editable: false,
        fetchButton: true,
        fetchEntity: 'vendor'
      },
      name: {
        component: 'TextField',
        editable: true
      },
      settings: {
        component: 'JsonField',
        editable: false
      }
    },
    brief: ['id', 'name']
  },
  bind: {
    displayName: 'Binds',
    searchForm: 'BaseSearchForm',
    fields: {
      id: {
        component: 'TextField',
        editable: false,
        fetchButton: true
      },
      user_id: {
        component: 'TextField',
        editable: false,
        fetchButton: true,
        fetchEntity: 'user'
      },
      vendor_id: {
        component: 'TextField', 
        editable: false,
        fetchButton: true,
        fetchEntity: 'vendor'
      }
    },
    brief: ['id', 'user_id', 'vendor_id']
  },
  task: {
    displayName: 'Tasks',
    searchForm: 'BaseSearchForm',
    fields: {
      id: {
        component: 'TextField',
        editable: false,
        fetchButton: true
      },
      title: {
        component: 'TextField',
        editable: true
      }
    },
    brief: ['id', 'title']
  },
  request: {
    displayName: 'Requests',
    searchForm: 'BaseSearchForm',
    fields: {
      id: {
        component: 'TextField',
        editable: false,
        fetchButton: true
      },
      type: {
        component: 'TextField',
        editable: false
      }
    },
    brief: ['id', 'type']
  }
};

export function getEntityConfig(entityType) {
  return entityConfigs[entityType] || {
    searchForm: 'BaseSearchForm',
    fields: {},
    brief: ['id']
  };
}

// Экспортируем также entityConfigs если нужно
export { entityConfigs };