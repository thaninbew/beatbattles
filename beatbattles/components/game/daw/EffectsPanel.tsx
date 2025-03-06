import React, { useState, useEffect } from 'react';
import { EffectType, createEffect, connectEffects } from '../../../lib/audio/toneUtils';

interface Effect {
  id: string;
  type: EffectType;
  settings: Record<string, number>;
}

interface EffectsPanelProps {
  trackId: string;
  synth: any;
  onEffectsChange: (effects: Effect[]) => void;
  initialEffects?: Effect[];
}

const DEFAULT_EFFECT_SETTINGS: Record<EffectType, Record<string, number>> = {
  [EffectType.REVERB]: { decay: 1.5, wet: 0.5 },
  [EffectType.DELAY]: { delayTime: 0.25, feedback: 0.5, wet: 0.5 },
  [EffectType.DISTORTION]: { distortion: 0.4, wet: 0.5 },
  [EffectType.CHORUS]: { frequency: 4, depth: 0.5, wet: 0.5 },
  [EffectType.PHASER]: { frequency: 0.5, octaves: 3, wet: 0.5 },
  [EffectType.TREMOLO]: { frequency: 10, depth: 0.5, wet: 0.5 },
  [EffectType.VIBRATO]: { frequency: 5, depth: 0.1, wet: 0.5 },
  [EffectType.AUTO_FILTER]: { frequency: 1, depth: 0.6, wet: 0.5 },
  [EffectType.AUTO_PANNER]: { frequency: 1, depth: 0.5, wet: 0.5 },
  [EffectType.PING_PONG_DELAY]: { delayTime: 0.25, feedback: 0.5, wet: 0.5 },
};

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

const EffectsPanel: React.FC<EffectsPanelProps> = ({
  trackId,
  synth,
  onEffectsChange,
  initialEffects = [],
}) => {
  const [effects, setEffects] = useState<Effect[]>(initialEffects);
  const [effectNodes, setEffectNodes] = useState<any[]>([]);
  
  // Create effect nodes when effects change
  useEffect(() => {
    // Dispose of old effect nodes
    effectNodes.forEach(node => {
      if (node && typeof node.dispose === 'function') {
        node.dispose();
      }
    });
    
    // Create new effect nodes
    const newEffectNodes = effects.map(effect => {
      return createEffect(effect.type, effect.settings);
    });
    
    setEffectNodes(newEffectNodes);
    
    // Connect effects to synth if synth exists
    if (synth && newEffectNodes.length > 0) {
      connectEffects(synth, newEffectNodes);
    }
    
    // Notify parent component
    onEffectsChange(effects);
    
    // Cleanup function
    return () => {
      newEffectNodes.forEach(node => {
        if (node && typeof node.dispose === 'function') {
          node.dispose();
        }
      });
    };
  }, [effects, synth, onEffectsChange]);
  
  // Add a new effect
  const handleAddEffect = (type: EffectType) => {
    const newEffect: Effect = {
      id: generateId(),
      type,
      settings: { ...DEFAULT_EFFECT_SETTINGS[type] },
    };
    
    setEffects(prev => [...prev, newEffect]);
  };
  
  // Remove an effect
  const handleRemoveEffect = (id: string) => {
    setEffects(prev => prev.filter(effect => effect.id !== id));
  };
  
  // Update effect settings
  const handleSettingChange = (id: string, setting: string, value: number) => {
    setEffects(prev =>
      prev.map(effect => {
        if (effect.id === id) {
          return {
            ...effect,
            settings: {
              ...effect.settings,
              [setting]: value,
            },
          };
        }
        return effect;
      })
    );
  };
  
  // Render effect controls
  const renderEffectControls = (effect: Effect) => {
    return (
      <div key={effect.id} className="bg-white p-3 rounded-md shadow-sm mb-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">{effect.type}</h4>
          <button
            onClick={() => handleRemoveEffect(effect.id)}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
        
        <div className="space-y-2">
          {Object.entries(effect.settings).map(([setting, value]) => (
            <div key={setting} className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1 capitalize">
                {setting}: {value.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => handleSettingChange(effect.id, setting, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-gray-50 p-4 border border-gray-200 rounded-md">
      <h3 className="text-lg font-medium mb-4">Effects</h3>
      
      {/* Effect list */}
      <div className="mb-4">
        {effects.length === 0 ? (
          <p className="text-sm text-gray-500">No effects added</p>
        ) : (
          effects.map(renderEffectControls)
        )}
      </div>
      
      {/* Add effect dropdown */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Effect
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          onChange={(e) => handleAddEffect(e.target.value as EffectType)}
          value=""
        >
          <option value="" disabled>
            Select an effect...
          </option>
          {Object.values(EffectType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EffectsPanel; 