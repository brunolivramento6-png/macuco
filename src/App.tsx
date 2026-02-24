import React from 'react';
import { Play, Video, ArrowLeft, RefreshCw, Beer, Share2, AlertCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface TableData {
  id: number;
  name: string;
  isLive: boolean;
  hasReplay: boolean;
  lastReplayTimestamp: number | null;
  streamUrl: string;
  replayUrl: string | null;
}

// --- Components ---

const Header = () => (
  <header className="bg-macuco-brown text-white p-4 shadow-md sticky top-0 z-10">
    <div className="container mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-macuco-green rounded-full flex items-center justify-center border-2 border-white/20">
          <span className="font-bold text-xs">MS</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">MACUCO SINUCA</h1>
      </div>
      <div className="relative">
        <Bell size={20} className="text-white/80" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
      </div>
    </div>
  </header>
);

// Constants
const POOL_TABLE_IMAGE = "https://images.unsplash.com/photo-1585671962208-c7a332d8a6c7?auto=format&fit=crop&w=1200&q=80";

const TableCard: React.FC<{ table: TableData; onSelect: (id: number) => void }> = ({ table, onSelect }) => {
  const isReplayFresh = table.hasReplay && table.lastReplayTimestamp && (Date.now() - table.lastReplayTimestamp < 120000); // 2 mins

  return (
    <div 
      onClick={() => onSelect(table.id)}
      className="bg-macuco-card rounded-xl overflow-hidden shadow-lg border border-white/5 active:scale-95 transition-transform cursor-pointer relative group"
    >
      {/* Thumbnail Area */}
      <div className="aspect-video bg-black relative">
        <img 
          src={POOL_TABLE_IMAGE}
          alt="Mesa de Sinuca Profissional"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          referrerPolicy="no-referrer"
        />
        
        {/* Live Badge */}
        {table.isLive && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
            AO VIVO
          </div>
        )}

        {/* Replay Badge */}
        {isReplayFresh && (
          <div className="absolute top-2 right-2 bg-macuco-accent text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm animate-in fade-in zoom-in duration-300">
            <RefreshCw size={10} />
            REPLAY
          </div>
        )}

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 bg-macuco-green rounded-full flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play fill="currentColor" size={20} className="ml-1" />
          </div>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold text-lg">{table.name}</h3>
          <p className="text-gray-400 text-xs">Mesa Profissional</p>
        </div>
        <button className="bg-macuco-green hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
          ASSISTIR
        </button>
      </div>
    </div>
  );
};

