import React from 'react';
import { DataPacket } from '../services/WebSocketService';

interface NodeDetailsModalProps {
  node: DataPacket | null;
  onClose: () => void;
  onDelete: () => void;
}

const NodeDetailsModal: React.FC<NodeDetailsModalProps> = ({ node, onClose, onDelete }) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-slate-900 text-white p-6 rounded shadow-lg w-full max-w-md border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">{node.name}</h2>
        <ul className="text-sm space-y-2">
          <li><strong>Category:</strong> {node.category}</li>
          <li><strong>Status:</strong> {node.status}</li>
          <li><strong>Value:</strong> {node.value.toFixed(2)}</li>
          <li><strong>Timestamp:</strong> {new Date(node.timestamp).toLocaleString()}</li>
        </ul>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-white text-sm"
          >
            Close
          </button>

          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm"
          >
            🗑 Delete Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsModal;
