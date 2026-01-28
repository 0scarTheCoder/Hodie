import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { wearableService } from '../../services/wearableService';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Watch, 
  Activity, 
  Heart, 
  CheckCircle, 
  AlertCircle,
  Loader,
  Plus,
  Trash2
} from 'lucide-react';

interface DeviceIntegrationProps {
  user: User;
}

interface DeviceCard {
  id: string;
  name: string;
  type: 'apple_health' | 'google_fit' | 'fitbit' | 'garmin' | 'samsung_health';
  icon: React.ComponentType<any>;
  description: string;
  supported: boolean;
  connected: boolean;
  lastSync?: Date;
}

const DeviceIntegration: React.FC<DeviceIntegrationProps> = ({ user }) => {
  const [devices, setDevices] = useState<DeviceCard[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ [key: string]: 'idle' | 'syncing' | 'success' | 'error' }>({});

  useEffect(() => {
    initialiseDevices();
  }, []);

  const initialiseDevices = () => {
    const deviceList: DeviceCard[] = [
      {
        id: 'apple_health',
        name: 'Apple Health',
        type: 'apple_health',
        icon: Smartphone,
        description: 'Sync steps, heart rate, sleep, and health metrics from your iPhone',
        supported: /iPad|iPhone|iPod/.test(navigator.userAgent),
        connected: false
      },
      {
        id: 'google_fit',
        name: 'Google Fit',
        type: 'google_fit',
        icon: Activity,
        description: 'Import activity data from Google Fit and Android devices',
        supported: true,
        connected: false
      },
      {
        id: 'fitbit',
        name: 'Fitbit',
        type: 'fitbit',
        icon: Watch,
        description: 'Connect your Fitbit device for comprehensive health tracking',
        supported: true,
        connected: false
      },
      {
        id: 'garmin',
        name: 'Garmin',
        type: 'garmin',
        icon: Watch,
        description: 'Sync fitness data from Garmin watches and devices',
        supported: false, // Future implementation
        connected: false
      },
      {
        id: 'samsung_health',
        name: 'Samsung Health',
        type: 'samsung_health',
        icon: Heart,
        description: 'Import health data from Samsung Health app',
        supported: false, // Future implementation
        connected: false
      }
    ];

    // Check current connection status
    const connectedDevices = wearableService.getConnectedDevices();
    deviceList.forEach(device => {
      device.connected = connectedDevices.some(connected => connected.type === device.type);
      if (device.connected) {
        const connectedDevice = connectedDevices.find(d => d.type === device.type);
        device.lastSync = connectedDevice?.lastSync;
      }
    });

    setDevices(deviceList);
  };

  const handleConnect = async (device: DeviceCard) => {
    if (!device.supported) {
      alert(`${device.name} integration is coming soon!`);
      return;
    }

    setLoading(device.id);
    try {
      let success = false;

      switch (device.type) {
        case 'apple_health':
          success = await wearableService.connectAppleHealth();
          break;
        case 'google_fit':
          success = await wearableService.connectGoogleFit();
          break;
        case 'fitbit':
          success = await wearableService.connectFitbit();
          break;
        default:
          throw new Error(`${device.name} integration not implemented yet`);
      }

      if (success) {
        // Update device status
        setDevices(prev => prev.map(d => 
          d.id === device.id 
            ? { ...d, connected: true, lastSync: new Date() }
            : d
        ));

        // Start initial sync
        await handleSync(device);
      }
    } catch (error) {
      console.error(`Failed to connect ${device.name}:`, error);
      alert(`Failed to connect to ${device.name}. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (device: DeviceCard) => {
    const confirmed = window.confirm(
      `Are you sure you want to disconnect ${device.name}? This will stop syncing your health data.`
    );

    if (!confirmed) return;

    setLoading(device.id);
    try {
      const success = await wearableService.disconnectDevice(device.type);
      
      if (success) {
        setDevices(prev => prev.map(d => 
          d.id === device.id 
            ? { ...d, connected: false, lastSync: undefined }
            : d
        ));
      }
    } catch (error) {
      console.error(`Failed to disconnect ${device.name}:`, error);
      alert(`Failed to disconnect ${device.name}. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  const handleSync = async (device: DeviceCard) => {
    if (!device.connected) return;

    setSyncStatus(prev => ({ ...prev, [device.id]: 'syncing' }));
    
    try {
      const data = await wearableService.syncDeviceData(device.type);
      
      setSyncStatus(prev => ({ ...prev, [device.id]: 'success' }));
      
      // Update last sync time
      setDevices(prev => prev.map(d => 
        d.id === device.id 
          ? { ...d, lastSync: new Date() }
          : d
      ));

      console.log(`Synced ${data.length} records from ${device.name}`);
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, [device.id]: 'idle' }));
      }, 3000);
      
    } catch (error) {
      console.error(`Sync failed for ${device.name}:`, error);
      setSyncStatus(prev => ({ ...prev, [device.id]: 'error' }));
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setSyncStatus(prev => ({ ...prev, [device.id]: 'idle' }));
      }, 5000);
    }
  };

  const getSyncStatusIcon = (deviceId: string) => {
    const status = syncStatus[deviceId] || 'idle';
    
    switch (status) {
      case 'syncing':
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Integration</h1>
          <p className="text-gray-600">
            Connect your wearable devices and health apps to automatically sync your health data
          </p>
        </div>

        {/* Connected Devices Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-centre space-x-2">
            <Activity className="text-blue-600" size={24} />
            <span>Connected Devices</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-centre p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {devices.filter(d => d.connected).length}
              </div>
              <div className="text-sm text-gray-600">Connected</div>
            </div>
            
            <div className="text-centre p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {devices.filter(d => d.lastSync && 
                  new Date().getTime() - d.lastSync.getTime() < 24 * 60 * 60 * 1000
                ).length}
              </div>
              <div className="text-sm text-gray-600">Synced Today</div>
            </div>
            
            <div className="text-centre p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {devices.filter(d => d.supported).length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>

        {/* Device Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {devices.map((device, index) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
                device.connected 
                  ? 'border-green-200 bg-green-50' 
                  : device.supported 
                    ? 'border-gray-200 hover:border-blue-300 hover:shadow-xl' 
                    : 'border-gray-100 opacity-75'
              }`}
            >
              {/* Device Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-centre space-x-3">
                  <div className={`p-3 rounded-xl ${
                    device.connected ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <device.icon 
                      size={24} 
                      className={device.connected ? 'text-green-600' : 'text-gray-600'} 
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{device.name}</h3>
                    <div className="flex items-centre space-x-2">
                      {device.connected ? (
                        <span className="text-sm text-green-600 flex items-centre space-x-1">
                          <CheckCircle size={16} />
                          <span>Connected</span>
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Not connected</span>
                      )}
                      {getSyncStatusIcon(device.id)}
                    </div>
                  </div>
                </div>
                
                {!device.supported && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Device Description */}
              <p className="text-gray-600 text-sm mb-4">{device.description}</p>

              {/* Last Sync Info */}
              {device.connected && device.lastSync && (
                <div className="text-xs text-gray-500 mb-4">
                  Last synced: {device.lastSync.toLocaleString()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {device.connected ? (
                  <>
                    <button
                      onClick={() => handleSync(device)}
                      disabled={loading === device.id || syncStatus[device.id] === 'syncing'}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-centre justify-centre space-x-2"
                    >
                      {syncStatus[device.id] === 'syncing' ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Activity size={16} />
                      )}
                      <span>Sync Now</span>
                    </button>
                    
                    <button
                      onClick={() => handleDisconnect(device)}
                      disabled={loading === device.id}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(device)}
                    disabled={loading === device.id || !device.supported}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-centre justify-centre space-x-2"
                  >
                    {loading === device.id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    <span>{device.supported ? 'Connect' : 'Coming Soon'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 text-sm">
            Device integrations require specific permissions on your device. Make sure to allow 
            health data access when prompted. If you're having trouble connecting, try refreshing 
            the page or checking your device's privacy settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceIntegration;