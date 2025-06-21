import { useState, useEffect } from 'react';
import {
  BookmarkIcon,
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const SearchBookmarks = ({ currentSearch, onLoadSearch }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load bookmarks and folders from localStorage
    const loadBookmarks = () => {
      const savedBookmarks = JSON.parse(localStorage.getItem('searchBookmarks') || '[]');
      const savedFolders = JSON.parse(localStorage.getItem('searchFolders') || '[]');
      setBookmarks(savedBookmarks);
      setFolders(savedFolders);
    };

    loadBookmarks();
  }, []);

  const saveBookmarks = (newBookmarks) => {
    localStorage.setItem('searchBookmarks', JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  };

  const saveFolders = (newFolders) => {
    localStorage.setItem('searchFolders', JSON.stringify(newFolders));
    setFolders(newFolders);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }

    const newFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      createdAt: new Date().toISOString(),
    };

    saveFolders([...folders, newFolder]);
    setNewFolderName('');
    setError(null);
  };

  const handleCreateBookmark = () => {
    if (!currentSearch) {
      setError('No search to bookmark');
      return;
    }

    if (!newBookmarkName.trim()) {
      setError('Bookmark name cannot be empty');
      return;
    }

    const newBookmark = {
      id: Date.now().toString(),
      name: newBookmarkName.trim(),
      search: currentSearch,
      folderId: selectedFolder,
      createdAt: new Date().toISOString(),
    };

    saveBookmarks([...bookmarks, newBookmark]);
    setNewBookmarkName('');
    setSelectedFolder(null);
    setError(null);
  };

  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setNewBookmarkName(bookmark.name);
    setSelectedFolder(bookmark.folderId);
  };

  const handleUpdateBookmark = () => {
    if (!editingBookmark) return;

    const updatedBookmarks = bookmarks.map(b =>
      b.id === editingBookmark.id
        ? { ...b, name: newBookmarkName.trim(), folderId: selectedFolder }
        : b
    );

    saveBookmarks(updatedBookmarks);
    setEditingBookmark(null);
    setNewBookmarkName('');
    setSelectedFolder(null);
    setError(null);
  };

  const handleEditFolder = (folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
  };

  const handleUpdateFolder = () => {
    if (!editingFolder) return;

    const updatedFolders = folders.map(f =>
      f.id === editingFolder.id
        ? { ...f, name: newFolderName.trim() }
        : f
    );

    saveFolders(updatedFolders);
    setEditingFolder(null);
    setNewFolderName('');
    setError(null);
  };

  const handleDeleteBookmark = (bookmarkId) => {
    const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
    saveBookmarks(updatedBookmarks);
  };

  const handleDeleteFolder = (folderId) => {
    // Move bookmarks to root level
    const updatedBookmarks = bookmarks.map(b =>
      b.folderId === folderId ? { ...b, folderId: null } : b
    );
    saveBookmarks(updatedBookmarks);

    // Delete folder
    const updatedFolders = folders.filter(f => f.id !== folderId);
    saveFolders(updatedFolders);
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const renderFolder = (folder) => {
    const isExpanded = expandedFolders[folder.id];
    const folderBookmarks = bookmarks.filter(b => b.folderId === folder.id);

    return (
      <div key={folder.id} className="space-y-1">
        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
          <div className="flex items-center flex-1">
            <button
              onClick={() => toggleFolder(folder.id)}
              className="text-gray-400 hover:text-gray-500"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
            {editingFolder?.id === folder.id ? (
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={handleUpdateFolder}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateFolder()}
                className="ml-2 flex-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            ) : (
              <div className="flex items-center ml-2 flex-1">
                <FolderIcon className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-900">{folder.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEditFolder(folder)}
              className="text-gray-400 hover:text-gray-500"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteFolder(folder.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="ml-6 space-y-1">
            {folderBookmarks.map(bookmark => renderBookmark(bookmark))}
          </div>
        )}
      </div>
    );
  };

  const renderBookmark = (bookmark) => {
    const isEditing = editingBookmark?.id === bookmark.id;

    return (
      <div
        key={bookmark.id}
        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
      >
        {isEditing ? (
          <div className="flex-1 flex items-center space-x-2">
            <input
              type="text"
              value={newBookmarkName}
              onChange={(e) => setNewBookmarkName(e.target.value)}
              onBlur={handleUpdateBookmark}
              onKeyPress={(e) => e.key === 'Enter' && handleUpdateBookmark()}
              className="flex-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <select
              value={selectedFolder || ''}
              onChange={(e) => setSelectedFolder(e.target.value || null)}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Folder</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <button
              onClick={() => onLoadSearch(bookmark.search)}
              className="flex items-center flex-1 text-left"
            >
              <BookmarkIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-900">{bookmark.name}</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEditBookmark(bookmark)}
                className="text-gray-400 hover:text-gray-500"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteBookmark(bookmark.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookmarkIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Search Bookmarks</h3>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Create New Folder */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Create New Folder</h4>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="flex-1 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleCreateFolder}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Create
            </button>
          </div>
        </div>

        {/* Create New Bookmark */}
        {currentSearch && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Bookmark Current Search</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={newBookmarkName}
                onChange={(e) => setNewBookmarkName(e.target.value)}
                placeholder="Bookmark name"
                className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No Folder</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateBookmark}
                className="w-full inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BookmarkIcon className="h-4 w-4 mr-1" />
                Bookmark Search
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        {/* Folders and Bookmarks */}
        <div className="space-y-4">
          {/* Root Level Bookmarks */}
          <div className="space-y-1">
            {bookmarks
              .filter(b => !b.folderId)
              .map(bookmark => renderBookmark(bookmark))}
          </div>

          {/* Folders */}
          <div className="space-y-1">
            {folders.map(folder => renderFolder(folder))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBookmarks; 