const HomePage = ({ onSelectTable }: { onSelectTable: (id: number) => void }) => {
  const [tables, setTables] = React.useState<TableData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      setTables(data);
    } catch (err) {
      console.error("Failed to fetch tables", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 1000); // Poll every 1s for snappier updates
    return () => clearInterval(interval);
  }, []);

  // Debug function to simulate hardware button press
  const simulateHardwarePress = async (id: number) => {
    try {
      await fetch(`/api/tables/${id}/trigger`, { method: 'POST' });
      // Toast or feedback handled by global poller or local state update
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="min-h-screen bg-macuco-dark text-white flex items-center justify-center">Carregando mesas...</div>;

  return (
    <div className="min-h-screen bg-macuco-dark pb-20">
      <Header />
      <main className="container mx-auto p-4">
        <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <Video size={20} className="text-macuco-accent" />
          Mesas Disponíveis
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {tables.map(table => (
            <TableCard key={table.id} table={table} onSelect={onSelectTable} />
          ))}
        </div>

        {/* Debug / Demo Section */}
        <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <RefreshCw size={16} className="text-gray-400" />
            Simulador de Hardware (Debug)
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Toque em um botão abaixo para simular o acionamento do botão físico na mesa.
            Isso gerará um replay e enviará uma notificação.
          </p>
          <div className="flex flex-wrap gap-2">
            {tables.map(t => (
              <button 
                key={t.id}
                onClick={() => simulateHardwarePress(t.id)}
                className="bg-macuco-card hover:bg-macuco-accent hover:text-black text-white border border-white/20 px-3 py-2 rounded text-xs font-mono transition-colors"
              >
                Mesa {t.id}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

const TablePlayerPage = ({ id, onBack }: { id: number; onBack: () => void }) => {
  const [table, setTable] = React.useState<TableData | null>(null);
  const [mode, setMode] = React.useState<'live' | 'replay'>('live');
  const [notification, setNotification] = React.useState<string | null>(null);

  // Fetch table data
  const fetchTable = async () => {
    try {
      const res = await fetch(`/api/tables/${id}`);
      if (!res.ok) throw new Error('Table not found');
      const data = await res.json();
      
      // Check for new replay while watching
      setTable(prev => {
        if (prev && !prev.hasReplay && data.hasReplay) {
           // New replay detected!
           setNotification("Novo replay disponível!");
           setTimeout(() => setNotification(null), 5000);
        }
        return data;
      });
    } catch (err) {
      console.error(err);
      onBack();
    }
  };

  React.useEffect(() => {
    fetchTable();
    const interval = setInterval(fetchTable, 1000);
    return () => clearInterval(interval);
  }, [id]);

  const handleTriggerReplay = async () => {
    try {
      setNotification("Solicitando replay à mesa...");
      await fetch(`/api/tables/${id}/trigger`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  if (!table) return <div className="bg-macuco-dark min-h-screen" />;

  const activeUrl = mode === 'live' ? table.streamUrl : table.replayUrl;

  return (
    <div className="min-h-screen bg-macuco-dark flex flex-col">
      {/* Player Header */}
      <div className="bg-black p-4 flex items-center justify-between text-white">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg">{table.name}</h1>
          <div className="flex items-center justify-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", mode === 'live' ? "bg-red-500 animate-pulse" : "bg-macuco-accent")} />
            <span className="text-xs font-medium uppercase text-gray-300">
              {mode === 'live' ? 'Ao Vivo' : 'Replay'}
            </span>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full text-macuco-accent">
          <Share2 size={24} />
        </button>
      </div>

      {/* Video Player */}
      <div className="bg-black aspect-video w-full relative group">
        <video 
          key={activeUrl} // Force reload on url change
          src={activeUrl || ''} 
          controls 
          autoPlay
          muted={mode === 'live'} // Mute live by default to allow autoplay
          playsInline
          className="w-full h-full"
          poster={POOL_TABLE_IMAGE}
        />
        
        {/* Notification Overlay */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-macuco-accent text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-4 z-20 flex items-center gap-2">
            <AlertCircle size={16} />
            {notification}
          </div>
        )}
      </div>

      {/* Controls & Actions */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        
        {/* Mode Switcher */}
        {table.hasReplay && (
          <div className="bg-macuco-card p-1 rounded-lg flex border border-white/10">
            <button 
              onClick={() => setMode('live')}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                mode === 'live' ? "bg-macuco-green text-white shadow-sm" : "text-gray-400 hover:text-white"
              )}
            >
              AO VIVO
            </button>
            <button 
              onClick={() => setMode('replay')}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2",
                mode === 'replay' ? "bg-macuco-accent text-black shadow-sm" : "text-gray-400 hover:text-white"
              )}
            >
              <RefreshCw size={14} />
              VER REPLAY
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleTriggerReplay}
            className="bg-macuco-card border border-white/10 hover:bg-white/5 active:bg-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-macuco-accent group-hover:text-black transition-colors">
              <RefreshCw size={20} />
            </div>
            <span className="text-white text-sm font-semibold">Pedir Replay</span>
          </button>

          <button className="bg-macuco-card border border-white/10 hover:bg-white/5 active:bg-white/10 p-4 rounded-xl flex flex-col items-center gap-2 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-colors">
              <Beer size={20} />
            </div>
            <span className="text-white text-sm font-semibold">Pedir Bebida</span>
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-macuco-card rounded-xl p-4 border border-white/5 mt-auto">
          <h3 className="text-white font-bold mb-2">Sobre a Mesa</h3>
          <p className="text-gray-400 text-sm">
            Mesa profissional padrão internacional. 
            Toque no botão físico na mesa ou use o app para gerar um replay instantâneo dos últimos 50 segundos.
          </p>
        </div>
      </div>
    </div>
  );
};

// Global Notification Poller
const GlobalNotification = () => {
  const [lastReplayTime, setLastReplayTime] = React.useState<number>(Date.now());
  const [toast, setToast] = React.useState<{message: string, visible: boolean}>({ message: '', visible: false });

  React.useEffect(() => {
    const checkReplays = async () => {
      try {
        const res = await fetch('/api/tables');
        const tables: TableData[] = await res.json();
        
        // Find any replay newer than our last check
        const newReplay = tables.find(t => t.lastReplayTimestamp && t.lastReplayTimestamp > lastReplayTime);
        
        if (newReplay && newReplay.lastReplayTimestamp) {
          setLastReplayTime(newReplay.lastReplayTimestamp);
          setToast({ message: `Replay pronto na ${newReplay.name}!`, visible: true });
          setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 5000);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const interval = setInterval(checkReplays, 1000);
    return () => clearInterval(interval);
  }, [lastReplayTime]);

  if (!toast.visible) return null;

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-80 bg-macuco-accent text-black p-4 rounded-xl shadow-2xl z-50 animate-in slide-in-from-top-5 flex items-center gap-3 cursor-pointer" onClick={() => setToast(prev => ({ ...prev, visible: false }))}>
      <div className="bg-black/10 p-2 rounded-full">
        <RefreshCw size={20} />
      </div>
      <div>
        <h4 className="font-bold text-sm">Novo Replay!</h4>
        <p className="text-xs font-medium opacity-90">{toast.message}</p>
      </div>
    </div>
  );
};

export default function App() {
  const [currentTableId, setCurrentTableId] = React.useState<number | null>(null);

  return (
    <>
      <GlobalNotification />
      {currentTableId ? (
        <TablePlayerPage id={currentTableId} onBack={() => setCurrentTableId(null)} />
      ) : (
        <HomePage onSelectTable={setCurrentTableId} />
      )}
    </>
  );
}
