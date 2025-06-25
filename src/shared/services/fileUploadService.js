import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storage = getStorage();

/**
 * Uploads a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The storage path (e.g., 'resumes', 'licenses')
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} The download URL of the uploaded file
 */
export const uploadFile = async (file, path, userId) => {
  try {
    // Create a unique filename using timestamp and original name
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const fullPath = `${path}/${userId}/${filename}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, fullPath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file. Please try again.');
  }
};

/**
 * Uploads multiple files to Firebase Storage
 * @param {File[]} files - Array of files to upload
 * @param {string} path - The storage path
 * @param {string} userId - The user's ID
 * @returns {Promise<string[]>} Array of download URLs
 */
export const uploadMultipleFiles = async (files, path, userId) => {
  try {
    const uploadPromises = files.map(file => uploadFile(file, path, userId));
    const downloadURLs = await Promise.all(uploadPromises);
    return downloadURLs;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error('Failed to upload files. Please try again.');
  }
};

/**
 * Validates a file before upload
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Maximum file size in bytes (default: 10MB)
 * @param {string[]} options.allowedTypes - Array of allowed MIME types
 * @returns {boolean} Whether the file is valid
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed');
  }

  return true;
}; 