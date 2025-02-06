import React, { useEffect, useState, useRef } from 'react';
import { format, isSameDay, addMonths, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns';
import { dbManager as db } from '../../database/db';

interface VerticalDatePickerProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
  onReset: () => void;
}

export const VerticalDatePicker: React.FC<VerticalDatePickerProps> = ({
  onSelectDate,
  selectedDate,
  onReset
}) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDatesWithNotes();

    // Add click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDatesWithNotes = async () => {
    const datesWithNotes = await db.getDatesWithNotes();
    setDates(datesWithNotes);
  };

  const isDateEnabled = (date: Date) => {
    return dates.some(d => isSameDay(d, date));
  };

  const getDaysInMonth = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const isDateSelected = (date: Date) => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-16 bg-editor-gutter border-l border-editor-line flex flex-col">
      {/* Date Picker Container */}
      <div className="relative" ref={pickerRef}>
        <div className="border-b border-editor-line">
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="w-full p-2 text-center bg-editor-gutter hover:bg-editor-line transition-colors"
          >
            {selectedDate ? (
              <>
                <div className="text-xs font-medium text-editor-text">
                  {format(selectedDate, 'MMM')}
                </div>
                <div className="text-sm font-bold text-editor-text">
                  {format(selectedDate, 'd')}
                </div>
              </>
            ) : (
              <div className="text-xs font-medium text-editor-text">
                All Notes
              </div>
            )}
          </button>

          {selectedDate && (
            <button
              onClick={onReset}
              className="w-full py-1 px-2 text-xs text-gray-400 hover:text-editor-text 
                       hover:bg-editor-line transition-colors border-t border-editor-line"
            >
              Clear
            </button>
          )}
        </div>

        {/* Custom Calendar */}
        {isPickerOpen && (
          <div className="absolute top-full right-0 mt-1 p-2 bg-editor-bg rounded shadow-lg border border-editor-line z-50 w-64">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-editor-line rounded text-editor-text"
              >
                ←
              </button>
              <div className="text-sm font-medium text-editor-text">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-editor-line rounded text-editor-text"
              >
                →
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-xs text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentMonth).map(date => {
                const isEnabled = isDateEnabled(date);
                const isSelected = isDateSelected(date);
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      if (isEnabled) {
                        onSelectDate(date);
                        setIsPickerOpen(false);
                      }
                    }}
                    className={`
                      p-1 text-xs rounded
                      ${isEnabled 
                        ? isSelected
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-editor-line text-editor-text'
                        : 'text-gray-500 cursor-not-allowed'
                      }
                      `}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Date List */}
      <div className="flex-1 overflow-y-auto scroll-area">
        <div className="py-2">
          {dates.map((date, index) => (
            <div
              key={date.toISOString()}
              className={`cursor-pointer px-2 py-1.5 text-center transition-colors
                ${isDateSelected(date)
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-editor-line text-editor-text'}`}
              onClick={() => onSelectDate(date)}
            >
              <div className="text-xs font-medium">
                {format(date, 'MMM')}
              </div>
              <div className="text-sm font-bold">
                {format(date, 'd')}
              </div>
              {index > 0 && !isSameDay(dates[index - 1], date) && (
                <div className="h-px bg-editor-line mx-1 mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 