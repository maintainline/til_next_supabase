'use client';

import { useThemeStore } from '@/stores/ThemeStore';

export default function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  return (
    <div className='p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4'>
      <h2 className='text-2xl font-bold text-center text-gray-800'>
        Theme Settings
      </h2>

      <div className='text-center'>
        <p className='text-gray-600 mb-4'>
          Current theme:{' '}
          <span className='font-semibold capitalize'>{theme}</span>
        </p>

        <div className='space-y-2'>
          <button
            onClick={toggleTheme}
            className='w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
          >
            Toggle Theme
          </button>

          <div className='grid grid-cols-3 gap-2'>
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                theme === 'light'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Light
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Dark
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`px-3 py-2 rounded text-sm transition-colors ${
                theme === 'system'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              System
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
