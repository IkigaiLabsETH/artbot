import { v4 as uuidv4 } from 'uuid';
import { ModelPrediction } from '../../types.js';
import fetch from 'node-fetch';

export { ModelPrediction };

export class ReplicateService {
  private apiKey: string;
  private baseUrl: string = 'https://api.replicate.com/v1';
  private defaultModel: string;
  private defaultWidth: number;
  private defaultHeight: number;
  private defaultNumInferenceSteps: number;
  private defaultGuidanceScale: number;
  
  constructor(config: Record<string, any> = {}) {
    this.apiKey = config.apiKey || process.env.REPLICATE_API_KEY || '';
    this.defaultModel = config.defaultModel || process.env.DEFAULT_IMAGE_MODEL || 'adirik/flux-cinestill';
    this.defaultWidth = config.defaultWidth || parseInt(process.env.IMAGE_WIDTH || '1024', 10);
    this.defaultHeight = config.defaultHeight || parseInt(process.env.IMAGE_HEIGHT || '1024', 10);
    this.defaultNumInferenceSteps = config.defaultNumInferenceSteps || parseInt(process.env.NUM_INFERENCE_STEPS || '28', 10);
    this.defaultGuidanceScale = config.defaultGuidanceScale || parseFloat(process.env.GUIDANCE_SCALE || '3.0');
  }
  
  async initialize(): Promise<void> {
    if (!this.apiKey) {
      console.warn('Replicate API key not provided. Service will not work properly.');
    } else {
      console.log(`✅ Replicate API key found: ${this.apiKey.substring(0, 5)}...`);
      console.log(`🖼️ Default image model: ${this.defaultModel}`);
      console.log(`📐 Image dimensions: ${this.defaultWidth}x${this.defaultHeight}`);
      console.log(`🔄 Inference steps: ${this.defaultNumInferenceSteps}`);
      console.log(`🎯 Guidance scale: ${this.defaultGuidanceScale}`);
    }
  }
  
  /**
   * Run a prediction on a model
   */
  async runPrediction(
    model: string = this.defaultModel,
    input: Record<string, any>
  ): Promise<ModelPrediction> {
    // Create a prediction object
    const prediction: ModelPrediction = {
      id: uuidv4(),
      model,
      input,
      output: null,
      created: new Date(),
      status: 'pending'
    };
    
    try {
      if (!this.apiKey) {
        throw new Error('Replicate API key not provided');
      }
      
      // If this is the FLUX model, add default parameters if not provided
      if (model.includes('flux-cinestill') || model.includes('adirik/flux')) {
        input.width = input.width || this.defaultWidth;
        input.height = input.height || this.defaultHeight;
        input.num_inference_steps = input.num_inference_steps || this.defaultNumInferenceSteps;
        input.guidance_scale = input.guidance_scale || this.defaultGuidanceScale;
        input.output_format = input.output_format || "png";
        
        // Ensure the prompt has the FLUX trigger word
        if (input.prompt && !input.prompt.includes('CNSTLL')) {
          input.prompt = `CNSTLL ${input.prompt}`;
        }
        
        // Add FLUX-specific keywords if they're not already present
        if (input.prompt) {
          const fluxKeywords = ['cinestill 800t', 'film grain', 'night time', '4k'];
          let keywordsToAdd = fluxKeywords.filter(keyword => !input.prompt.toLowerCase().includes(keyword.toLowerCase()));
          
          if (keywordsToAdd.length > 0) {
            input.prompt = `${input.prompt}, ${keywordsToAdd.join(', ')}`;
          }
        }
        
        // Use a simpler model
        model = 'stability-ai/stable-diffusion';
        console.log(`⚠️ Using simpler model: ${model}`);
      }
      // If this is an SDXL model, add default parameters if not provided
      else if (model.includes('stability-ai') || model.includes('sdxl')) {
        input.width = input.width || this.defaultWidth;
        input.height = input.height || this.defaultHeight;
        input.num_outputs = input.num_outputs || 1;
      }
      
      console.log(`🔄 Running prediction on model: ${model}`);
      console.log(`📝 Input: ${JSON.stringify(input, null, 2)}`);

      // Make the actual API call to Replicate
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: model,
          input: input
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      prediction.id = data.id;
      
      // Poll for the prediction result
      const result = await this.pollPrediction(data.id);
      
      // Map Replicate status to our status format
      prediction.status = result.status === 'succeeded' ? 'success' : result.status === 'failed' ? 'failed' : 'pending';
      prediction.output = result.output;
      
      console.log(`✅ Prediction completed: ${prediction.id}`);
      console.log(`🖼️ Output: ${JSON.stringify(prediction.output, null, 2)}`);
      
      return prediction;
    } catch (error) {
      // Handle error
      console.error(`❌ Prediction failed: ${error}`);
      prediction.status = 'failed';
      prediction.error = error instanceof Error ? error.message : String(error);
      return prediction;
    }
  }
  
