import React, { useMemo, useState } from 'react';
import { DataPacket, useWebSocketService } from './services/WebSocketService';
import DashboardLayout from './layout/DashboardLayout';
import VisualizationManager from './components/VisualizationManager';
import NodeDetailsModal from './components/NodeDetailsModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import LayoutToggle from './components/LayoutToggle';
import CategoryLabelsHeader from './components/CategoryLabelsHeader';

const App: React.FC = () => {
  const { isConnected, dataStream } = useWebSocketService('wss://ws.postman-echo.com/raw');

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [timeRange, setTimeRange] = useState(60);
  const [layoutMode, setLayoutMode] = useState<'clustered' | 'freeform'>('clustered');
  const [selectedNode, setSelectedNode] = useState<DataPacket | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteAudio = new Audio('/sounds/delete.mp3');
  const [fps, setFps] = useState(0);

  // ✅ Deletion state
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // ✅ Clean filtering logic
  const now = Date.now();
  const filteredData = useMemo(() => {
    return dataStream
      .filter((d) => !deletedIds.has(d.id))
      .filter((d) => {
        const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
        const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
        const withinTime = now - d.timestamp <= timeRange * 1000;
        return matchesCategory && matchesStatus && withinTime;
      });
  }, [dataStream, categoryFilter, statusFilter, timeRange, deletedIds]);

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setDeletedIds((prev) => new Set(prev).add(selectedNode.id));
    setSelectedNode(null);
    setShowDeleteModal(false);
    deleteAudio.play().catch(() => {});
  };

  return (
    <DashboardLayout>
      {/* 🔹 Sticky Top Header */}
      <div className="sticky top-0 z-50 bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-700">
        <h1 className="text-xl font-bold text-cyan-400">Device Networks Node Analytics</h1>
        <div className="flex items-center space-x-6">
          <div className="text-sm text-lime-400">FPS: {fps}</div>
          <LayoutToggle layout={layoutMode} onChange={setLayoutMode} />
        </div>
      </div>

      {/* 🔎 Filters Section */}
      <div className="mt-6 space-y-6 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              WebSocket:{' '}
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </p>
            <p className="text-sm text-slate-400">
              Total Data Points: {dataStream.length}
            </p>
          </div>

          <div className="flex gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-800 text-white px-3 py-2 pr-8 rounded appearance-none min-w-max"
            >
              <option value="All">All Categories</option>
              <option value="Sensor">🔵 Sensor</option>
              <option value="System">🟣 System</option>
              <option value="Event">🟡 Event</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 text-white px-3 py-2 pr-8 rounded appearance-none min-w-max"
            >
              <option value="All">All Statuses</option>
              <option value="active">🟢 Active</option>
              <option value="idle">🟠 Idle</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold text-sm text-slate-300">
            Time Range Filter (seconds ago)
          </label>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <p className="text-xs text-slate-500 mt-1">
            Showing data from 0s to {timeRange}s ago
          </p>
        </div>
      </div>

      {/* 📦 Category Header */}
      <CategoryLabelsHeader />

      {/* 🗺️ Visualization */}
      <div className="px-6 mt-2 pb-12 overflow-hidden">
        <VisualizationManager
          height={700}
          data={filteredData}
          layoutMode={layoutMode}
          onNodeClick={setSelectedNode}
          onFpsUpdate={setFps}
        />
      </div>

      {/* 🔍 Details Modal */}
      <NodeDetailsModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onDelete={() => setShowDeleteModal(true)}
      />

      {/* 🗑️ Delete Confirmation */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteNode}
        node={selectedNode}
      />
    </DashboardLayout>
  );
};

export default App;
