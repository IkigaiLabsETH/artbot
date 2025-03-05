import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ArtBotMultiAgentSystem } from './artbot-multiagent-system.js';
import { ReplicateService } from './services/replicate/index.js';
import { AIService } from './services/ai/index.js';
import { MemorySystem, MemoryType } from './services/memory/index.js';
import { StyleService } from './services/style/index.js';
import { MultiAgentSystem } from './services/multiagent/index.js';
import { generateCinematicConcept, generateMultipleConcepts, ConceptCategory } from './services/ai/conceptGenerator.js';

// Load environment variables
dotenv.config();

// Art Direction Configuration
// This allows us to provide specific artistic direction to the multi-agent system
interface ArtDirection {
  styleEmphasis?: string[];       // Specific styles to emphasize
  visualElements?: string[];      // Required visual elements
  colorPalette?: string[];        // Specific color palette to use
  compositionGuidelines?: string[]; // Guidelines for composition
  moodAndTone?: string;           // Overall mood and tone
  references?: string[];          // Reference artists or works
  avoidElements?: string[];       // Elements to avoid
}

// Default art direction that can be overridden by environment variables or parameters
const defaultArtDirection: ArtDirection = {
  styleEmphasis: [
    "Magritte surrealism",
    "oil painting technique",
    "visible brushstrokes",
    "canvas texture",
    "painterly quality",
    "traditional painting style",
    "fine art",
    "non-photorealistic",
    "high contrast",
    "atmospheric",
    "surreal juxtaposition",
    "dreamlike illusion",
    "mysterious sense of depth",
    "enigmatic silhouettes",
    "unexpected negative space",
    "symbolic imagery",
    "contrasting shadow play",
    "theatrical lighting",
    "layered or 'painting-within-a-painting' composition",
    "metaphorical objects",
    "subtle humor",
    "ephemeral illusions",
    "floating or suspended objects",
    "whimsical shape interplay",
    "contradictory perspectives",
    "hidden or partially veiled faces",
    "juxtaposed architectural elements",
    "fragmented or repeated forms",
    "clean, crisp outlines",
    "quiet, still atmosphere",
    "meticulous attention to detail"
  ],
  visualElements: [
    "bowler hats",
    "floating objects",
    "clouds",
    "blue skies",
    "reflective surfaces",
    "impossible scenes",
    "ordinary objects in extraordinary contexts",
    "visual paradoxes",
    "windows and frames",
    "silhouettes",
    "green apples (often oversized or placed in unexpected locations)",
    "men in suits (the 'anonymous everyman' figure)",
    "veiled or obscured faces",
    "unexpected scale changes",
    "train engines emerging from unusual places",
    "overlapping realities (layers within layers)",
    "theatrical backdrops (stage-like settings)",
    "contradictory shadows or silhouettes",
    "oversized everyday objects",
    "day-to-night contrasts",
    "the single eye (filled with sky or clouds)",
    "curtains framing scenes",
    "mismatched reflections",
    "disjointed landscapes",
    "blend of interior and exterior spaces",
    "human figures with altered proportions"
  ],
  colorPalette: [
    "Magritte blues",
    "soft greens",
    "earthy browns",
    "rich blues",
    "deep reds",
    "golden highlights",
    "shadow detail",
    "selective saturation",
    "oil paint color mixing",
    "limited palette typical of Magritte's work",
    "twilight blues from 'The Empire of Light'",
    "clear sky blues",
    "muted greens of foliage",
    "warm wood tones",
    "cool grays for clouds",
    "stark black silhouettes",
    "pale flesh tones",
    "crisp whites for collars and clouds",
    "subtle shadow gradients",
    "atmospheric perspective blues"
  ],
  compositionGuidelines: [
    "rule of thirds",
    "leading lines",
    "depth of field",
    "framing elements",
    "balanced asymmetry",
    "surreal scale relationships",
    "clean compositions with clear subjects",
    "canvas-like proportions",
    "traditional painting composition",
    "centered single subject focus",
    "theatrical staging of elements",
    "window-like framing devices",
    "horizon line placement for psychological effect",
    "juxtaposition of disparate scales",
    "symmetrical balance with surreal disruption",
    "negative space as positive element",
    "precise geometric arrangement",
    "layered reality planes",
    "visual paradox construction",
    "deliberate flatness in certain elements"
  ],
  moodAndTone: "dreamlike and contemplative with a sense of mystery and philosophical questioning, rendered with the texture and quality of oil paint on canvas. The atmosphere should evoke a quiet unease through impossible juxtapositions that feel strangely familiar yet profoundly alien. There should be an intellectual playfulness beneath the serious execution, inviting viewers to question their perception of reality. The emotional tone balances between melancholy, wonder, and subtle humor, with a distinctly Belgian surrealist sensibility that differs from the more psychological or chaotic approaches of other surrealists.",
  references: [
    "René Magritte's 'The Son of Man'",
    "René Magritte's 'The Empire of Light'",
    "René Magritte's 'The Treachery of Images'",
    "René Magritte's 'Golconda'",
    "René Magritte's 'Time Transfixed (La Durée Poignardée)'",
    "René Magritte's 'The Lovers (Les Amants)'",
    "René Magritte's 'Not to Be Reproduced (La Reproduction Interdite)'",
    "René Magritte's 'The Human Condition (La Condition Humaine)'",
    "René Magritte's 'The False Mirror (Le Faux Miroir)'",
    "René Magritte's 'Le Blanc Seing (The Blank Check)'",
    "René Magritte's 'The Listening Room (La Chambre d'Écoute)'",
    "René Magritte's 'La Clairvoyance'",
    "René Magritte's 'The Lost Jockey (Le Jockey Perdu)'",
    "René Magritte's 'Decalcomania'",
    "René Magritte's oil painting techniques",
    "Traditional Belgian surrealist painting style"
  ],
  avoidElements: [
    "text",
    "watermarks",
    "distorted faces",
    "overly saturated colors",
    "digital artifacts",
    "abstract expressionism",
    "chaotic compositions",
    "photorealistic rendering",
    "digital art aesthetics",
    "3D rendering look",
    "photography-like lighting"
  ]
};

