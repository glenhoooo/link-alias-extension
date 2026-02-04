import '@src/Popup.css';
import { t } from '@extension/i18n';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { aliasStorage, exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { useEffect, useState } from 'react';

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const { aliases } = useStorage(aliasStorage);
  
  const [currentUrl, setCurrentUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [url, setUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url) {
        setCurrentUrl(tab.url);
        setUrl(tab.url);
      }
    });
  }, []);

  const handleAdd = async () => {
    if (!alias || !url) return;
    await aliasStorage.add(alias, url);
    setSuccessMsg(t('aliasAdded'));
    setAlias('');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className={cn('w-[300px] p-4 transition-colors duration-300', isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-900 text-gray-100')}>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">{t('popupTitle')}</h1>
        <div className="flex gap-2">
          <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
        </div>
      </header>
      
      <div className={cn('p-3 rounded mb-4', isLight ? 'bg-white shadow-sm' : 'bg-gray-800 border border-gray-700')}>
        <div className="mb-2">
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder={t('aliasPlaceholder')}
              className={cn(
                'w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                isLight ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
              )}
            />
        </div>
        <div className="mb-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('urlPlaceholder')}
              className={cn(
                'w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                isLight ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
              )}
            />
        </div>
        <button
          onClick={handleAdd}
          disabled={!alias || !url}
          className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {t('addCurrentPage')}
        </button>
        {successMsg && <div className="mt-2 text-green-600 text-center text-sm">{successMsg}</div>}
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-2 text-gray-500 uppercase">{t('openList')}</h2>
        <div className={cn('max-h-[200px] overflow-y-auto rounded', isLight ? 'bg-white shadow-sm' : 'bg-gray-800 border border-gray-700')}>
          {aliases.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
               {t('noAliases')}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {aliases.map(item => (
                <li key={item.alias} className="p-2 flex justify-between items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <span className="font-mono font-bold text-sm">{item.alias}</span>
                  <span className="text-xs text-gray-400 truncate max-w-[150px]">{item.url}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="text-center">
        <button onClick={openOptions} className="text-sm text-blue-500 hover:underline">
          {t('openOptions')}
        </button>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