  /**
   * Poll for a prediction result
   */
  private async pollPrediction(id: string, maxAttempts = 30, interval = 2000): Promise<any> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const result = await this.getPredictionRaw(id);
      
      if (!result) {
        throw new Error(`Prediction ${id} not found`);
      }
      
      // Use the raw Replicate status values
      if (result.status === 'succeeded') {
        return result;
      }
      
      if (result.status === 'failed' || result.status === 'canceled') {
        throw new Error(`Prediction ${id} ${result.status}: ${result.error || 'Unknown error'}`);
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
    
    throw new Error(`Prediction ${id} timed out after ${maxAttempts} attempts`);
  }
  
  /**
   * Get a raw prediction by ID directly from Replicate API
   */
  private async getPredictionRaw(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/predictions/${id}`, {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting prediction ${id}: ${error}`);
      return null;
    }
  }
  
  /**
   * Get a prediction by ID
   */
  async getPrediction(id: string): Promise<ModelPrediction | null> {
    try {
      const data = await this.getPredictionRaw(id);
      
      if (!data) {
        return null;
      }
      
      // Map Replicate status to our status format
      const status = data.status === 'succeeded' ? 'success' : 
                     data.status === 'failed' ? 'failed' : 'pending';
      
      return {
        id: data.id,
        model: data.version,
        input: data.input,
        output: data.output,
        created: new Date(data.created_at),
        status: status,
        error: data.error
      };
    } catch (error) {
      console.error(`Error getting prediction ${id}: ${error}`);
      return null;
    }
  }
  
  /**
   * Generate an image using the default model
   */
  async generateImage(prompt: string, options: Record<string, any> = {}): Promise<string | null> {
    try {
      console.log(`🎨 Using model for image generation: ${this.defaultModel}`);
      
      // For FLUX model, enhance the prompt with conceptually rich elements if not already provided
      if (this.defaultModel.includes('flux-cinestill') || this.defaultModel.includes('adirik/flux')) {
        if (!prompt.includes('CNSTLL')) {
          prompt = `CNSTLL ${prompt}`;
        }
        
        // Add FLUX-specific keywords if they're not already present
        const fluxKeywords = ['cinestill 800t', 'film grain', 'night time', '4k'];
        let keywordsToAdd = fluxKeywords.filter(keyword => !prompt.toLowerCase().includes(keyword.toLowerCase()));
        
        if (keywordsToAdd.length > 0) {
          prompt = `${prompt}, ${keywordsToAdd.join(', ')}`;
        }
      }
      
      // Prepare input for the model
      const input: Record<string, any> = {
        prompt: prompt,
        ...options
      };
      
      // Run the prediction
      const prediction = await this.runPrediction(this.defaultModel, input);
      
      if (prediction.status === 'success' && prediction.output) {
        // For models that return an array of images, return the first one
        if (Array.isArray(prediction.output)) {
          return prediction.output[0];
        }
        // For models that return an object with urls, return the first url
        else if (typeof prediction.output === 'object' && prediction.output !== null) {
          return Object.values(prediction.output)[0] as string;
        }
        // Otherwise return the output directly
        return prediction.output as string;
      } else {
        console.log(`⚠️ Replicate API failed, falling back to OpenAI DALL-E`);
        return this.fallbackToDALLE(prompt, options);
      }
    } catch (error) {
      console.error(`❌ Error generating image: ${error}`);
      console.log(`⚠️ Replicate API failed, falling back to OpenAI DALL-E`);
      return this.fallbackToDALLE(prompt, options);
    }
  }

  private async fallbackToDALLE(prompt: string, options: Record<string, any> = {}): Promise<string | null> {
    try {
      console.log(`🎨 Falling back to OpenAI DALL-E for image generation`);
      
      // Check if OpenAI API key is available
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not provided for fallback');
      }
      
      // Prepare the request to OpenAI API
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: options.dalle_model || process.env.IMAGE_OPENAI_MODEL || 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: `${options.width || this.defaultWidth}x${options.height || this.defaultHeight}`,
          response_format: 'url'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log(`✅ DALL-E image generated successfully`);
      
      // Return the image URL
      return data.data[0].url;
    } catch (error) {
      console.error(`❌ Error in DALL-E fallback: ${error}`);
      return null;
    }
  }
} 