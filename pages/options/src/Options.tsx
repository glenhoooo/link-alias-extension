import '@src/Options.css';
import { t } from '@extension/i18n';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { aliasStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { exampleThemeStorage } from '@extension/storage';
import { useState } from 'react';

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const { aliases } = useStorage(aliasStorage);
  
  const [newAlias, setNewAlias] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = async () => {
    if (!newAlias || !newUrl) return;
    await aliasStorage.add(newAlias, newUrl);
    setNewAlias('');
    setNewUrl('');
  };

  const handleDelete = async (alias: string) => {
    if (confirm(t('delete') + '?')) {
      await aliasStorage.remove(alias);
    }
  };

  return (
    <div className={cn('min-h-screen p-8 transition-colors duration-300', isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-900 text-gray-100')}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('optionsTitle')}</h1>
          <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
        </div>

        <div className={cn('p-6 rounded-lg shadow-md mb-8', isLight ? 'bg-white' : 'bg-gray-800')}>
          <div className="flex gap-4">
            <input
              type="text"
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              placeholder={t('aliasPlaceholder')}
              className={cn(
                'flex-1 px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500',
                isLight ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
              )}
            />
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={t('urlPlaceholder')}
              className={cn(
                'flex-[2] px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500',
                isLight ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
              )}
            />
            <button
              onClick={handleAdd}
              disabled={!newAlias || !newUrl}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t('addAlias')}
            </button>
          </div>
        </div>

        <div className={cn('rounded-lg shadow-md overflow-hidden', isLight ? 'bg-white' : 'bg-gray-800')}>
          {aliases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('noAliases')}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={cn('border-b', isLight ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-800')}>
                  <th className="p-4 font-semibold">Alias</th>
                  <th className="p-4 font-semibold">URL</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {aliases.map((item) => (
                  <tr key={item.alias} className={cn('border-b last:border-0 hover:bg-opacity-50', isLight ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-700 hover:bg-gray-700')}>
                    <td className="p-4 font-mono font-medium">{item.alias}</td>
                    <td className="p-4 text-blue-500 hover:underline truncate max-w-md">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">{item.url}</a>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(item.alias)}
                        className="text-red-500 hover:text-red-700 transition-colors px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
