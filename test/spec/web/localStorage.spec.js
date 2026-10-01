import StorageCollection from '../../../src/web/js/collections/localStorage.js';
import mockSession from '../../resources/mock_session.js';

describe('History collection export/import', () => {
  let collection;
  let stored;

  beforeEach(() => {
    stored = {
      1449449041206: mockSession
    };

    collection = new StorageCollection();

    global.chrome.runtime.lastError = undefined;
    global.chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ ...stored });
    });
    global.chrome.storage.local.set.mockImplementation((data, callback) => {
      stored = { ...stored, ...data };
      if (callback) {
        callback();
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should export the raw chrome.storage.local dump', async() => {
    const data = await collection.exportAll();

    expect(global.chrome.storage.local.get).toHaveBeenCalledWith(null, expect.any(Function));
    expect(data['1449449041206'].name).toBe('Search Results: _');
  });

  it('should reject invalid import payloads', () => {
    expect(collection.isValidHistoryExport(null)).toBe(false);
    expect(collection.isValidHistoryExport([])).toBe(false);
    expect(collection.isValidHistoryExport({})).toBe(false);
    expect(collection.isValidHistoryExport({ 1: { id: 1 } })).toBe(false);
  });

  it('should accept a sessionId -> tree export', () => {
    expect(collection.isValidHistoryExport({
      123: { name: 'Boston', children: [] }
    })).toBe(true);
  });

  it('should merge imported sessions into storage and reload the collection', async() => {
    const incoming = {
      999: { name: 'JavaScript', children: [] }
    };

    await collection.importAll(incoming);

    expect(global.chrome.storage.local.set).toHaveBeenCalledWith(incoming, expect.any(Function));
    expect(collection.get('999').get('tree').name).toBe('JavaScript');
    expect(collection.get('1449449041206').get('tree').name).toBe('Search Results: _');
  });

  it('should reject importAll when the payload is invalid', async() => {
    await expect(collection.importAll({ bad: true })).rejects.toThrow(
      'Invalid WikiMapper history file.'
    );
    expect(global.chrome.storage.local.set).not.toHaveBeenCalled();
  });
});
