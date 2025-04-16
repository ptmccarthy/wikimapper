// Global mocks for browser APIs
global.chrome = {
  runtime: {
    getManifest: () => ({ version: '1.0.0' }),
    onInstalled: { addListener: jest.fn() },
    onMessage: { addListener: jest.fn() }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    }
  },
  webNavigation: {
    onCommitted: { addListener: jest.fn() }
  },
  action: {
    onClicked: { addListener: jest.fn() }
  },
  tabs: {
    get: jest.fn(),
    create: jest.fn()
  }
};

// Mock browser API
global.browser = {
  storage: {
    session: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    }
  }
};

// Mock jQuery
global.$ = jest.fn(() => ({
  on: jest.fn(),
  off: jest.fn(),
  trigger: jest.fn(),
  find: jest.fn(),
  addClass: jest.fn(),
  removeClass: jest.fn(),
  html: jest.fn(),
  text: jest.fn(),
  val: jest.fn(),
  append: jest.fn(),
  prepend: jest.fn(),
  empty: jest.fn(),
  show: jest.fn(),
  hide: jest.fn()
}));

// Mock D3
global.d3 = {
  select: jest.fn(),
  selectAll: jest.fn(),
  event: {
    preventDefault: jest.fn()
  }
}; 