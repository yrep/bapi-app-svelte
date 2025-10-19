const entityConfigs = {
  user: {
    searchForm: 'UserSearchForm',
    fields: {
      id: {
        component: 'TextField',
        editable: false,
        fetchButton: true,
        fetchEntity: 'user'
      },
      name: {
        component: 'TextField',
        editable: true
      },
      email: {
        component: 'TextField', 
        editable: true
      },
      metadata: {
        component: 'JsonField',
        editable: false
      },
      is_active: {
        component: 'BoolFieldIcon',
        editable: true
      }
    },
    brief: ['id', 'name', 'email']
  },
  vendor: {
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