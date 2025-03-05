import { BaseAgent, AgentRole, AgentMessage } from './index.js';
import { AIService, AIMessage } from '../ai/index.js';

/**
 * Ideation approach types for specialized idea generation
 */
export enum IdeationApproach {
  CONCEPTUAL = 'conceptual',   // Focus on abstract concepts and themes
  NARRATIVE = 'narrative',     // Focus on storytelling and narrative elements
  VISUAL = 'visual',           // Focus on visual composition and elements
  EMOTIONAL = 'emotional',     // Focus on emotional impact and resonance
  TECHNICAL = 'technical',     // Focus on technical execution and methods
  CULTURAL = 'cultural',       // Focus on cultural references and context
  EXPERIMENTAL = 'experimental' // Focus on experimental and innovative approaches
}

// Ideator agent is responsible for generating creative ideas
export class IdeatorAgent extends BaseAgent {
  constructor(aiService: AIService) {
    super(AgentRole.IDEATOR, aiService);
    this.state.context = {
      currentTask: null,
      generatedIdeas: [],
      ideationParameters: {
        explorationRate: 0.7,
        diversityWeight: 0.8,
        noveltyThreshold: 0.6
      },
      preferredApproaches: [
        IdeationApproach.CONCEPTUAL,
        IdeationApproach.VISUAL
      ],
      approachWeights: {
        [IdeationApproach.CONCEPTUAL]: 0.8,
        [IdeationApproach.NARRATIVE]: 0.6,
        [IdeationApproach.VISUAL]: 0.9,
        [IdeationApproach.EMOTIONAL]: 0.7,
        [IdeationApproach.TECHNICAL]: 0.5,
        [IdeationApproach.CULTURAL]: 0.6,
        [IdeationApproach.EXPERIMENTAL]: 0.4
      }
    };
  }

  async initialize(): Promise<void> {
    await super.initialize();
    // Ideator-specific initialization
  }

  async process(message: AgentMessage): Promise<AgentMessage | null> {
    // Add message to memory
    this.addToMemory(message);
    
    // Update state based on message
    this.state.status = 'working';
    
    try {
      switch (message.type) {
        case 'request':
          return await this.handleRequest(message);
        case 'response':
          return await this.handleResponse(message);
        case 'update':
          return await this.handleUpdate(message);
        case 'feedback':
          return await this.handleFeedback(message);
        default:
          return null;
      }
    } finally {
      this.state.status = 'idle';
    }
  }
  
  private async handleRequest(message: AgentMessage): Promise<AgentMessage | null> {
    const { content } = message;
    
    // Handle task assignment
    if (content.action === 'assign_task' && content.targetRole === AgentRole.IDEATOR) {
      const task = content.task;
      
      // Store the task
      this.state.context.currentTask = task;
      
      // Determine the best ideation approach based on the project
      const approach = this.determineIdeationApproach(content.project);
      
      // Generate ideas based on the task and selected approach
      const ideas = await this.generateIdeasWithApproach(task, content.project, approach);
      
      // Store generated ideas
      this.state.context.generatedIdeas = ideas;
      
      // Complete the task
      return this.createMessage(
        message.fromAgent,
        {
          action: 'task_completed',
          taskId: task.id,
          result: ideas,
          approach: approach
        },
        'response'
      );
    }
    
    return null;
  }
  
  private async handleResponse(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle responses to our requests
    return null;
  }
  
  private async handleUpdate(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle updates from other agents
    return null;
  }
  
  private async handleFeedback(message: AgentMessage): Promise<AgentMessage | null> {
    // Handle feedback on our ideas
    const { content } = message;
    
    if (content.action === 'provide_feedback' && content.targetRole === AgentRole.IDEATOR) {
      // Update approach weights based on feedback
      if (content.approach && content.rating) {
        const approach = content.approach as IdeationApproach;
        const rating = content.rating as number; // 1-10
        
        // Adjust the weight for this approach based on feedback
        const currentWeight = this.state.context.approachWeights[approach] || 0.5;
        const learningRate = 0.1;
        const normalizedRating = rating / 10; // Convert to 0-1 scale
        
        // Update weight using a simple learning rule
        this.state.context.approachWeights[approach] = 
          currentWeight * (1 - learningRate) + normalizedRating * learningRate;
        
        // Update preferred approaches based on new weights
        this.updatePreferredApproaches();
        
        return this.createMessage(
          message.fromAgent,
          {
            action: 'feedback_acknowledged',
            approach: approach,
            newWeight: this.state.context.approachWeights[approach]
          },
          'response'
        );
      }
    }
    
    return null;
  }
  
