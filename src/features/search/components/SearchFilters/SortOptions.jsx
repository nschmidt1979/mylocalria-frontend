import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

const sortOptions = [
  { id: 'rating', label: 'Highest Rated', icon: '⭐' },
  { id: 'distance', label: 'Closest First', icon: '📍' },
  { id: 'reviews', label: 'Most Reviews', icon: '💬' },
  { id: 'name', label: 'Name (A-Z)', icon: '🔤' },
  { id: 'company', label: 'Company (A-Z)', icon: '🏢' },
];

export const SortOptions = ({ currentSort, onSortChange }) => {
  const currentOption = sortOptions.find(option => option.id === currentSort) || sortOptions[0];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <ArrowsUpDownIcon className="h-4 w-4 mr-2 text-gray-400" />
          Sort by: {currentOption.label}
          <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-400" aria-hidden="true" />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {sortOptions.map((option) => (
              <Menu.Item key={option.id}>
                {({ active }) => (
                  <button
                    onClick={() => onSortChange(option.id)}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } ${
                      currentSort === option.id ? 'bg-blue-50 text-blue-700' : ''
                    } group flex items-center w-full px-4 py-2 text-sm`}
                  >
                    <span className="mr-3">{option.icon}</span>
                    {option.label}
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