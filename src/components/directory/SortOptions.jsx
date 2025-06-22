import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

const sortOptions = [
  { id: 'rating', label: 'Highest Rated', shortLabel: 'Rating', icon: '⭐' },
  { id: 'distance', label: 'Closest First', shortLabel: 'Distance', icon: '📍' },
  { id: 'reviews', label: 'Most Reviews', shortLabel: 'Reviews', icon: '💬' },
  { id: 'name', label: 'Name (A-Z)', shortLabel: 'Name', icon: '🔤' },
  { id: 'company', label: 'Company (A-Z)', shortLabel: 'Company', icon: '🏢' },
];

export const SortOptions = ({ currentSort, onSortChange }) => {
  const currentOption = sortOptions.find(option => option.id === currentSort) || sortOptions[0];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px] transition-colors">
          <ArrowsUpDownIcon className="h-4 w-4 mr-1 sm:mr-2 text-gray-400" />
          <span className="hidden sm:inline">Sort by: </span>
          <span className="sm:hidden">Sort: </span>
          <span className="sm:hidden">{currentOption.shortLabel || currentOption.label}</span>
          <span className="hidden sm:inline">{currentOption.label}</span>
          <ChevronDownIcon className="ml-1 sm:ml-2 h-4 w-4 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 sm:w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200">
          <div className="py-1">
            {sortOptions.map((option) => (
              <Menu.Item key={option.id}>
                {({ active }) => (
                  <button
                    onClick={() => onSortChange(option.id)}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } ${
                      currentSort === option.id ? 'bg-blue-50 text-blue-700 font-medium' : ''
                    } group flex items-center w-full px-4 py-3 text-sm hover:bg-gray-100 transition-colors min-h-[44px]`}
                  >
                    <span className="mr-3 text-base">{option.icon}</span>
                    <span className="flex-1 text-left">{option.label}</span>
                    {currentSort === option.id && (
                      <span className="ml-2 text-blue-600">✓</span>
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}; 