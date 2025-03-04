import { Service, ServiceType, MemoryManager, UUID, Memory } from '@elizaos/core';
import { ArtworkMemory, ArtworkIdea } from '../../types/index.js';

export interface ArtMemoryServiceConfig {
  tableName?: string;
}

/**
 * ArtMemoryService - Handles persistence of artwork memories
 * 
 * This service provides methods to store and retrieve artwork memories
 * using the core MemoryManager for persistence.
 */
export class ArtMemoryService extends Service {
  private memoryManager: MemoryManager | null = null;
  private tableName: string;
  private initialized: boolean = false;
  private memoryCache: Map<string, ArtworkMemory> = new Map();

  constructor(config: ArtMemoryServiceConfig = {}) {
    super();
    this.tableName = config.tableName || 'art_memories';
  }

  static get serviceType(): ServiceType {
    return ServiceType.TEXT_GENERATION;
  }

  /**
   * Initialize the memory service
   */
  async initialize(runtime: any): Promise<void> {
    if (this.initialized) return;

    // Create a memory manager for artwork memories
    this.memoryManager = new MemoryManager({
      tableName: this.tableName,
      runtime
    });

    this.initialized = true;
    console.log(`ArtMemoryService initialized with table: ${this.tableName}`);
  }

  /**
   * Store an artwork memory
   * 
   * @param artwork The artwork memory to store
   * @param roomId The room ID to associate with this memory
   * @param userId The user ID to associate with this memory
   */
  async storeArtwork(artwork: ArtworkMemory, roomId: UUID, userId: UUID): Promise<void> {
    if (!this.memoryManager) {
      throw new Error('ArtMemoryService not initialized');
    }

    // Add to in-memory cache
    this.memoryCache.set(artwork.id, artwork);

    // Create a memory object for the core memory system
    const memory: Memory = {
      id: artwork.id as UUID,
      roomId,
      userId,
      agentId: this.memoryManager.runtime.agentId,
      content: {
        text: artwork.idea.concept, // Use the concept as searchable text
        json: artwork // Store the full artwork object
      },
      embedding: null // Will be generated by the memory manager
    };

    // Store in the database
    await this.memoryManager.createMemory(memory);
  }

  /**
   * Get recent artwork memories
   * 
   * @param roomId The room ID to get memories for
   * @param count The number of memories to retrieve
   */
  async getRecentArtworks(roomId: UUID, count: number = 10): Promise<ArtworkMemory[]> {
    if (!this.memoryManager) {
      throw new Error('ArtMemoryService not initialized');
    }

    // Get memories from the database
    const memories = await this.memoryManager.getMemories({
      roomId,
      count,
      unique: true
    });

    // Convert to ArtworkMemory objects
    return memories
      .filter(memory => memory.content.json)
      .map(memory => memory.content.json as ArtworkMemory);
  }

  /**
   * Find similar artworks based on a concept
   * 
   * @param concept The concept to search for
   * @param roomId The room ID to search in
   * @param userId The user ID to associate with the search
   * @param count The number of results to return
   */
  async findSimilarArtworks(concept: string, roomId: UUID, userId: UUID, count: number = 5): Promise<ArtworkMemory[]> {
    if (!this.memoryManager) {
      throw new Error('ArtMemoryService not initialized');
    }

    // Generate embedding for the concept
    const memory: Partial<Memory> = {
      id: 'temp' as UUID,
      roomId,
      userId,
      agentId: this.memoryManager.runtime.agentId,
      content: { text: concept },
      embedding: null
    };

    const memoryWithEmbedding = await this.memoryManager.addEmbeddingToMemory(memory as Memory);
    
    // Search for similar memories
    const similarMemories = await this.memoryManager.searchMemoriesByEmbedding(
      memoryWithEmbedding.embedding!,
      {
        roomId,
        count,
        match_threshold: 0.7
      }
    );

    // Convert to ArtworkMemory objects
    return similarMemories
      .filter(memory => memory.content.json)
      .map(memory => memory.content.json as ArtworkMemory);
  }

  /**
   * Get artwork by ID
   * 
   * @param id The artwork ID
   */
  async getArtworkById(id: string): Promise<ArtworkMemory | null> {
    // Check cache first
    if (this.memoryCache.has(id)) {
      return this.memoryCache.get(id)!;
    }

    if (!this.memoryManager) {
      throw new Error('ArtMemoryService not initialized');
    }

    // Get from database
    const memory = await this.memoryManager.getMemoryById(id as UUID);
    
    if (!memory || !memory.content.json) {
      return null;
    }

    const artwork = memory.content.json as ArtworkMemory;
    
    // Add to cache
    this.memoryCache.set(id, artwork);
    
    return artwork;
  }

  /**
   * Delete an artwork memory
   * 
   * @param id The artwork ID to delete
   */
  async deleteArtwork(id: string): Promise<void> {
    if (!this.memoryManager) {
      throw new Error('ArtMemoryService not initialized');
    }

    // Remove from cache
    this.memoryCache.delete(id);

    // Remove from database
    await this.memoryManager.removeMemory(id as UUID);
  }

  /**
   * Count artwork memories
   * 
   * @param roomId The room ID to count memories for
   */
  async countArtworks(roomId: UUID): Promise<number> {
    if (!this.memoryManager) {
      throw new Error('ArtMemoryService not initialized');
    }

    return await this.memoryManager.countMemories(roomId);
  }
} 