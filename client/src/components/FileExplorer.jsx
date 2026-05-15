import React, { useState } from 'react';
import { Folder, FolderOpen, File, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import * as Y from 'yjs';

const FileExplorer = ({ yTree, yFiles, tree, activeFileId, setActiveFileId, expandedFolders, setExpandedFolders }) => {
  const [isCreating, setIsCreating] = useState(null); // { type: 'file' | 'folder', parentId: string }
  const [newName, setNewName] = useState('');

  const handleCreate = (e, type, parentId) => {
    e.stopPropagation();
    setIsCreating({ type, parentId });
    setNewName('');
    if (!expandedFolders.has(parentId) && parentId !== 'root') {
      const newExpanded = new Set(expandedFolders);
      newExpanded.add(parentId);
      setExpandedFolders(newExpanded);
    }
  };

  const submitCreate = () => {
    if (!newName.trim() || !isCreating) {
      setIsCreating(null);
      return;
    }
    
    const { type, parentId } = isCreating;
    const name = newName.trim();
    
    // Check for duplicates in same folder
    const siblings = Object.values(tree).filter(node => node.parentId === parentId);
    if (siblings.some(node => node.name === name)) {
      alert(`A file or folder named ${name} already exists at this location.`);
      setIsCreating(null);
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    
    yTree.set(id, {
      id,
      name,
      type,
      parentId
    });

    if (type === 'file') {
      setActiveFileId(id);
    }
    
    setIsCreating(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this?')) {
      const toDelete = [id];
      // Recursive delete for folders
      let i = 0;
      while (i < toDelete.length) {
        const currentId = toDelete[i];
        const children = Object.values(tree).filter(node => node.parentId === currentId);
        toDelete.push(...children.map(c => c.id));
        i++;
      }
      
      toDelete.forEach(delId => {
        yTree.delete(delId);
        yFiles.delete(delId); // Cleanup text
        if (activeFileId === delId) {
          setActiveFileId(null);
        }
      });
    }
  };

  const toggleFolder = (e, id) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (nodeId, depth) => {
    const node = tree[nodeId];
    if (!node) return null;

    const isExpanded = expandedFolders.has(nodeId);
    const isSelected = activeFileId === nodeId;
    const children = Object.values(tree).filter(n => n.parentId === nodeId);
    
    // Sort folders first, then files, then alphabetically
    children.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return (
      <div key={nodeId}>
        <div 
          className={`group flex items-center justify-between py-1 px-2 cursor-pointer text-[13px] hover:bg-[#2a2d2e] ${isSelected ? 'bg-[#37373d] text-white' : 'text-[#cccccc]'}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={(e) => node.type === 'folder' ? toggleFolder(e, nodeId) : setActiveFileId(nodeId)}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {node.type === 'folder' ? (
               isExpanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />
            ) : (
               <span className="w-3.5 inline-block"></span> // Placeholder for alignment
            )}
            {node.type === 'folder' ? (
              isExpanded ? <FolderOpen size={14} className="text-blue-400 shrink-0" /> : <Folder size={14} className="text-blue-400 shrink-0" />
            ) : (
              <File size={14} className="text-gray-400 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>
          
          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
            {node.type === 'folder' && (
              <>
                <button onClick={(e) => handleCreate(e, 'file', nodeId)} className="p-0.5 hover:bg-gray-600 rounded">
                  <File size={12} />
                </button>
                <button onClick={(e) => handleCreate(e, 'folder', nodeId)} className="p-0.5 hover:bg-gray-600 rounded">
                  <Folder size={12} />
                </button>
              </>
            )}
            <button onClick={(e) => handleDelete(e, nodeId)} className="p-0.5 hover:bg-gray-600 rounded">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        
        {isExpanded && node.type === 'folder' && (
          <div>
            {children.map(child => renderNode(child.id, depth + 1))}
            {isCreating && isCreating.parentId === nodeId && (
              <div className="flex items-center gap-1.5 py-1 px-2" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
                {isCreating.type === 'folder' ? <Folder size={14} className="text-blue-400" /> : <File size={14} className="text-gray-400" />}
                <input 
                  autoFocus
                  className="bg-[#3c3c3c] text-white border border-[#007fd4] text-[13px] px-1 w-full outline-none"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') submitCreate();
                    if (e.key === 'Escape') setIsCreating(null);
                  }}
                  onBlur={() => submitCreate()}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const rootChildren = Object.values(tree).filter(n => n.parentId === 'root');
  rootChildren.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-2 group">
        <span className="text-[11px] font-semibold text-white tracking-wider uppercase">Explorer</span>
        <div className="hidden group-hover:flex items-center gap-1">
          <button onClick={(e) => handleCreate(e, 'file', 'root')} className="p-1 hover:bg-[#333333] rounded text-[#cccccc] hover:text-white" title="New File">
            <File size={14} />
          </button>
          <button onClick={(e) => handleCreate(e, 'folder', 'root')} className="p-1 hover:bg-[#333333] rounded text-[#cccccc] hover:text-white" title="New Folder">
            <Plus size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {rootChildren.length === 0 && !isCreating ? (
          <div className="p-4 text-[13px] text-gray-400 text-center">
            <p>No files yet.</p>
            <button onClick={(e) => handleCreate(e, 'file', 'root')} className="mt-2 text-blue-400 hover:text-blue-300">Create your first file</button>
          </div>
        ) : (
          <div className="py-1">
            {rootChildren.map(child => renderNode(child.id, 0))}
            {isCreating && isCreating.parentId === 'root' && (
              <div className="flex items-center gap-1.5 py-1 px-2 pl-2">
                {isCreating.type === 'folder' ? <Folder size={14} className="text-blue-400" /> : <File size={14} className="text-gray-400" />}
                <input 
                  autoFocus
                  className="bg-[#3c3c3c] text-white border border-[#007fd4] text-[13px] px-1 w-full outline-none"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') submitCreate();
                    if (e.key === 'Escape') setIsCreating(null);
                  }}
                  onBlur={() => submitCreate()}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
