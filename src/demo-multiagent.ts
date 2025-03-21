import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createMultiAgentSystem, createProjectMessage } from './services/multiagent/agents.js';
import { AIService } from './services/ai/index.js';
import { AgentMessage } from './services/multiagent/index.js';

// Load environment variables from .env file
dotenv.config();

async function runDemo() {
  console.log('🚀 Starting Multi-Agent Art Creation System Demo');
  
  // Check if API keys are set
  console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('Anthropic API Key:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('Replicate API Key:', process.env.REPLICATE_API_KEY ? '✅ Set' : '❌ Not set');
  
  // Initialize AI service
  const aiService = new AIService({
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY
  });
  
  await aiService.initialize();
  
  // Create multi-agent system
  console.log('\n🤖 Creating multi-agent system...');
  const system = createMultiAgentSystem({ aiService });
  
  // Initialize the system
  console.log('🔄 Initializing agents...');
  await system.initialize();
  console.log('✅ All agents initialized successfully');
  
  // Create a new project
  const projectTitle = "Evolving Diffusion";
  const projectDescription = "An exploration of diffusion-based generative art that dynamically evolves its style, inspired by systems that gather and cluster visual elements to create distinct and evolving artistic expressions";
  const projectRequirements = [
    "Incorporate elements of diffusion-based generative techniques",
    "Suggest a visual style that appears to evolve and adapt",
    "Balance abstract and recognizable forms",
    "Create a sense of emergent complexity from simple elements"
  ];
  
  console.log(`\n🎨 Creating new project: "${projectTitle}"`);
  console.log(`Description: ${projectDescription}`);
  console.log('Requirements:');
  projectRequirements.forEach(req => console.log(`- ${req}`));
  
  // Create project message
  const projectMessage = createProjectMessage(
    projectTitle,
    projectDescription,
    projectRequirements
  ) as AgentMessage;
  
  // Start the creative process
  console.log('\n🔄 Starting creative process...');
  console.log('⏳ This may take a few moments as agents collaborate...');
  
  // Track the current stage
  let currentStage = 'planning';
  let isComplete = false;
  
  // Function to log agent states
  const logAgentStates = () => {
    const states = system.getSystemState();
    console.log('\n📊 Current Agent States:');
    Object.values(states).forEach(state => {
      console.log(`- ${state.role}: ${state.status}`);
    });
  };
  
  // Send the initial project message
  await system.sendMessage(projectMessage);
  
  // Monitor the system state until the project is complete
  while (!isComplete) {
    // Get the current system state
    const states = system.getSystemState();
    
    // Find the director agent
    const directorState = Object.values(states).find(state => state.role === 'director')?.context;
    
    if (directorState && directorState.projectStage !== currentStage) {
      // Stage has changed
      currentStage = directorState.projectStage;
      
      switch (currentStage) {
        case 'planning':
          console.log('\n🧠 Planning Stage: Generating creative ideas...');
          break;
        case 'styling':
          console.log('\n🎨 Styling Stage: Developing artistic styles...');
          // Log the ideas that were generated
          const ideationTask = directorState.completedTasks.find((task: any) => task.type === 'ideation');
          if (ideationTask) {
            console.log('\n💡 Generated Ideas:');
            ideationTask.result.forEach((idea: any, index: number) => {
              console.log(`\nIdea ${index + 1}: ${idea.title}`);
              console.log(`Description: ${idea.description}`);
              console.log(`Elements: ${idea.elements.join(', ')}`);
              console.log(`Styles: ${idea.styles.join(', ')}`);
              console.log(`Emotional Impact: ${idea.emotionalImpact}`);
            });
          }
          break;
        case 'refinement':
          console.log('\n✏️ Refinement Stage: Refining the artwork...');
          // Log the styles that were developed
          const stylingTask = directorState.completedTasks.find((task: any) => task.type === 'styling');
          if (stylingTask) {
            console.log('\n🎭 Developed Styles:');
            stylingTask.result.forEach((style: any, index: number) => {
              console.log(`\nStyle ${index + 1}: ${style.name}`);
              console.log(`Description: ${style.description}`);
              console.log(`Visual Characteristics: ${style.visualCharacteristics.join(', ')}`);
              console.log(`Color Palette: ${style.colorPalette.join(', ')}`);
              console.log(`Texture: ${style.texture}`);
              console.log(`Composition: ${style.composition}`);
            });
          }
          break;
        case 'critique':
          console.log('\n🔍 Critique Stage: Evaluating the artwork...');
          // Log the refined artwork
          const refinementTask = directorState.completedTasks.find((task: any) => task.type === 'refinement');
          if (refinementTask) {
            const artwork = refinementTask.result;
            console.log('\n🖼️ Refined Artwork:');
            console.log(`Title: ${artwork.title}`);
            console.log(`Description: ${artwork.description}`);
            
            // Display the generated image URL if available
            if (artwork.imageUrl) {
              console.log(`\n🌟 Generated Image: ${artwork.imageUrl}`);
              console.log(`\nPrompt used: "${artwork.prompt}"`);
              console.log(`Negative prompt: "${artwork.negativePrompt}"`);
            } else {
              console.log('\n⚠️ No image was generated');
            }
            
            console.log(`Visual Elements: ${artwork.visualElements.join(', ')}`);
            console.log('\nComposition:');
            console.log(`- Structure: ${artwork.composition.structure}`);
            console.log(`- Focal Points: ${artwork.composition.focalPoints.join(', ')}`);
            console.log(`- Flow: ${artwork.composition.flow}`);
            console.log(`- Balance: ${artwork.composition.balance}`);
            console.log('\nColor Usage:');
            console.log(`- Palette: ${artwork.colorUsage.palette.join(', ')}`);
            console.log(`- Dominant: ${artwork.colorUsage.dominant}`);
            console.log(`- Accents: ${artwork.colorUsage.accents.join(', ')}`);
            console.log(`- Transitions: ${artwork.colorUsage.transitions}`);
            console.log('\nTexture:');
            console.log(`- Type: ${artwork.texture.type}`);
            console.log(`- Details: ${artwork.texture.details}`);
            console.log(`- Materials: ${artwork.texture.materials}`);
            console.log('\nEmotional Impact:');
            console.log(`- Primary: ${artwork.emotionalImpact.primary}`);
            console.log(`- Secondary: ${artwork.emotionalImpact.secondary}`);
            console.log(`- Notes: ${artwork.emotionalImpact.notes}`);
          }
          break;
        case 'completed':
          console.log('\n✅ Project Completed!');
          // Log the critique
          const critiqueTask = directorState.completedTasks.find((task: any) => task.type === 'critique');
          if (critiqueTask) {
            const critique = critiqueTask.result;
            console.log('\n📝 Artwork Critique:');
            console.log('\nStrengths:');
            critique.strengths.forEach((strength: string) => console.log(`- ${strength}`));
            console.log('\nAreas for Improvement:');
            critique.areasForImprovement.forEach((area: string) => console.log(`- ${area}`));
            console.log('\nScores:');
            Object.entries(critique.scores).forEach(([criterion, score]: [string, any]) => {
              console.log(`- ${criterion}: ${score}/10`);
            });
            console.log(`\nOverall Score: ${critique.overallScore}/10`);
            console.log('\nRecommendations:');
            critique.recommendations.forEach((rec: string) => console.log(`- ${rec}`));
            console.log(`\nAnalysis Notes: ${critique.analysisNotes}`);
          }
          
          // Collect all results
          const results = directorState.currentProject;
          console.log('\n📊 Final Project Results:');
          console.log(`Title: ${results.title}`);
          console.log(`Description: ${results.description}`);
          console.log(`Status: ${results.status}`);
          console.log(`Created: ${results.createdAt}`);
          
          // Display the final image URL again for convenience
          const finalArtwork = directorState.completedTasks.find((task: any) => task.type === 'refinement')?.result;
          if (finalArtwork && finalArtwork.imageUrl) {
            console.log(`\n🖼️ Final Artwork Image: ${finalArtwork.imageUrl}`);
            console.log('\nTo view the image, copy and paste the URL into your browser.');
          }
          
          isComplete = true;
          break;
      }
    }
    
    // Wait a bit before checking again
    if (!isComplete) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n🎉 Multi-Agent Art Creation Demo Completed!');
  console.log('The agents successfully collaborated to create artwork through specialized roles:');
  console.log('1. Director: Coordinated the creative process');
  console.log('2. Ideator: Generated creative ideas');
  console.log('3. Stylist: Developed artistic styles');
  console.log('4. Refiner: Refined and improved the artwork');
  console.log('5. Critic: Evaluated and provided feedback');
}

// Run the demo
runDemo().catch(error => {
  console.error('❌ Error running demo:', error);
}); 