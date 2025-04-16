// Mock webextension-polyfill
const browser = {
  webNavigation: {
    onCommitted: {
      addListener: jest.fn()
    }
  },
  runtime: {
    getURL: jest.fn().mockReturnValue(''),
    onMessage: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    }
  },
  action: {
    onClicked: {
      addListener: jest.fn()
    }
  },
  tabs: {
    create: jest.fn()
  }
};

export default browser; 