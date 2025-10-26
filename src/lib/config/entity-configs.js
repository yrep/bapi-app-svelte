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
    brief: ['id', 'email', 'is_verified', 'enable']
  },
  vendor: {
    displayName: 'Vendor',
    searchForm: 'VendorSearchForm',
    fields: {
      id: {
        component: 'NumberField',
        editable: false,
      },
      uuid: {
        component: 'TextField',
        editable: false
      },
      token: {
        component: 'TextField',
        editable: false
      },
      login: {
        component: 'TextField',
        editable: false
      },
      source: {
        component: 'TextField',
        editable: false
      },
      enable: {
        component: 'BoolFieldIcon',
        editable: false
      }
    },
    brief: ['id', 'type', 'login']
  },
  bind: {
    displayName: 'Bind',
    searchForm: 'BindSearchForm',
    fields: {
      id: {
        component: 'TextField',
        editable: false,
        fetchButton: true
      },
      uuid: {
        component: 'TextField',
        editable: false
      },
      vendor_from_id: {
        component: 'EntityField',
        editable: false,
        fetchButton: true,
        fetchEntity: 'vendor'
      },
      vendor_to_id: {
        component: 'EntityField',
        editable: false,
        fetchButton: true,
        fetchEntity: 'vendor'
      },
      enable: {
        component: 'BoolFieldIcon',
        editable: false,
      },
      vendor_from: {
        component: 'EntityContainer',
        entityType: 'vendor',
        editable: false,
        fetchButton: false,
      },
      vendor_to: {
        component: 'EntityContainer',
        entityType: 'vendor',
        editable: false,
        fetchButton: false,
      }
    },
    brief: ['id', 'vendor_from_id', 'vendor_to_id']
  },
  task: {
    displayName: 'Task',
    searchForm: 'TaskSearchForm',
    fields: {
      id: {
        component: 'TextField',
        editable: false,
        fetchButton: true
      },
      dt_ins: {
        component: 'TextField',
        editable: false,
        fetchButton: true
      },
      bind_id: {
        component: 'TextField',
        editable: false,
        fetchButton: false
      },
      hook_id: {
        component: 'TextField',
        editable: false,
        fetchButton: false
      },
      data: {
        component: 'JsonField',
        editable: false
      },
      state: {
        component: 'NumberField',
        editable: false
      }
    },
    brief: ['id', 'title']
  },
  request: {
    displayName: 'Request',
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