import { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const SearchResultsCalendar = ({ advisors, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('week'); // 'week' or 'day'
  const [timeRange, setTimeRange] = useState('week'); // 'week', '2weeks', 'month'

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real implementation, this would fetch from an API
        const mockAvailability = generateMockAvailability(advisors, selectedDate, timeRange);
        setAvailability(mockAvailability);
      } catch (err) {
        setError('Failed to load availability data');
        console.error('Availability fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [advisors, selectedDate, timeRange]);

  const generateMockAvailability = (advisors, startDate, range) => {
    const availability = {};
    const days = range === 'week' ? 7 : range === '2weeks' ? 14 : 30;
    const timeSlots = generateTimeSlots();

    advisors.forEach(advisor => {
      availability[advisor.id] = {};
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        
        availability[advisor.id][dateKey] = timeSlots.map(slot => ({
          time: slot,
          available: Math.random() > 0.3, // 70% chance of availability
          booked: Math.random() > 0.8, // 20% chance of being booked
        }));
      }
    });

    return availability;
  };

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const interval = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }

    return slots;
  };

  const getWeekDates = (date) => {
    const dates = [];
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      dates.push(currentDate);
    }

    return dates;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setView('day');
  };

  const handleTimeSlotClick = (advisorId, date, timeSlot) => {
    const advisor = advisors.find(a => a.id === advisorId);
    setSelectedAdvisor(advisor);
    setSelectedTimeSlot({ date, time: timeSlot });
  };

  const handlePreviousPeriod = () => {
    const newDate = new Date(selectedDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(selectedDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleScheduleMeeting = () => {
    // In a real implementation, this would open a scheduling modal or form
    console.log('Schedule meeting:', {
      advisor: selectedAdvisor,
      date: selectedTimeSlot.date,
      time: selectedTimeSlot.time,
    });
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(selectedDate);
    const timeSlots = generateTimeSlots();

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="w-24 px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Time
              </th>
              {weekDates.map(date => (
                <th
                  key={date.toISOString()}
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  {formatDate(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatTime(timeSlot)}
                </td>
                {weekDates.map(date => {
                  const dateKey = date.toISOString().split('T')[0];
                  const availableAdvisors = advisors.filter(advisor => {
                    const slot = availability[advisor.id]?.[dateKey]?.find(
                      slot => slot.time === timeSlot
                    );
                    return slot?.available && !slot?.booked;
                  });

                  return (
                    <td key={dateKey} className="px-3 py-4">
                      {availableAdvisors.length > 0 ? (
                        <button
                          onClick={() => handleDateClick(date)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
                        >
                          {availableAdvisors.length} available
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">No availability</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = generateTimeSlots();
    const dateKey = selectedDate.toISOString().split('T')[0];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advisors.map(advisor => {
            const advisorAvailability = availability[advisor.id]?.[dateKey] || [];
            const availableSlots = advisorAvailability.filter(
              slot => slot.available && !slot.booked
            );

            return (
              <div
                key={advisor.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{advisor.name}</h3>
                    <p className="text-sm text-gray-500">{advisor.location}</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {advisor.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {advisor.yearsOfExperience} years
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {availableSlots.length} slots available
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Available Time Slots</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeSlotClick(advisor.id, dateKey, slot.time)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200"
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setView('week')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                view === 'week'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                view === 'day'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Day View
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="week">Next 7 Days</option>
              <option value="2weeks">Next 14 Days</option>
              <option value="month">Next 30 Days</option>
            </select>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPeriod}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium text-gray-900">
                {view === 'week'
                  ? `Week of ${formatDate(selectedDate)}`
                  : formatDate(selectedDate)}
              </span>
              <button
                onClick={handleNextPeriod}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="px-4 pb-5 sm:px-6">
        {view === 'week' ? renderWeekView() : renderDayView()}
      </div>

      {/* Scheduling Modal */}
      {selectedAdvisor && selectedTimeSlot && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Schedule Meeting with {selectedAdvisor.name}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {formatDate(new Date(selectedTimeSlot.date))} at{' '}
                      {formatTime(selectedTimeSlot.time)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleScheduleMeeting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                >
                  Schedule Meeting
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdvisor(null);
                    setSelectedTimeSlot(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsCalendar; 