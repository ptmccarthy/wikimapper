// Mock browser polyfill for testing
const browser = {
  webNavigation: {
    onCommitted: {
      addListener: sinon.stub()
    }
  },
  runtime: {
    getURL: sinon.stub().returns(''),
    onMessage: {
      addListener: sinon.stub()
    },
    onInstalled: {
      addListener: sinon.stub()
    }
  },
  action: {
    onClicked: {
      addListener: sinon.stub()
    }
  },
  tabs: {
    create: sinon.stub()
  }
};

export default browser; 