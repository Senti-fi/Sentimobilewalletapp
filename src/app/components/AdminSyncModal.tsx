import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Cloud,
  CloudUpload,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Database,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { adminSyncService, SyncResult, UserSyncResult, LocalRegisteredUser } from '../../services/adminSync';
import { UserProfile } from '../../services/supabase';

interface AdminSyncModalProps {
  onClose: () => void;
}

type SyncState = 'idle' | 'loading' | 'syncing' | 'complete';

export default function AdminSyncModal({ onClose }: AdminSyncModalProps) {
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const [localUsers, setLocalUsers] = useState<LocalRegisteredUser[]>([]);
  const [supabaseUsers, setSupabaseUsers] = useState<UserProfile[]>([]);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [activeTab, setActiveTab] = useState<'local' | 'supabase'>('local');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setSyncState('loading');
    try {
      const local = adminSyncService.getLocalUsers();
      const supabase = await adminSyncService.getSupabaseUsers();
      setLocalUsers(local);
      setSupabaseUsers(supabase);
      setSyncState('idle');
    } catch (err) {
      console.error('Failed to load data:', err);
      setSyncState('idle');
    }
  };

  const handleSync = async () => {
    setSyncState('syncing');
    setProgress({ current: 0, total: localUsers.length });

    try {
      const result = await adminSyncService.syncAllUsers((current, total) => {
        setProgress({ current, total });
      });
      setSyncResult(result);
      setSyncState('complete');

      // Reload data to show updated state
      const supabase = await adminSyncService.getSupabaseUsers();
      setSupabaseUsers(supabase);
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncState('idle');
    }
  };

  const getStatusIcon = (status: UserSyncResult['status']) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'already_exists':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: UserSyncResult['status']) => {
    switch (status) {
      case 'synced':
        return 'bg-green-50 text-green-700';
      case 'already_exists':
        return 'bg-yellow-50 text-yellow-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      case 'skipped':
        return 'bg-gray-50 text-gray-600';
    }
  };

  // Calculate pending sync count (check both handle and username)
  const supabaseHandles = new Set(supabaseUsers.map(u => u.handle.toLowerCase()));
  const supabaseUsernames = new Set(supabaseUsers.map(u => u.username.toLowerCase()));

  const getSourceLabel = (source: LocalRegisteredUser['source']) => {
    switch (source) {
      case 'registered_users': return 'Registry';
      case 'user_specific_keys': return 'User Keys';
      case 'global_keys': return 'Current User';
      case 'contacts': return 'Contacts';
      default: return 'Unknown';
    }
  };

  const getSourceColor = (source: LocalRegisteredUser['source']) => {
    switch (source) {
      case 'registered_users': return 'bg-purple-100 text-purple-700';
      case 'user_specific_keys': return 'bg-blue-100 text-blue-700';
      case 'global_keys': return 'bg-green-100 text-green-700';
      case 'contacts': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const pendingCount = localUsers.filter(u => {
    const handle = u.id.startsWith('@') ? u.id.toLowerCase() : `@${u.id.toLowerCase()}`;
    const username = handle.replace('@', '').replace('.senti', '');
    return !supabaseHandles.has(handle) && !supabaseUsernames.has(username);
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <CloudUpload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Admin Sync</h2>
              <p className="text-sm text-gray-500">Sync local users to Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 p-6 border-b border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{localUsers.length}</p>
            <p className="text-xs text-gray-500">Local Users</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <Database className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-blue-900">{supabaseUsers.length}</p>
            <p className="text-xs text-blue-600">In Supabase</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <CloudUpload className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-amber-900">{pendingCount}</p>
            <p className="text-xs text-amber-600">Pending Sync</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'local'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Local Storage ({localUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'supabase'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Supabase ({supabaseUsers.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {syncState === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          )}

          {syncState === 'syncing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <Cloud className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-900 font-medium mb-2">Syncing to Supabase...</p>
              <p className="text-gray-500 text-sm">
                {progress.current} / {progress.total} users
              </p>
              <div className="w-48 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {syncState === 'complete' && syncResult && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-900">Sync Complete</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-green-700">{syncResult.synced}</p>
                    <p className="text-xs text-green-600">Synced</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-yellow-700">{syncResult.alreadyExists}</p>
                    <p className="text-xs text-yellow-600">Existed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-700">{syncResult.failed}</p>
                    <p className="text-xs text-red-600">Failed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-700">{syncResult.skipped}</p>
                    <p className="text-xs text-gray-600">Skipped</p>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 px-1">Details</h4>
                {syncResult.details.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl ${getStatusColor(result.status)}`}
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.handle}</p>
                      <p className="text-xs opacity-75 truncate">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {syncState === 'idle' && activeTab === 'local' && (
            <div className="space-y-2">
              {localUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No local users found</p>
                  <p className="text-xs mt-2">Scanning: registered_users, user keys, contacts</p>
                </div>
              ) : (
                localUsers.map((user, index) => {
                  const handle = user.id.startsWith('@') ? user.id.toLowerCase() : `@${user.id.toLowerCase()}`;
                  const username = handle.replace('@', '').replace('.senti', '');
                  const existsInSupabase = supabaseHandles.has(handle) || supabaseUsernames.has(username);

                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        existsInSupabase ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-sm font-bold">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${getSourceColor(user.source)}`}>
                            {getSourceLabel(user.source)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{user.id}</p>
                        {user.walletAddress && (
                          <p className="text-xs text-gray-400 truncate font-mono">
                            {user.walletAddress.slice(0, 10)}...
                          </p>
                        )}
                      </div>
                      {existsInSupabase ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Synced
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                          <CloudUpload className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {syncState === 'idle' && activeTab === 'supabase' && (
            <div className="space-y-2">
              {supabaseUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No users in Supabase yet</p>
                </div>
              ) : (
                supabaseUsers.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.handle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          {syncState === 'idle' && (
            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleSync}
                disabled={pendingCount === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                  pendingCount === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg'
                }`}
              >
                <CloudUpload className="w-4 h-4" />
                Sync {pendingCount} Users
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {syncState === 'complete' && (
            <button
              onClick={() => {
                setSyncResult(null);
                setSyncState('idle');
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Done
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
