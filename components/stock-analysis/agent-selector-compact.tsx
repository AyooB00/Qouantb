'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AgentPersona, AgentId } from '@/lib/types/agents';
import { getAllAgents } from '@/lib/agents/investment-agents';

interface AgentSelectorCompactProps {
  onSelectionChange: (selectedIds: AgentId[]) => void;
  disabled?: boolean;
}

export default function AgentSelectorCompact({ onSelectionChange, disabled }: AgentSelectorCompactProps) {
  const agents = getAllAgents();
  const [selectedAgents, setSelectedAgents] = useState<Set<AgentId>>(new Set());
  const t = useTranslations('stockAnalysis.agents');
  const tCommon = useTranslations('common');

  const toggleAgent = (agentId: AgentId) => {
    const newSelection = new Set(selectedAgents);
    if (newSelection.has(agentId)) {
      newSelection.delete(agentId);
    } else {
      newSelection.add(agentId);
    }
    setSelectedAgents(newSelection);
    onSelectionChange(Array.from(newSelection));
  };


  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'secondary';
      case 'moderate': return 'default';
      case 'aggressive': return 'destructive';
      default: return 'default';
    }
  };

  const getTimeHorizonLabel = (horizon: string) => {
    return t(`timeHorizons.${horizon}`);
  };
  
  const getRiskProfileLabel = (risk: string) => {
    return t(`riskProfiles.${risk}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">

      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={cn(
              "relative p-4 rounded-xl border-2 cursor-pointer transition-all group",
              "hover:shadow-lg hover:scale-[1.02]",
              selectedAgents.has(agent.id) 
                ? "border-primary bg-primary/5 shadow-md" 
                : "border-border hover:border-primary/30",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
            onClick={() => !disabled && toggleAgent(agent.id)}
          >
            <div className="space-y-3">
              {/* Header with name and checkmark */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-base">{t(`${agent.id}.name`)}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t(`${agent.id}.style`)}
                  </p>
                </div>
                {selectedAgents.has(agent.id) && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                    <svg
                      className="h-3.5 w-3.5 text-primary-foreground"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Philosophy preview */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {t(`${agent.id}.philosophy`)}
              </p>
              
              {/* Badges */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <Badge 
                  variant={getRiskBadgeVariant(agent.riskProfile)} 
                  className="text-xs px-2 py-0.5"
                >
                  {getRiskProfileLabel(agent.riskProfile)}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-xs px-2 py-0.5"
                >
                  {getTimeHorizonLabel(agent.timeHorizon)}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAgents.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            {t('selectedCount', { count: selectedAgents.size })}
          </span>
        </div>
      )}
    </div>
  );
}