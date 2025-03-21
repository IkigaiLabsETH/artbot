import { DirectorAgent } from './DirectorAgent.js';
import { IdeatorAgent } from './IdeatorAgent.js';
import { StylistAgent } from './StylistAgent.js';
import { RefinerAgent } from './RefinerAgent.js';
import { CriticAgent } from './CriticAgent.js';
import { AgentRole, MultiAgentSystem } from './index.js';
import { AIService } from '../ai/index.js';

// Export all agent implementations
export {
  DirectorAgent,
  IdeatorAgent,
  StylistAgent,
  RefinerAgent,
  CriticAgent
};

// Factory function to create a complete multi-agent system
export function createMultiAgentSystem(config: { aiService?: AIService } = {}): MultiAgentSystem {
  const aiService = config.aiService || new AIService();
  const system = new MultiAgentSystem({ aiService });
  
  // Create all agent types
  const director = new DirectorAgent(aiService, system);
  const ideator = new IdeatorAgent(aiService);
  const stylist = new StylistAgent(aiService);
  const refiner = new RefinerAgent(aiService);
  const critic = new CriticAgent(aiService);
  
  // Register all agents with the system
  system.registerAgent(director);
  system.registerAgent(ideator);
  system.registerAgent(stylist);
  system.registerAgent(refiner);
  system.registerAgent(critic);
  
  return system;
}

// Function to create a project creation message
export function createProjectMessage(title: string, description: string, requirements: string[] = []) {
  return {
    id: `msg-${Date.now()}`,
    fromAgent: 'external',
    toAgent: null, // broadcast
    content: {
      action: 'create_project',
      title,
      description,
      requirements,
      id: `project-${Date.now()}`
    },
    timestamp: new Date(),
    type: 'request'
  };
} 