  /**
   * Update the list of preferred approaches based on current weights
   */
  private updatePreferredApproaches(): void {
    // Sort approaches by weight and take the top 3
    const sortedApproaches = Object.entries(this.state.context.approachWeights)
      .sort(([, weightA], [, weightB]) => (weightB as number) - (weightA as number))
      .map(([approach]) => approach as IdeationApproach);
    
    this.state.context.preferredApproaches = sortedApproaches.slice(0, 3);
  }
  
  /**
   * Determine the best ideation approach for a given project
   */
  private determineIdeationApproach(project: any): IdeationApproach {
    // Simple keyword-based approach determination
    const keywords = {
      [IdeationApproach.CONCEPTUAL]: ['concept', 'abstract', 'idea', 'philosophy', 'meaning'],
      [IdeationApproach.NARRATIVE]: ['story', 'narrative', 'character', 'plot', 'sequence'],
      [IdeationApproach.VISUAL]: ['visual', 'composition', 'color', 'form', 'texture'],
      [IdeationApproach.EMOTIONAL]: ['emotion', 'feeling', 'mood', 'atmosphere', 'expression'],
      [IdeationApproach.TECHNICAL]: ['technique', 'method', 'process', 'execution', 'craft'],
      [IdeationApproach.CULTURAL]: ['culture', 'reference', 'history', 'society', 'tradition'],
      [IdeationApproach.EXPERIMENTAL]: ['experiment', 'innovative', 'novel', 'unique', 'unconventional']
    };
    
    // Combine project title and description for analysis
    const projectText = `${project.title} ${project.description} ${project.requirements.join(' ')}`.toLowerCase();
    
    // Score each approach based on keyword matches and weights
    const scores = Object.entries(keywords).map(([approach, words]) => {
      const matchCount = words.filter(word => projectText.includes(word)).length;
      const weight = this.state.context.approachWeights[approach as IdeationApproach] || 0.5;
      return { approach: approach as IdeationApproach, score: matchCount * weight };
    });
    
    // Return the approach with the highest score
    const bestApproach = scores.sort((a, b) => b.score - a.score)[0].approach;
    return bestApproach;
  }
  
  /**
   * Generate ideas using a specific ideation approach
   */
  private async generateIdeasWithApproach(
    task: any, 
    project: any, 
    approach: IdeationApproach
  ): Promise<any[]> {
    // Select the appropriate specialized method based on the approach
    switch (approach) {
      case IdeationApproach.CONCEPTUAL:
        return this.generateConceptualIdeas(task, project);
      case IdeationApproach.NARRATIVE:
        return this.generateNarrativeIdeas(task, project);
      case IdeationApproach.VISUAL:
        return this.generateVisualIdeas(task, project);
      case IdeationApproach.EMOTIONAL:
        return this.generateEmotionalIdeas(task, project);
      case IdeationApproach.TECHNICAL:
        return this.generateTechnicalIdeas(task, project);
      case IdeationApproach.CULTURAL:
        return this.generateCulturalIdeas(task, project);
      case IdeationApproach.EXPERIMENTAL:
        return this.generateExperimentalIdeas(task, project);
      default:
        // Fallback to general idea generation
        return this.generateIdeas(task, project);
    }
  }
  
