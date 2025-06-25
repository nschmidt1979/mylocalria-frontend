import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../auth/contexts/AuthContext';
import { db } from '../../../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SaveSearchModal = ({ isOpen, onClose, currentFilters, onSave }) => {
  const { currentUser } = useAuth();
  const [searchName, setSearchName] = useState('');
  const [notifyNewAdvisors, setNotifyNewAdvisors] = useState(true);
  const [notifyPriceChanges, setNotifyPriceChanges] = useState(false);
  const [notifyReviewUpdates, setNotifyReviewUpdates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchName.trim()) {
      setError('Please enter a name for your saved search');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const savedSearch = {
        userId: currentUser.uid,
        name: searchName.trim(),
        filters: currentFilters,
        notifications: {
          newAdvisors: notifyNewAdvisors,
          priceChanges: notifyPriceChanges,
          reviewUpdates: notifyReviewUpdates,
        },
        createdAt: serverTimestamp(),
        lastNotified: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'savedSearches'), savedSearch);
      onSave({ id: docRef.id, ...savedSearch });
      onClose();
    } catch (err) {
      console.error('Error saving search:', err);
      setError('Failed to save search. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <BellIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Save Search
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Save your current search filters and get notified when new advisors match your criteria.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div>
                    <label htmlFor="searchName" className="block text-sm font-medium text-gray-700">
                      Search Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="searchName"
                        id="searchName"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g., Fee-Only Advisors in New York"
                      />
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Notification Preferences</h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="notifyNewAdvisors"
                            name="notifyNewAdvisors"
                            type="checkbox"
                            checked={notifyNewAdvisors}
                            onChange={(e) => setNotifyNewAdvisors(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="notifyNewAdvisors" className="font-medium text-gray-700">
                            New Advisors
                          </label>
                          <p className="text-gray-500">Get notified when new advisors match your search criteria</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="notifyPriceChanges"
                            name="notifyPriceChanges"
                            type="checkbox"
                            checked={notifyPriceChanges}
                            onChange={(e) => setNotifyPriceChanges(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="notifyPriceChanges" className="font-medium text-gray-700">
                            Price Changes
                          </label>
                          <p className="text-gray-500">Get notified when advisors in your search update their fees</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex h-5 items-center">
                          <input
                            id="notifyReviewUpdates"
                            name="notifyReviewUpdates"
                            type="checkbox"
                            checked={notifyReviewUpdates}
                            onChange={(e) => setNotifyReviewUpdates(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="notifyReviewUpdates" className="font-medium text-gray-700">
                            Review Updates
                          </label>
                          <p className="text-gray-500">Get notified when advisors in your search receive new reviews</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Saving...' : 'Save Search'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SaveSearchModal; 