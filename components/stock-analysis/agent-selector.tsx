'use client';

import { useState } from 'react';
import { Check, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AgentPersona, AgentId } from '@/lib/types/agents';
import { getAllAgents } from '@/lib/agents/investment-agents';

interface AgentSelectorProps {
  onSelectionChange: (selectedIds: AgentId[]) => void;
  disabled?: boolean;
}

export default function AgentSelector({ onSelectionChange, disabled }: AgentSelectorProps) {
  const agents = getAllAgents();
  const [selectedAgents, setSelectedAgents] = useState<Set<AgentId>>(new Set());

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

  const selectAll = () => {
    const allIds = agents.map(a => a.id);
    setSelectedAgents(new Set(allIds));
    onSelectionChange(allIds);
  };

  const clearAll = () => {
    setSelectedAgents(new Set());
    onSelectionChange([]);
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
    switch (horizon) {
      case 'short': return 'Short-term';
      case 'medium': return 'Medium-term';
      case 'long': return 'Long-term';
      case 'very-long': return 'Very Long-term';
      default: return horizon;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Select Investment Analysts</h3>
          <p className="text-sm text-muted-foreground">
            Choose one or more legendary investors to analyze your selected stock
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={disabled || selectedAgents.size === agents.length}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={disabled || selectedAgents.size === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedAgents.has(agent.id) && "ring-2 ring-primary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !disabled && toggleAgent(agent.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {agent.investmentStyle}
                  </CardDescription>
                </div>
                <Checkbox
                  checked={selectedAgents.has(agent.id)}
                  disabled={disabled}
                  onClick={(e) => e.stopPropagation()}
                  onCheckedChange={() => toggleAgent(agent.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {agent.philosophy}
              </p>
              
              <div className="flex flex-wrap gap-1">
                <Badge variant={getRiskBadgeVariant(agent.riskProfile)} className="text-xs">
                  {agent.riskProfile}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getTimeHorizonLabel(agent.timeHorizon)}
                </Badge>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1">Focus Areas:</p>
                <div className="flex flex-wrap gap-1">
                  {agent.focusAreas.slice(0, 3).map((area, idx) => (
                    <span key={idx} className="text-xs text-muted-foreground">
                      • {area}
                    </span>
                  ))}
                  {agent.focusAreas.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{agent.focusAreas.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedAgents.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">
            {selectedAgents.size} analyst{selectedAgents.size !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}
    </div>
  );
}