  /**
   * Generate conceptual ideas focused on abstract concepts and themes
   */
  private async generateConceptualIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in CONCEPTUAL ideation. Focus on abstract concepts, philosophical themes, and meaningful ideas. Generate ideas that challenge perception and provoke thought.`
      },
      {
        role: 'user',
        content: `Generate 5 conceptually-driven art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title that encapsulates the concept
        2. A philosophical or abstract theme
        3. Key conceptual elements
        4. Visual metaphors to represent the concept
        5. Intellectual or philosophical impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      // In a real implementation, parse the JSON response
      // For now, return mock conceptual ideas
      return [
        {
          title: "Temporal Paradox",
          description: "An exploration of time's non-linear nature",
          elements: ["clocks flowing like liquid", "intersecting timelines", "recursive patterns"],
          styles: ["surrealism", "conceptual art", "philosophical"],
          emotionalImpact: "contemplation of existence and time",
          conceptualTheme: "The illusion of linear time",
          visualMetaphors: ["melting clocks", "recursive spirals", "mirrored reflections"]
        },
        {
          title: "Dualism Dissolved",
          description: "Challenging binary thinking through visual ambiguity",
          elements: ["merging opposites", "gradient transitions", "ambiguous forms"],
          styles: ["abstract", "minimalist", "philosophical"],
          emotionalImpact: "questioning of categorical thinking",
          conceptualTheme: "Beyond binary opposition",
          visualMetaphors: ["yin-yang variations", "gradient boundaries", "metamorphic forms"]
        },
        // Additional mock ideas would be included here
      ];
    } catch (error) {
      console.error('Error generating conceptual ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  /**
   * Generate narrative ideas focused on storytelling elements
   */
  private async generateNarrativeIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in NARRATIVE ideation. Focus on storytelling, character development, and sequential art. Generate ideas that convey stories or narratives through visual means.`
      },
      {
        role: 'user',
        content: `Generate 5 narrative-driven art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title that suggests a story
        2. A narrative synopsis
        3. Key characters or elements
        4. Narrative arc or sequence
        5. Emotional journey
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });
      
      // Mock narrative ideas
      return [
        {
          title: "The Silent Witness",
          description: "A visual story told through the perspective of an inanimate object",
          elements: ["recurring object in different scenes", "changing environments", "human interactions"],
          styles: ["sequential art", "cinematic", "narrative"],
          emotionalImpact: "empathy and perspective shift",
          narrativeSynopsis: "An ordinary object witnesses extraordinary human moments over time",
          characters: ["the object (protagonist)", "various humans", "environments as characters"],
          narrativeArc: "Introduction of object → Witnessing joy → Witnessing sorrow → Witnessing transformation → Resolution"
        },
        {
          title: "Parallel Lives",
          description: "Two intertwined stories told simultaneously through split compositions",
          elements: ["split canvas", "mirrored actions", "converging storylines"],
          styles: ["narrative art", "diptych", "comparative"],
          emotionalImpact: "connection and separation",
          narrativeSynopsis: "Two seemingly separate lives that gradually reveal their interconnection",
          characters: ["protagonist A", "protagonist B", "connecting elements"],
          narrativeArc: "Separate beginnings → Parallel challenges → Subtle connections → Convergence → Shared resolution"
        },
        // Additional mock ideas would be included here
      ];
    } catch (error) {
      console.error('Error generating narrative ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  /**
   * Generate visual ideas focused on composition and visual elements
   */
  private async generateVisualIdeas(task: any, project: any): Promise<any[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent specializing in VISUAL ideation. Focus on visual composition, color theory, form, texture, and visual impact. Generate ideas that prioritize visual aesthetics and composition.`
      },
      {
        role: 'user',
        content: `Generate 5 visually-driven art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title that evokes visual imagery
        2. A description of the visual composition
        3. Key visual elements and their arrangement
        4. Color palette and texture approach
        5. Visual impact and focal points
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.7
      });
      
      // Mock visual ideas
      return [
        {
          title: "Chromatic Cascade",
          description: "A dynamic composition of flowing color gradients creating depth and movement",
          elements: ["fluid color transitions", "overlapping transparent layers", "dynamic directional flow"],
          styles: ["color field", "abstract", "fluid"],
          emotionalImpact: "sensory immersion and movement",
          visualComposition: "Diagonal flow from upper left to lower right with cascading color elements",
          colorPalette: "Analogous blues and purples transitioning to complementary oranges and yellows",
          focalPoints: "Central convergence of color streams with high contrast edge details"
        },
        {
          title: "Textural Dialogue",
          description: "Contrasting textures creating visual tension and harmony",
          elements: ["rough organic textures", "smooth geometric forms", "tactile surface variations"],
          styles: ["textural", "mixed media", "contrast-focused"],
          emotionalImpact: "tactile curiosity and sensory engagement",
          visualComposition: "Grid-breaking arrangement with textural elements creating visual rhythm",
          colorPalette: "Monochromatic with textural variations providing visual interest",
          focalPoints: "Areas of extreme textural contrast and unexpected pattern interruptions"
        },
        // Additional mock ideas would be included here
      ];
    } catch (error) {
      console.error('Error generating visual ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  /**
   * Generate emotional ideas focused on emotional impact and resonance
   */
  private async generateEmotionalIdeas(task: any, project: any): Promise<any[]> {
    // Implementation similar to other specialized methods
    // Mock emotional ideas for now
    return [
      {
        title: "Ephemeral Joy",
        description: "Capturing the fleeting nature of happiness through light and color",
        elements: ["light particles", "ephemeral moments", "joyful expressions"],
        styles: ["impressionist", "emotive", "light-focused"],
        emotionalImpact: "uplifting yet bittersweet awareness of impermanence",
        emotionalTheme: "The transient nature of joy",
        emotionalExpression: "Bright, airy compositions with elements that appear to be dissolving"
      },
      {
        title: "Depths of Solitude",
        description: "Exploring the complex emotional landscape of being alone",
        elements: ["single figure or object", "vast negative space", "subtle environmental details"],
        styles: ["minimalist", "atmospheric", "contemplative"],
        emotionalImpact: "resonance with personal moments of solitude",
        emotionalTheme: "The duality of solitude as both isolating and liberating",
        emotionalExpression: "Deep shadows with selective illumination, creating both comfort and tension"
      }
    ];
  }
  
  /**
   * Generate technical ideas focused on execution and methods
   */
  private async generateTechnicalIdeas(task: any, project: any): Promise<any[]> {
    // Implementation for technical ideas
    // Mock technical ideas for now
    return [
      {
        title: "Algorithmic Emergence",
        description: "Using generative algorithms to create emergent patterns",
        elements: ["code-generated patterns", "rule-based structures", "emergent complexity"],
        styles: ["generative art", "algorithmic", "digital"],
        emotionalImpact: "wonder at complexity from simplicity",
        technicalApproach: "Custom algorithm using cellular automata rules",
        executionMethod: "Digital generation with physical translation through precision printing"
      },
      {
        title: "Material Transformation",
        description: "Exploring the transformation of materials through chemical processes",
        elements: ["chemical reactions", "material state changes", "process documentation"],
        styles: ["process art", "material-focused", "scientific"],
        emotionalImpact: "fascination with transformation and impermanence",
        technicalApproach: "Controlled chemical reactions on various substrates",
        executionMethod: "Multi-stage process with photographic documentation of each phase"
      }
    ];
  }
  
  /**
   * Generate cultural ideas focused on cultural references and context
   */
  private async generateCulturalIdeas(task: any, project: any): Promise<any[]> {
    // Implementation for cultural ideas
    // Mock cultural ideas for now
    return [
      {
        title: "Ritual Reimagined",
        description: "Contemporary interpretation of traditional cultural rituals",
        elements: ["ritual objects", "symbolic actions", "cultural symbols"],
        styles: ["contemporary", "cultural fusion", "symbolic"],
        emotionalImpact: "connection to cultural heritage and identity",
        culturalContext: "Fusion of Eastern ceremonial traditions with Western contemporary practices",
        culturalReferences: ["tea ceremonies", "meditation practices", "communal gatherings"]
      },
      {
        title: "Digital Folklore",
        description: "Traditional folklore narratives translated into digital language",
        elements: ["folkloric characters", "digital aesthetics", "symbolic storytelling"],
        styles: ["digital art", "folk art fusion", "narrative"],
        emotionalImpact: "bridging traditional and contemporary cultural expressions",
        culturalContext: "The evolution of storytelling from oral tradition to digital media",
        culturalReferences: ["regional folk tales", "internet culture", "digital communication symbols"]
      }
    ];
  }
  
  /**
   * Generate experimental ideas focused on innovation and unconventional approaches
   */
  private async generateExperimentalIdeas(task: any, project: any): Promise<any[]> {
    // Implementation for experimental ideas
    // Mock experimental ideas for now
    return [
      {
        title: "Sensory Synesthesia",
        description: "Art that deliberately crosses sensory boundaries",
        elements: ["sound visualization", "tactile color", "scent-triggered projections"],
        styles: ["multi-sensory", "interactive", "experimental"],
        emotionalImpact: "sensory confusion and discovery",
        experimentalApproach: "Using biofeedback sensors to translate viewer's physiological responses into visual elements",
        innovativeElements: ["real-time biometric data visualization", "responsive environment", "participant co-creation"]
      },
      {
        title: "Quantum Visualization",
        description: "Visualizing quantum phenomena through art",
        elements: ["probability clouds", "superposition states", "quantum entanglement"],
        styles: ["scientific art", "conceptual", "physics-based"],
        emotionalImpact: "awe at the nature of reality",
        experimentalApproach: "Using quantum random number generators to determine compositional elements",
        innovativeElements: ["true randomness", "physics-based creation", "indeterminacy as medium"]
      }
    ];
  }
  
  /**
   * Original general idea generation method
   */
  private async generateIdeas(task: any, project: any): Promise<any[]> {
    // Use AI service to generate creative ideas
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are the Ideator agent in a multi-agent art creation system. Your role is to generate creative, diverse, and novel ideas based on project requirements. 
        Exploration rate: ${this.state.context.ideationParameters.explorationRate}
        Diversity weight: ${this.state.context.ideationParameters.diversityWeight}
        Novelty threshold: ${this.state.context.ideationParameters.noveltyThreshold}`
      },
      {
        role: 'user',
        content: `Generate 5 creative art ideas for the following project:
        
        Title: ${project.title}
        Description: ${project.description}
        Requirements: ${project.requirements.join(', ')}
        
        For each idea, provide:
        1. A title
        2. A brief description
        3. Key visual elements
        4. Potential styles
        5. Emotional impact
        
        Format each idea as a JSON object.`
      }
    ];
    
    try {
      const response = await this.aiService.getCompletion({
        messages,
        temperature: 0.8
      });
      
      // Parse the response to extract ideas
      // In a real implementation, we would parse the JSON response
      // For now, we'll return mock ideas
      
      return [
        {
          title: "Cosmic Harmony",
          description: "An abstract representation of universal balance",
          elements: ["celestial bodies", "geometric patterns", "flowing lines"],
          styles: ["abstract", "minimalist", "cosmic"],
          emotionalImpact: "wonder and contemplation"
        },
        {
          title: "Digital Dreamscape",
          description: "A surreal landscape merging natural and digital elements",
          elements: ["fractals", "organic shapes", "digital artifacts"],
          styles: ["surrealism", "digital art", "psychedelic"],
          emotionalImpact: "curiosity and disorientation"
        },
        {
          title: "Ephemeral Echoes",
          description: "Capturing fleeting moments through layered transparency",
          elements: ["transparent layers", "time indicators", "fading forms"],
          styles: ["impressionist", "contemporary", "ethereal"],
          emotionalImpact: "nostalgia and transience"
        },
        {
          title: "Structured Chaos",
          description: "Finding order within apparent randomness",
          elements: ["chaotic patterns", "underlying grid", "emergent forms"],
          styles: ["generative art", "mathematical", "complex"],
          emotionalImpact: "fascination and discovery"
        },
        {
          title: "Emotional Spectrum",
          description: "Visualizing the range of human emotions through color and form",
          elements: ["color gradients", "expressive shapes", "human silhouettes"],
          styles: ["expressionist", "color field", "emotional"],
          emotionalImpact: "empathy and introspection"
        }
      ];
    } catch (error) {
      console.error('Error generating ideas:', error);
      return this.generateFallbackIdeas();
    }
  }
  
  /**
   * Generate fallback ideas in case of errors
   */
  private generateFallbackIdeas(): any[] {
    return [
      {
        title: "Fallback Idea",
        description: "A simple concept using basic elements",
        elements: ["simple shapes", "primary colors"],
        styles: ["minimalist"],
        emotionalImpact: "calm"
      }
    ];
  }
} 