// Function to load art direction from a JSON file if it exists
function loadArtDirectionFromFile(filePath: string): ArtDirection | null {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as ArtDirection;
    }
  } catch (error) {
    console.warn(`Warning: Could not load art direction from ${filePath}:`, error);
  }
  return null;
}

// Function to load category-specific art direction
function loadCategoryArtDirection(category?: string): ArtDirection | null {
  if (!category) return null;
  
  // Convert category to filename format (e.g., 'magritte_lovers')
  const categoryFileName = `magritte_${category.toLowerCase().replace(/\s+/g, '_')}.json`;
  const categoryFilePath = path.join(process.cwd(), categoryFileName);
  
  const categoryArtDirection = loadArtDirectionFromFile(categoryFilePath);
  if (categoryArtDirection) {
    console.log(`Loaded category-specific art direction from ${categoryFileName}`);
    return categoryArtDirection;
  }
  
  return null;
}

// Check for art direction file in the current directory
const artDirectionFilePath = path.join(process.cwd(), 'art-direction.json');
const fileArtDirection = loadArtDirectionFromFile(artDirectionFilePath);

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get concept from command line arguments
const concept = process.argv[2];
// Get category from command line arguments (if provided)
const categoryArg = process.argv[3];

// Detect concept category based on content if not explicitly provided
function detectConceptCategory(concept: string): string | undefined {
  if (!concept) return undefined;
  
  const conceptLower = concept.toLowerCase();
  
  // Category detection patterns
  const categoryPatterns = [
    { category: 'lovers', keywords: ['lover', 'veil', 'covered face', 'hidden identity', 'intimacy', 'couple'] },
    { category: 'empire_of_light', keywords: ['day and night', 'empire of light', 'night sky', 'daytime', 'street lamp'] },
    { category: 'objects', keywords: ['apple', 'pipe', 'bowler hat', 'everyday object', 'still life'] },
    { category: 'windows', keywords: ['window', 'frame', 'view', 'looking through', 'glass'] },
    { category: 'silhouettes', keywords: ['silhouette', 'shadow', 'outline', 'dark figure'] },
    { category: 'metamorphosis', keywords: ['transform', 'change', 'metamorphosis', 'becoming', 'evolution'] },
    { category: 'wordplay', keywords: ['word', 'language', 'text', 'meaning', 'treachery of images'] },
    { category: 'scale', keywords: ['giant', 'miniature', 'scale', 'proportion', 'size', 'oversized'] },
    { category: 'mystery', keywords: ['mystery', 'enigma', 'puzzle', 'unknown', 'question'] },
    { category: 'landscapes', keywords: ['landscape', 'nature', 'horizon', 'vista', 'scenery'] },
    { category: 'skies', keywords: ['sky', 'cloud', 'bird', 'flying', 'heaven', 'air'] },
    { category: 'classic', keywords: ['classic', 'iconic', 'famous', 'son of man', 'golconda'] }
  ];
  
  // Check for keyword matches
  for (const pattern of categoryPatterns) {
    if (pattern.keywords.some(keyword => conceptLower.includes(keyword))) {
      console.log(`\n🔍 Auto-detected category: ${pattern.category} based on concept keywords`);
      return pattern.category;
    }
  }
  
  return undefined;
}

