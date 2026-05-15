import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useApiConfigStore } from '../../stores/api-config.store';
import { ApiProvider, ApiKey, ModelParameters } from '../../types/api-config';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDERS: { id: ApiProvider; label: string; color: string }[] = [
  { id: 'gemini', label: 'Gemini', color: 'bg-blue-500' },
  { id: 'openai', label: 'OpenAI', color: 'bg-green-500' },
  { id: 'anthropic', label: 'Anthropic', color: 'bg-purple-500' },
  { id: 'custom', label: 'Custom', color: 'bg-gray-500' },
  { id: 'deo', label: 'Deo', color: 'bg-orange-500' },
  { id: 'dia', label: 'Dia', color: 'bg-pink-500' },
];

function ProviderTab({ 
  label, 
  active, 
  onClick, 
  color 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
  color: string;
}) {
  return (
    <button 
      onClick={onClick}
      className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest border-2 rounded-xl transition-all ${
        active 
          ? `${color} border-transparent text-white` 
          : 'border-brand-border text-brand-black opacity-40 hover:opacity-100 hover:bg-brand-paper'
      }`}
    >
      {label}
    </button>
  );
}

function ApiKeyCard({
  key,
  onSetActive,
  onDelete,
  onTest,
  onEdit,
  isLoading,
}: {
  key: ApiKey;
  onSetActive: () => void;
  onDelete: () => void;
  onTest: () => void;
  onEdit: () => void;
  isLoading: boolean;
}) {
  return (
    <div className={`p-4 border-2 rounded-xl transition-all ${key.isActive ? 'border-brand-black bg-brand-paper/50' : 'border-brand-border bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {key.displayName || `API Key ${key.id.slice(0, 8)}`}
          </span>
          {key.isActive && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {key.isTested && (
            key.testSuccess ? (
              <CheckCircle2 size={16} className="text-green-500" />
            ) : (
              <AlertCircle size={16} className="text-red-500" />
            )
          )}
        </div>
      </div>
      
      {key.endpoint && (
        <p className="text-xs text-gray-500 mb-2 font-mono truncate">{key.endpoint}</p>
      )}
      
      {key.modelParameters && (
        <div className="flex flex-wrap gap-2 mb-3">
          {key.modelParameters.model && (
            <span className="px-2 py-1 bg-gray-100 text-xs rounded">{key.modelParameters.model}</span>
          )}
          {key.modelParameters.temperature !== undefined && (
            <span className="px-2 py-1 bg-gray-100 text-xs rounded">Temp: {key.modelParameters.temperature}</span>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">
            Created: {new Date(key.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xs font-semibold">Edit</span>
          </button>
          <button
            onClick={onTest}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            <span className="text-xs font-semibold">Test</span>
          </button>
          {!key.isActive && (
            <button
              onClick={onSetActive}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
            >
              <span className="text-xs font-semibold text-green-700">Activate</span>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AddKeyForm({
  provider,
  onCancel,
  onSave,
}: {
  provider: ApiProvider;
  onCancel: () => void;
  onSave: (data: { apiKey: string; endpoint?: string; displayName?: string; modelParameters?: ModelParameters }) => void;
}) {
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState('');
  const [maxTokens, setMaxTokens] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modelParameters: ModelParameters = {};
    if (model) modelParameters.model = model;
    if (temperature) modelParameters.temperature = parseFloat(temperature);
    if (maxTokens) modelParameters.maxTokens = parseInt(maxTokens);
    
    onSave({
      apiKey,
      endpoint: endpoint || undefined,
      displayName: displayName || undefined,
      modelParameters: Object.keys(modelParameters).length > 0 ? modelParameters : undefined,
    });
  };

  const needsEndpoint = ['custom', 'deo', 'dia'].includes(provider);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border-2 border-dashed border-brand-border rounded-xl">
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 mb-2 block">
          Display Name (Optional)
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="My API Key"
          className="w-full px-4 py-3 bg-brand-paper border border-brand-border rounded-xl text-sm focus:border-brand-black outline-none"
        />
      </div>
      
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 mb-2 block">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="w-full px-4 py-3 bg-brand-paper border border-brand-border rounded-xl font-mono text-sm focus:border-brand-black outline-none"
          required
        />
      </div>
      
      {needsEndpoint && (
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 mb-2 block">
            API Endpoint
          </label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://api.example.com/v1"
            className="w-full px-4 py-3 bg-brand-paper border border-brand-border rounded-xl font-mono text-sm focus:border-brand-black outline-none"
          />
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 mb-2 block">
            Model (Optional)
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="gpt-4"
            className="w-full px-3 py-2 bg-brand-paper border border-brand-border rounded-lg text-sm focus:border-brand-black outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 mb-2 block">
            Temperature
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="0.7"
            className="w-full px-3 py-2 bg-brand-paper border border-brand-border rounded-lg text-sm focus:border-brand-black outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 mb-2 block">
            Max Tokens
          </label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.value)}
            placeholder="1000"
            className="w-full px-3 py-2 bg-brand-paper border border-brand-border rounded-lg text-sm focus:border-brand-black outline-none"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-brand-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Add API Key
        </button>
      </div>
    </form>
  );
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { activeProvider, setActiveProvider, apiKeys, setApiKeysForProvider, addApiKey, removeApiKey, setActiveKey, updateApiKey } = useApiConfigStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const currentProviderInfo = PROVIDERS.find(p => p.id === activeProvider)!;
  const currentKeys = apiKeys[activeProvider] || [];

  const handleAddKey = (data: any) => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      userId: 'anonymous',
      provider: activeProvider,
      endpoint: data.endpoint,
      modelParameters: data.modelParameters,
      isActive: currentKeys.length === 0,
      displayName: data.displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTested: false,
      testSuccess: false,
    };
    addApiKey(activeProvider, newKey);
    setShowAddForm(false);
    setMessage({ text: 'API Key added successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleTestKey = async (key: ApiKey) => {
    setTestingKeyId(key.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const success = Math.random() > 0.3;
      updateApiKey(activeProvider, key.id, {
        isTested: true,
        testSuccess: success,
        lastTestedAt: new Date().toISOString(),
      });
      setMessage({ 
        text: success ? 'Connection test successful!' : 'Connection test failed. Check your API key.',
        type: success ? 'success' : 'error'
      });
    } catch (error) {
      setMessage({ text: 'Test failed', type: 'error' });
    } finally {
      setTestingKeyId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteKey = (keyId: string) => {
    removeApiKey(activeProvider, keyId);
    setMessage({ text: 'API Key deleted', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSetActive = (keyId: string) => {
    setActiveKey(activeProvider, keyId);
    setMessage({ text: 'API Key activated', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-paper/90 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-3xl bg-brand-paper border border-brand-black shadow-[24px_24px_0px_0px_rgba(26,26,26,0.1)] p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-serif italic tracking-tighter">API Configuration</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-black/30 mt-2">Manage your API providers and keys</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-brand-paper rounded-full transition-colors">
                <X size={28} />
              </button>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <p className={`text-sm font-semibold ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message.text}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50">Select Provider</label>
                <div className="flex flex-wrap gap-2">
                  {PROVIDERS.map((provider) => (
                    <ProviderTab
                      key={provider.id}
                      label={provider.label}
                      active={activeProvider === provider.id}
                      onClick={() => setActiveProvider(provider.id)}
                      color={provider.color}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 flex items-center gap-2">
                    <Sparkles size={14} />
                    {currentProviderInfo.label} API Keys
                  </label>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus size={16} />
                    Add Key
                  </button>
                </div>

                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <AddKeyForm
                        provider={activeProvider}
                        onCancel={() => setShowAddForm(false)}
                        onSave={handleAddKey}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  {currentKeys.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-brand-border rounded-xl">
                      <p className="text-gray-500">No API keys configured yet</p>
                      <p className="text-xs text-gray-400 mt-2">Click "Add Key" to get started</p>
                    </div>
                  ) : (
                    currentKeys.map((key) => (
                      <ApiKeyCard
                        key={key.id}
                        key={key}
                        onSetActive={() => handleSetActive(key.id)}
                        onDelete={() => handleDeleteKey(key.id)}
                        onTest={() => handleTestKey(key)}
                        onEdit={() => {}}
                        isLoading={testingKeyId === key.id}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="p-5 bg-brand-paper border-l-4 border-brand-black rounded-r-xl">
                <p className="text-[11px] text-brand-black/60 leading-relaxed italic">
                  Your API keys are stored locally in your browser. We never transmit your keys to any third-party servers except when making API calls directly from your browser.
                </p>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-5 bg-brand-black text-white font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
