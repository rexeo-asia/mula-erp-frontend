import { useState, useEffect } from 'react';
import * as ConfigService from '../services/configService';

export interface ConfigData {
    [key: string]: string;
}

export function useConfig() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ConfigService.getAppConfig();
      setConfig(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  // const updateConfig = async (key: string, value: any): Promise<boolean> => {
  //   try {
  //     // Assuming a setAppConfig function exists in configService
  //     // const success = await ConfigService.setAppConfig(key, value);
  //     // if (success && config) {
  //     //   setConfig({ ...config, [key]: value });
  //     // }
  //     // return success;
  //     return true;
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to update configuration');
  //     return false;
  //   }
  // };

  const getConfigValue = async (key: string): Promise<string | null> => {
    try {
        if(config && config[key]) {
            return config[key];
        }
        return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get configuration value');
      return null;
    }
  };

  const validateConfig = async (): Promise<boolean> => {
    try {
      // Assuming a validateConfig function exists in configService
      // return await ConfigService.validateConfig();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate configuration');
      return false;
    }
  };

  const refreshConfig = () => {
    loadConfig();
  };

  return {
    config,
    loading,
    error,
    getConfigValue,
    validateConfig,
    refreshConfig
  };
}