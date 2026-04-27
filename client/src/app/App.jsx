import Editor from '@monaco-editor/react';
import { Users, FileCode2, Settings, Terminal, Share2 } from 'lucide-react';
import { MonacoBinding } from "y-monaco";
import { useRef, useMemo, useState } from "react";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io"

const connectedUsers = [
  { id: 1, name: 'Ansh (You)', color: 'bg-blue-500', status: 'online' },
  { id: 2, name: 'Alex Johnson', color: 'bg-green-500', status: 'online' },
  { id: 3, name: 'Maria Silva', color: 'bg-purple-500', status: 'away' },
];

const App = () => {

  const [username, setUsername] = useState("");


  const editorRef = useRef(null);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("code"), []);

  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  const handleMount = (editor) => {
    editorRef.current = editor;

    if (!providerRef.current) {
      providerRef.current = new SocketIOProvider("ws://localhost:3000", "monaco", ydoc, {
        autoConnect: true,
      });
      providerRef.current.on('status', ({ status }) => {
        console.log("SocketIOProvider status:", status);
      });
    }

    if (!bindingRef.current) {
      bindingRef.current = new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        providerRef.current.awareness
      );
    }
  }

  if (!username) {
    return (
      <main className='h-screen w-full bg-gray-900 flex items-center justify-center' >
        <div className='flex flex-col gap-4'>
          <input   type="text"
           placeholder='Enter your username' 
            className='p-2 border border-gray-300 rounded' />
            <button className="p-2 bg-blue-500 text-white rounded" onClick={() => setUsername(username)}>Join</button>

        </div>
      </main>
    )
  }


  return (
    <div className="flex h-screen w-screen bg-[#1e1e1e] text-[#cccccc] font-sans overflow-hidden">
      {/* Activity Bar */}
      <div className="w-12 border-r border-[#2d2d2d] bg-[#333333] flex flex-col items-center py-2 shrink-0 z-10">
        <div className="flex flex-col gap-4 w-full items-center">
          <button className="p-2 text-[#858585] hover:text-white transition-colors cursor-pointer">
            <FileCode2 size={24} strokeWidth={1.5} />
          </button>
          <button className="p-2 text-white border-l-2 border-blue-500 cursor-pointer -ml-[2px] pl-[10px]">
            <Users size={24} strokeWidth={1.5} />
          </button>
          <button className="p-2 text-[#858585] hover:text-white transition-colors cursor-pointer">
            <Share2 size={24} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-auto flex flex-col gap-4 pb-2 w-full items-center">
          <button className="p-2 text-[#858585] hover:text-white transition-colors cursor-pointer">
            <Settings size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Primary Sidebar (People Connected) */}
      <div className="w-64 border-r border-[#2d2d2d] bg-[#252526] flex flex-col shrink-0 z-10">
        <div className="px-5 py-3 text-[11px] font-semibold text-white tracking-wider uppercase">
          Live Share: Participants
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col px-2 gap-1 mt-1">
            {connectedUsers.map(user => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#2a2d2e] rounded-md cursor-pointer group transition-colors"
                title={user.name}
              >
                <div className="relative flex shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[13px] font-medium shadow-sm ${user.color}`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#252526] ${user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
                <span className="text-[13px] font-medium truncate pr-2 group-hover:text-white text-[#cccccc] transition-colors">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0">
        {/* Editor Tabs */}
        <div className="flex h-9 bg-[#2d2d2d] shrink-0 overflow-x-auto overflow-y-hidden items-end ps-0">
          <div className="bg-[#1e1e1e] text-[#cccccc] border-t-2 border-t-blue-500 px-4 py-1.5 text-[13px] flex items-center gap-2 cursor-pointer border-r border-[#2d2d2d] min-w-[120px] max-w-[200px]">
            <span className="text-yellow-400 font-medium text-xs border border-yellow-400/30 px-1 rounded-sm">JS</span>
            <span className="truncate">main.js</span>
          </div>
          <div className="bg-[#2d2d2d] text-[#858585] border-t-2 border-t-transparent hover:bg-[#252526] hover:text-white px-4 py-1.5 text-[13px] flex items-center gap-2 cursor-pointer border-r border-[#2d2d2d] min-w-[120px] max-w-[200px] transition-colors">
            <span className="text-blue-400 font-medium text-xs border border-blue-400/30 px-1 rounded-sm">#</span>
            <span className="truncate">styles.css</span>
          </div>
          <div className="flex-1 border-b border-[#2d2d2d] self-stretch"></div>
        </div>

        {/* Editor Instance */}
        <div className="flex-1 relative pt-2">
          <Editor
            height="100%"
            onMount={handleMount}
            defaultLanguage="javascript"
            theme="vs-dark"
            defaultValue='function helloWorld() {\n  console.log("Hello, world!");\n}'
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace",
              wordWrap: "on",
              lineHeight: 24,
              padding: { top: 16 }
            }}
          />
        </div>

        {/* Status Bar */}
        <div className="h-[22px] bg-[#007acc] shrink-0 flex items-center px-3 text-white text-[12px] font-medium justify-between shadow-[0_-1px_3px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 hover:bg-[#1f8ad2] px-1.5 py-0.5 rounded transition-colors">
              <Share2 size={12} />
              <span>Live Share</span>
            </button>
            <div className="flex items-center gap-1 hover:bg-[#1f8ad2] px-1.5 py-0.5 rounded cursor-pointer transition-colors">
              <Terminal size={12} />
              <span>Terminal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hover:bg-[#1f8ad2] px-1.5 py-0.5 rounded cursor-pointer transition-colors">Ln 3, Col 34</span>
            <span className="hover:bg-[#1f8ad2] px-1.5 py-0.5 rounded cursor-pointer transition-colors">UTF-8</span>
            <span className="hover:bg-[#1f8ad2] px-1.5 py-0.5 rounded cursor-pointer transition-colors">JavaScript</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

