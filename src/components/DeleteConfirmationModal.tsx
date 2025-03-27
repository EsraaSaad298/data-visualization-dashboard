import React from 'react';
import { DataPacket } from '../services/WebSocketService';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  node?: DataPacket | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  node,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-slate-900 text-white p-6 rounded shadow-lg w-full max-w-sm border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p className="text-sm mb-4 text-slate-300">
          Are you sure you want to delete <span className="font-bold">{node?.name || 'this node'}</span>?
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-white text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-white text-sm"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