// Determine the category to use
const detectedCategory = categoryArg || detectConceptCategory(concept);

// Check for category-specific art direction if category is provided
const categoryArtDirection = loadCategoryArtDirection(detectedCategory);

// Log the art direction selection process
console.log('\n🎨 Art Direction Selection:');
if (categoryArg) {
  console.log(`- Using explicitly specified category: "${categoryArg}"`);
} else if (detectedCategory) {
  console.log(`- Using auto-detected category: "${detectedCategory}"`);
} else {
  console.log('- Using default art direction (no specific category)');
}

if (fileArtDirection) {
  console.log('- Found custom art-direction.json file');
}

if (categoryArtDirection) {
  console.log(`- Applied category-specific art direction from: magritte_${detectedCategory}.json`);
} else if (detectedCategory) {
  console.log(`- No category-specific file found for "${detectedCategory}", using base art direction`);
}

// Merge art directions with priority: category > file > default
const artDirection: ArtDirection = {
  ...defaultArtDirection,
  ...fileArtDirection,
  ...categoryArtDirection
};

// Define the models
const FLUX_PRO_MODEL = 'black-forest-labs/flux-1.1-pro';
const FLUX_MODEL_BASE = 'adirik/flux-cinestill';
const MINIMAX_MODEL = 'minimax/image-01';

