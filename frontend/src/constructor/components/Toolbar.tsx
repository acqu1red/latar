import React from 'react';
import { Tool } from '../types';

interface ToolbarProps {
  activeTool: Tool;
  onSelectTool: (tool: Tool) => void;
  onAddRoom: () => void;
  onSaveLayout: () => void;
  onGeneratePlan: () => void;
  onResetPlan: () => void;
  isGenerating: boolean;
  hasPlan: boolean;
}

const TOOL_LABELS: Array<{ tool: Tool; label: string; emoji: string }> = [
  { tool: 'select', label: 'Выбор', emoji: '🖱️' },
  { tool: 'room', label: 'Комната', emoji: '➕' },
  { tool: 'wall', label: 'Стены', emoji: '✏️' },
  { tool: 'window', label: 'Окно', emoji: '🪟' },
  { tool: 'door', label: 'Дверь', emoji: '🚪' },
  { tool: 'pan', label: 'Перемещение', emoji: '✋' },
];

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onSelectTool,
  onAddRoom,
  onSaveLayout,
  onGeneratePlan,
  onResetPlan,
  isGenerating,
  hasPlan,
}) => {
  return (
    <header className="constructor-toolbar">
      <div className="toolbar-group">
        {TOOL_LABELS.map(({ tool, label, emoji }) => (
          <button
            key={tool}
            type="button"
            className={`toolbar-button ${activeTool === tool ? 'active' : ''}`}
            onClick={() => {
              if (tool === 'room') {
                onSelectTool(tool);
                onAddRoom();
                return;
              }
              onSelectTool(tool);
            }}
          >
            <span className="toolbar-icon">{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="toolbar-actions">
        <button type="button" className="toolbar-button ghost" onClick={onSaveLayout}>
          💾 Сохранить макет
        </button>
        {hasPlan ? (
          <button type="button" className="toolbar-button ghost" onClick={onResetPlan}>
            ♻️ Новый план
          </button>
        ) : (
          <button
            type="button"
            className="toolbar-button primary"
            onClick={onGeneratePlan}
            disabled={isGenerating}
          >
            {isGenerating ? '🧠 Генерация...' : '🧠 Сгенерировать план'}
          </button>
        )}
      </div>
    </header>
  );
};

export default Toolbar;