async function generateArt(concept: string) {
  try {
    // Check for API keys
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    
    console.log('🎨 ArtBot - Generating Art with Multi-Agent System');
    console.log('------------------------------------');
    console.log('API Keys found:');
    console.log(`- Anthropic: ${anthropicApiKey ? 'Yes' : 'No'}`);
    console.log(`- OpenAI: ${openaiApiKey ? 'Yes' : 'No'}`);
    console.log(`- Replicate: ${replicateApiKey ? 'Yes' : 'No'}`);
    
    // Initialize AI service
    const aiService = new AIService({
      anthropicApiKey,
      openaiApiKey,
    });
    
    await aiService.initialize();
    
    // Initialize the ReplicateService with FLUX Pro as the default model
    const replicateService = new ReplicateService({
      apiKey: replicateApiKey,
      defaultModel: process.env.DEFAULT_IMAGE_MODEL || FLUX_PRO_MODEL,
      defaultWidth: parseInt(process.env.IMAGE_WIDTH || '1024', 10),
      defaultHeight: parseInt(process.env.IMAGE_HEIGHT || '1024', 10),
      defaultNumInferenceSteps: parseInt(process.env.INFERENCE_STEPS || '28', 10),
      defaultGuidanceScale: parseFloat(process.env.GUIDANCE_SCALE || '3'),
    });
    
    await replicateService.initialize();
    
    // Initialize memory system
    const memorySystem = new MemorySystem({
      aiService,
      replicateService,
      baseDir: process.env.STORAGE_PATH || '.artbot',
    });
    
    await memorySystem.initialize();
    console.log(`📚 Loaded ${memorySystem.getMemories().size} memories from storage`);
    
    // Initialize style service
    const styleService = new StyleService({
      replicateService,
    }, process.cwd());
    
    await styleService.initialize();
    
    // Initialize the ArtBotMultiAgentSystem
    const artBotMultiAgentSystem = new ArtBotMultiAgentSystem({
      aiService,
      replicateService,
      memorySystem,
      styleService,
      outputDir
    });
    
    await artBotMultiAgentSystem.initialize();
    console.log('🤖 ArtBot Multi-Agent System initialized');
    console.log('✅ Services initialized');
    
    // If no concept is provided via command line, generate a random cinematic concept
    let artConcept = concept;
    
    if (!artConcept) {
      // Determine which category to use
      let category: ConceptCategory | undefined;
      
      if (detectedCategory) {
        // Try to match the detected category to a valid category
        const categoryKey = Object.keys(ConceptCategory).find(
          key => key.toLowerCase() === detectedCategory.toLowerCase()
        );
        
        if (categoryKey) {
          category = ConceptCategory[categoryKey as keyof typeof ConceptCategory];
          console.log(`\n🎬 Generating a ${category} concept...`);
        } else {
          console.log(`\n⚠️ Unknown category: "${detectedCategory}". Using MAGRITTE_SURREALISM category.`);
          category = ConceptCategory.MAGRITTE_SURREALISM;
        }
      } else {
        // If no category specified, use MAGRITTE_SURREALISM as the default
        category = ConceptCategory.MAGRITTE_SURREALISM;
        console.log(`\n🎬 Generating a ${category} concept...`);
      }
      
      // Generate the concept with the selected category
      artConcept = await generateCinematicConcept(aiService, { 
        temperature: 0.9,
        category
      });
    } else {
      // Check if the provided concept is crypto-related
      const cryptoKeywords = ['bitcoin', 'crypto', 'blockchain', 'nft', 'satoshi', 'ethereum', 'web3', 'token'];
      const isCryptoRelated = cryptoKeywords.some(keyword => concept.toLowerCase().includes(keyword));
      
      // If crypto-related, use CRYPTO_ART category
      if (isCryptoRelated && !detectedCategory) {
        console.log(`\n🎬 Detected crypto-related concept, using CRYPTO_ART category...`);
        const cryptoArtConcept = await generateCinematicConcept(aiService, {
          temperature: 0.9,
          category: ConceptCategory.CRYPTO_ART
        });
        artConcept = cryptoArtConcept;
      }
    }
    
    console.log(`\n💡 Using concept: "${artConcept}"`);
    
    // Check if the concept is crypto-related for the project setup
    const cryptoKeywords = ['bitcoin', 'crypto', 'blockchain', 'nft', 'satoshi', 'ethereum', 'web3', 'token', 'fidenza', 'ringers', 'meridian', 'xcopy', 'beeple'];
    const isCryptoRelated = cryptoKeywords.some(keyword => artConcept.toLowerCase().includes(keyword));
    
    // Determine if we should use Magritte style
    const useMagritteStyle = detectedCategory === 'magritte_surrealism' || 
                            (detectedCategory === undefined && !isCryptoRelated && 
                             (artConcept.toLowerCase().includes('magritte') ||
                              artConcept.toLowerCase().includes('surreal')));
                              
    // Determine if we should use Impressionist style
    const useImpressionistStyle = detectedCategory === 'impressionist';
    
    // Create a category-specific art direction
    let categoryArtDirection: ArtDirection = { ...artDirection };
    
    if (useImpressionistStyle) {
      // Override with impressionist-specific art direction
      categoryArtDirection = {
        styleEmphasis: ["Impressionist style", ...(artDirection.styleEmphasis?.filter(style => 
          !style.toLowerCase().includes('magritte') && 
          !style.toLowerCase().includes('surreal')) || [])],
        visualElements: ["visible brushstrokes", "emphasis on light", "everyday subject matter", 
          ...(artDirection.visualElements?.filter(element => 
            !["bowler hats", "floating objects", "impossible scenes", 
             "ordinary objects in extraordinary contexts"].includes(element)) || [])],
        colorPalette: ["light colors", "visible brushstrokes", 
          ...(artDirection.colorPalette?.filter(color => !color.toLowerCase().includes('magritte')) || [])],
        compositionGuidelines: ["visible brushstrokes", "emphasis on light", "everyday subject matter", 
          ...(artDirection.compositionGuidelines?.filter(guideline => 
            !guideline.toLowerCase().includes('surreal')) || [])],
        moodAndTone: "light and airy with a focus on capturing fleeting moments and natural light",
        references: ["Claude Monet's 'Waterlilies'", "Pierre-Auguste Renoir's 'Luncheon of the Boating Party'",
          ...(artDirection.references?.filter(ref => !ref.toLowerCase().includes('magritte')) || [])],
        avoidElements: [...(artDirection.avoidElements || []), "surreal elements", "impossible scenes"]
      };
    } else if (useMagritteStyle) {
      // Use Magritte-specific art direction
      categoryArtDirection = {
        styleEmphasis: ["Magritte surrealism", "surreal juxtaposition", 
          ...(artDirection.styleEmphasis?.filter(style => !style.toLowerCase().includes('impressionist')) || [])],
        visualElements: ["bowler hats", "floating objects", "clouds", "blue skies", 
          "impossible scenes", "ordinary objects in extraordinary contexts",
          "green apples (often oversized)", "men in suits", "veiled faces",
          "unexpected scale changes", "train engines in unusual places",
          "overlapping realities", "theatrical backdrops", "contradictory shadows",
          "day-to-night contrasts", "the single eye", "curtains framing scenes",
          "mismatched reflections", "blend of interior and exterior spaces",
          ...(artDirection.visualElements?.filter(element => 
            !["visible brushstrokes", "emphasis on light", "everyday subject matter"].includes(element)) || [])],
        colorPalette: ["Magritte blues", "soft greens", "earthy browns", 
          ...(artDirection.colorPalette?.filter(color => !color.toLowerCase().includes('impressionist')) || [])],
        compositionGuidelines: ["surreal scale relationships", "clean compositions with clear subjects", 
          ...(artDirection.compositionGuidelines?.filter(guideline => 
            !guideline.toLowerCase().includes('impressionist')) || [])],
        moodAndTone: "dreamlike and contemplative with a sense of mystery and philosophical questioning",
        references: ["René Magritte's 'The Son of Man'", "René Magritte's 'The Empire of Light'", 
          "René Magritte's 'The Treachery of Images'", "René Magritte's 'Golconda'",
          "René Magritte's 'Time Transfixed (La Durée Poignardée)'",
          "René Magritte's 'The Lovers (Les Amants)'",
          "René Magritte's 'Not to Be Reproduced (La Reproduction Interdite)'",
          "René Magritte's 'The Human Condition (La Condition Humaine)'",
          "René Magritte's 'The False Mirror (Le Faux Miroir)'",
          "René Magritte's 'Le Blanc Seing (The Blank Check)'",
          "René Magritte's 'The Listening Room (La Chambre d'Écoute)'",
          "René Magritte's 'La Clairvoyance'",
          "René Magritte's 'The Lost Jockey (Le Jockey Perdu)'",
          "René Magritte's 'Decalcomania'",
          ...(artDirection.references?.filter(ref => 
            !ref.toLowerCase().includes('monet') && 
            !ref.toLowerCase().includes('renoir')) || [])],
        avoidElements: [...(artDirection.avoidElements || []), "visible brushstrokes", "impressionist elements"]
      };
    } else if (isCryptoRelated) {
      // Add crypto-specific elements
      categoryArtDirection.visualElements = [
        ...(categoryArtDirection.visualElements || []),
        'blockchain visualization', 'digital currency symbols', 'cryptographic elements'
      ];
    }
    
    // Create a project for the multi-agent system
    const project = {
      title: artConcept,
      description: `Create an artistic interpretation of the concept: "${artConcept}"`,
      useFlux: true,
      requirements: [
        "Create a visually striking image that captures the essence of the concept",
        "Use cinematic lighting and composition",
        "Incorporate rich visual metaphors and symbolism",
        isCryptoRelated ? "Include crypto-native visual elements and aesthetics" : "Balance abstract and recognizable elements",
        useMagritteStyle ? "Use René Magritte's surrealist style with clean compositions and philosophical questioning" : 
        useImpressionistStyle ? "Use Impressionist style with visible brushstrokes, emphasis on light, and everyday subject matter" : 
        "Evoke an emotional response in the viewer"
      ],
      outputFilename: `flux-${artConcept.replace(/\s+/g, '-').toLowerCase()}`,
      // Add the category-specific art direction to the project
      artDirection: categoryArtDirection
    };
    
    // Log art direction being used
    console.log('\n🎨 Art Direction:');
    console.log(`- Style Emphasis: ${project.artDirection.styleEmphasis?.join(', ') || 'None specified'}`);
    console.log(`- Visual Elements: ${project.artDirection.visualElements?.join(', ') || 'None specified'}`);
    console.log(`- Color Palette: ${project.artDirection.colorPalette?.join(', ') || 'None specified'}`);
    console.log(`- Composition: ${project.artDirection.compositionGuidelines?.join(', ') || 'None specified'}`);
    console.log(`- Mood and Tone: ${project.artDirection.moodAndTone || 'None specified'}`);
    if (project.artDirection.references && project.artDirection.references.length > 0) {
      console.log(`- References: ${project.artDirection.references.join(', ')}`);
    }
    if (project.artDirection.avoidElements && project.artDirection.avoidElements.length > 0) {
      console.log(`- Avoiding: ${project.artDirection.avoidElements.join(', ')}`);
    }
    
    // Run the art project using the multi-agent system
    console.log('\n🖼️ Generating art using multi-agent collaboration...');
    const result = await artBotMultiAgentSystem.runArtProject(project);
    
    // Check if we have a valid result with artwork
    if (!result) {
      console.error('❌ Failed to generate image: No result returned');
      return;
    }
    
    // Initialize artwork data with defaults if not present
    const artwork = result.artwork || {};
    
    // Extract results from the multi-agent process
    let imageUrl = artwork.imageUrl || '';
    const prompt = artwork.prompt || '';
    const creativeProcess = artwork.creativeProcess || "Generated through multi-agent collaboration";
    
    // Validate the image URL
    if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      console.error(`❌ Invalid image URL: ${imageUrl}`);
      imageUrl = 'https://replicate.delivery/pbxt/AHFVdBEQcWgGTkn4MbkxDmHiLvULIEg5jX8CXNlP63xYHFjIA/out.png';
      console.log(`Using fallback image URL: ${imageUrl}`);
    } else {
      console.log(`✅ Image generated successfully: ${imageUrl}`);
    }
    
    // Save outputs to files
    const sanitizedConcept = artConcept.replace(/\s+/g, '-').toLowerCase();
    const promptPath = path.join(outputDir, `flux-${sanitizedConcept}-prompt.txt`);
    const imagePath = path.join(outputDir, `flux-${sanitizedConcept}.txt`);
    const metadataPath = path.join(outputDir, `flux-${sanitizedConcept}-metadata.json`);
    
    // Save prompt and creative process
    fs.writeFileSync(
      promptPath,
      `Prompt: ${prompt}\n\nCreative Process: ${creativeProcess}`
    );
    console.log(`\n✅ Prompt saved to: ${promptPath}`);
    
    // Save image URL
    fs.writeFileSync(imagePath, imageUrl);
    console.log(`\n✅ Image URL saved to: ${imagePath}`);
    
    // Save metadata
    const metadata = {
      concept: artConcept,
      prompt: prompt,
      creativeProcess: creativeProcess,
      imageUrl: imageUrl,
      timestamp: new Date().toISOString(),
      isCryptoNative: isCryptoRelated || detectedCategory === 'crypto_art',
      multiAgentCollaboration: true,
      artDirection: project.artDirection,
      critique: result.critique ? {
        strengths: result.critique.strengths,
        areasForImprovement: result.critique.areasForImprovement,
        overallScore: result.critique.overallScore
      } : null
    };
    
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`\n✅ Metadata saved to: ${metadataPath}`);
    
    // Store in memory system
    await memorySystem.storeMemory(
      {
        concept: artConcept,
        prompt: prompt,
        creativeProcess: creativeProcess,
        imageUrl: imageUrl,
        multiAgentCollaboration: true,
        artDirection: project.artDirection,
        critique: result.critique
      },
      MemoryType.EXPERIENCE,
      { 
        type: 'artwork', 
        concept: artConcept,
        isCryptoNative: isCryptoRelated || detectedCategory === 'crypto_art'
      },
      ['artwork', 'flux', 'multi-agent', ...(isCryptoRelated ? ['crypto', 'bitcoin', 'satoshi'] : []), ...artConcept.split(' ')]
    );
    
    console.log('\n✨ Art generation completed successfully!');
    console.log('\n🤖 Multi-Agent Collaboration Summary:');
    console.log('- Director Agent: Coordinated the creative process');
    console.log('- Ideator Agent: Generated creative ideas based on the concept');
    console.log('- Stylist Agent: Developed artistic styles for the concept');
    console.log('- Refiner Agent: Created the final artwork using FLUX');
    console.log('- Critic Agent: Provided evaluation and feedback');
    
    if (result.critique) {
      console.log(`\n📊 Artwork Evaluation: ${result.critique.overallScore}/10`);
    }
    
  } catch (error) {
    console.error('❌ Error generating art:', error);
  }
}

// Run the main function
generateArt(concept).catch(console.error);

// Export the function for use in other modules
export { generateArt }; 