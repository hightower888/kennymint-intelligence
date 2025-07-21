import { EventEmitter } from 'events';
import * as tf from '@tensorflow/tfjs-node';

interface AITeamMember {
  id: string;
  name: string;
  role: 'developer' | 'designer' | 'product_manager' | 'qa_engineer' | 'devops' | 'architect' | 'scrum_master';
  personality: Personality;
  emotions: EmotionalState;
  skills: Skill[];
  experience: number;
  workload: number;
  availability: number;
  performanceHistory: PerformanceRecord[];
  relationships: Map<string, RelationshipState>;
  currentTasks: Task[];
  preferences: WorkPreferences;
  learningProgress: LearningProgress;
  createdAt: Date;
  lastActive: Date;
}

interface Personality {
  traits: {
    openness: number;        // 0-1: Open to new ideas vs traditional
    conscientiousness: number; // 0-1: Organized vs flexible
    extraversion: number;     // 0-1: Social vs independent
    agreeableness: number;    // 0-1: Collaborative vs competitive
    neuroticism: number;      // 0-1: Stress-prone vs resilient
  };
  workStyle: 'methodical' | 'creative' | 'collaborative' | 'independent' | 'detail_oriented' | 'big_picture';
  communicationStyle: 'direct' | 'diplomatic' | 'technical' | 'visual' | 'storytelling';
  decisionMaking: 'analytical' | 'intuitive' | 'consensus' | 'decisive';
}

interface EmotionalState {
  mood: number;           // -1 to 1: negative to positive
  stress: number;         // 0-1: calm to stressed
  motivation: number;     // 0-1: low to high motivation
  confidence: number;     // 0-1: uncertain to confident
  satisfaction: number;   // 0-1: dissatisfied to satisfied
  energy: number;         // 0-1: tired to energetic
  lastUpdated: Date;
}

interface Skill {
  name: string;
  level: number;        // 0-1: beginner to expert
  category: 'technical' | 'soft' | 'domain' | 'leadership';
  experience: number;   // years of experience
  learningRate: number; // how quickly they improve
}

interface RelationshipState {
  memberId: string;
  trust: number;        // 0-1: no trust to complete trust
  respect: number;      // 0-1: no respect to high respect
  compatibility: number; // 0-1: incompatible to highly compatible
  communication: number; // 0-1: poor to excellent communication
  collaboration: number; // 0-1: difficult to seamless collaboration
  conflicts: ConflictHistory[];
  positive_interactions: number;
  negative_interactions: number;
}

interface ConflictHistory {
  date: Date;
  type: 'technical_disagreement' | 'process_conflict' | 'personality_clash' | 'resource_competition';
  severity: number; // 0-1
  resolution: 'resolved' | 'ongoing' | 'escalated';
  impact: number;   // impact on team productivity
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'development' | 'design' | 'testing' | 'documentation' | 'review' | 'planning';
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: number; // 0-1
  estimatedHours: number;
  actualHours?: number;
  status: 'not_started' | 'in_progress' | 'blocked' | 'review' | 'completed';
  dependencies: string[];
  assignedAt: Date;
  dueDate: Date;
  completedAt?: Date;
}

interface WorkPreferences {
  preferredHours: { start: number; end: number };
  workEnvironment: 'quiet' | 'collaborative' | 'music' | 'flexible';
  meetingTolerance: number; // 0-1: minimal to lots of meetings
  taskPreferences: string[];
  learningStyle: 'hands_on' | 'theoretical' | 'mentoring' | 'documentation';
  feedbackStyle: 'frequent' | 'periodic' | 'minimal';
}

interface LearningProgress {
  currentGoals: string[];
  completedCourses: string[];
  skillGrowth: Map<string, number>;
  mentorshipGiven: number;
  mentorshipReceived: number;
  knowledgeSharing: number;
}

interface PerformanceRecord {
  date: Date;
  tasksCompleted: number;
  quality: number;      // 0-1: poor to excellent
  efficiency: number;   // 0-1: slow to fast
  collaboration: number; // 0-1: poor to excellent
  innovation: number;   // 0-1: routine to innovative
  leadership: number;   // 0-1: follower to leader
  overallRating: number; // 0-1: poor to excellent
}

interface TeamDynamics {
  cohesion: number;           // 0-1: fragmented to unified
  productivity: number;       // 0-1: low to high
  communication: number;      // 0-1: poor to excellent
  innovation: number;         // 0-1: stagnant to innovative
  morale: number;             // 0-1: low to high
  conflictLevel: number;      // 0-1: harmonious to conflicted
  knowledgeSharing: number;   // 0-1: siloed to open
  adaptability: number;       // 0-1: rigid to flexible
}

interface ProjectContext {
  id: string;
  name: string;
  phase: 'planning' | 'development' | 'testing' | 'deployment' | 'maintenance';
  urgency: number;        // 0-1: relaxed to urgent
  complexity: number;     // 0-1: simple to complex
  innovationLevel: number; // 0-1: routine to cutting-edge
  teamSize: number;
  duration: number;       // days
  stakeholders: string[];
}

export class AutonomousTeamManager extends EventEmitter {
  private teamMembers: Map<string, AITeamMember> = new Map();
  private teamDynamics: TeamDynamics;
  private currentProject: ProjectContext | null = null;
  private emotionalModel: tf.LayersModel | null = null;
  private performanceModel: tf.LayersModel | null = null;
  private relationshipModel: tf.LayersModel | null = null;
  private workloadBalancer: tf.LayersModel | null = null;
  private conflictResolver: tf.LayersModel | null = null;
  private teamOptimizer: tf.LayersModel | null = null;

  constructor() {
    super();
    this.initializeTeamDynamics();
    this.initializeAIModels();
    this.createInitialTeam();
    this.startAutonomousManagement();
  }

  private initializeTeamDynamics(): void {
    this.teamDynamics = {
      cohesion: 0.7,
      productivity: 0.8,
      communication: 0.75,
      innovation: 0.6,
      morale: 0.8,
      conflictLevel: 0.2,
      knowledgeSharing: 0.7,
      adaptability: 0.65
    };
  }

  private async initializeAIModels(): Promise<void> {
    console.log('🧠 Initializing AI Team Management models...');

    // Emotional state prediction model
    this.emotionalModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [20], units: 128, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 6, activation: 'tanh' }) // 6 emotional dimensions
      ]
    });

    this.emotionalModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Performance prediction model
    this.performanceModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [30], units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.4 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 7, activation: 'sigmoid' }) // 7 performance metrics
      ]
    });

    this.performanceModel.compile({
      optimizer: tf.train.adamax(0.002),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    // Relationship dynamics model
    this.relationshipModel = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [40], units: 512, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'sigmoid' }) // 5 relationship dimensions
      ]
    });

    this.relationshipModel.compile({
      optimizer: tf.train.rmsprop(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Workload balancing model
    this.workloadBalancer = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [25], units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' }) // Optimal workload
      ]
    });

    this.workloadBalancer.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Conflict resolution model
    this.conflictResolver = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [35], units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.4 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dense({ units: 4, activation: 'softmax' }) // 4 resolution strategies
      ]
    });

    this.conflictResolver.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    // Team optimization model
    this.teamOptimizer = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [50], units: 512, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'sigmoid' }) // 8 team dynamics metrics
      ]
    });

    this.teamOptimizer.compile({
      optimizer: tf.train.adamax(0.002),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    console.log('✅ AI models initialized');
  }

  private async createInitialTeam(): Promise<void> {
    console.log('👥 Creating initial AI team...');

    // Create diverse team members with different personalities and skills
    const teamMembers = [
      {
        name: 'Alex',
        role: 'architect' as const,
        personality: this.generatePersonality('analytical_leader'),
        skills: ['system_design', 'scalability', 'leadership', 'technical_strategy']
      },
      {
        name: 'Sam',
        role: 'developer' as const,
        personality: this.generatePersonality('creative_coder'),
        skills: ['frontend', 'backend', 'apis', 'databases']
      },
      {
        name: 'Jordan',
        role: 'designer' as const,
        personality: this.generatePersonality('creative_perfectionist'),
        skills: ['ui_design', 'ux_design', 'prototyping', 'user_research']
      },
      {
        name: 'Casey',
        role: 'qa_engineer' as const,
        personality: this.generatePersonality('detail_oriented'),
        skills: ['test_automation', 'manual_testing', 'quality_assurance', 'bug_tracking']
      },
      {
        name: 'Morgan',
        role: 'devops' as const,
        personality: this.generatePersonality('systematic_optimizer'),
        skills: ['infrastructure', 'deployment', 'monitoring', 'security']
      },
      {
        name: 'Riley',
        role: 'product_manager' as const,
        personality: this.generatePersonality('strategic_communicator'),
        skills: ['product_strategy', 'stakeholder_management', 'agile', 'analytics']
      }
    ];

    for (const memberDef of teamMembers) {
      const member = await this.createTeamMember(memberDef);
      this.teamMembers.set(member.id, member);
    }

    // Initialize relationships between team members
    await this.initializeRelationships();

    console.log(`✅ Created team with ${this.teamMembers.size} AI members`);
  }

  private async createTeamMember(definition: any): Promise<AITeamMember> {
    const member: AITeamMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: definition.name,
      role: definition.role,
      personality: definition.personality,
      emotions: this.generateInitialEmotions(),
      skills: this.generateSkills(definition.skills),
      experience: 2 + Math.random() * 8, // 2-10 years
      workload: 0.3 + Math.random() * 0.4, // 30-70% initial workload
      availability: 0.8 + Math.random() * 0.2, // 80-100% availability
      performanceHistory: [],
      relationships: new Map(),
      currentTasks: [],
      preferences: this.generateWorkPreferences(definition.personality),
      learningProgress: this.generateLearningProgress(),
      createdAt: new Date(),
      lastActive: new Date()
    };

    return member;
  }

  private generatePersonality(type: string): Personality {
    const baseTraits = {
      analytical_leader: { openness: 0.8, conscientiousness: 0.9, extraversion: 0.7, agreeableness: 0.6, neuroticism: 0.3 },
      creative_coder: { openness: 0.9, conscientiousness: 0.6, extraversion: 0.5, agreeableness: 0.7, neuroticism: 0.4 },
      creative_perfectionist: { openness: 0.9, conscientiousness: 0.9, extraversion: 0.4, agreeableness: 0.5, neuroticism: 0.6 },
      detail_oriented: { openness: 0.5, conscientiousness: 0.95, extraversion: 0.3, agreeableness: 0.8, neuroticism: 0.4 },
      systematic_optimizer: { openness: 0.7, conscientiousness: 0.9, extraversion: 0.5, agreeableness: 0.6, neuroticism: 0.2 },
      strategic_communicator: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.9, agreeableness: 0.8, neuroticism: 0.3 }
    };

    const base = baseTraits[type as keyof typeof baseTraits] || baseTraits.analytical_leader;
    
    // Add some randomness while keeping the core personality type
    const traits = {
      openness: Math.max(0.1, Math.min(0.9, base.openness + (Math.random() - 0.5) * 0.2)),
      conscientiousness: Math.max(0.1, Math.min(0.9, base.conscientiousness + (Math.random() - 0.5) * 0.2)),
      extraversion: Math.max(0.1, Math.min(0.9, base.extraversion + (Math.random() - 0.5) * 0.2)),
      agreeableness: Math.max(0.1, Math.min(0.9, base.agreeableness + (Math.random() - 0.5) * 0.2)),
      neuroticism: Math.max(0.1, Math.min(0.9, base.neuroticism + (Math.random() - 0.5) * 0.2))
    };

    const workStyles = ['methodical', 'creative', 'collaborative', 'independent', 'detail_oriented', 'big_picture'];
    const commStyles = ['direct', 'diplomatic', 'technical', 'visual', 'storytelling'];
    const decisionStyles = ['analytical', 'intuitive', 'consensus', 'decisive'];

    return {
      traits,
      workStyle: workStyles[Math.floor(Math.random() * workStyles.length)] as any,
      communicationStyle: commStyles[Math.floor(Math.random() * commStyles.length)] as any,
      decisionMaking: decisionStyles[Math.floor(Math.random() * decisionStyles.length)] as any
    };
  }

  private generateInitialEmotions(): EmotionalState {
    return {
      mood: 0.2 + Math.random() * 0.6, // Generally positive
      stress: Math.random() * 0.4, // Low to moderate stress
      motivation: 0.6 + Math.random() * 0.3, // High motivation
      confidence: 0.5 + Math.random() * 0.4, // Moderate to high confidence
      satisfaction: 0.6 + Math.random() * 0.3, // Generally satisfied
      energy: 0.7 + Math.random() * 0.3, // High energy
      lastUpdated: new Date()
    };
  }

  private generateSkills(skillNames: string[]): Skill[] {
    return skillNames.map(name => ({
      name,
      level: 0.4 + Math.random() * 0.5, // 40-90% skill level
      category: this.determineSkillCategory(name),
      experience: 1 + Math.random() * 5, // 1-6 years experience in this skill
      learningRate: 0.1 + Math.random() * 0.3 // Learning rate varies
    }));
  }

  private determineSkillCategory(skillName: string): 'technical' | 'soft' | 'domain' | 'leadership' {
    const categories = {
      technical: ['frontend', 'backend', 'apis', 'databases', 'infrastructure', 'deployment', 'monitoring', 'security', 'test_automation'],
      soft: ['communication', 'teamwork', 'problem_solving', 'adaptability'],
      domain: ['ui_design', 'ux_design', 'prototyping', 'user_research', 'product_strategy', 'analytics'],
      leadership: ['leadership', 'technical_strategy', 'stakeholder_management', 'agile']
    };

    for (const [category, skills] of Object.entries(categories)) {
      if (skills.includes(skillName)) {
        return category as any;
      }
    }
    return 'technical';
  }

  private generateWorkPreferences(personality: Personality): WorkPreferences {
    return {
      preferredHours: {
        start: 8 + Math.floor(Math.random() * 4), // 8-11 AM
        end: 16 + Math.floor(Math.random() * 4)   // 4-7 PM
      },
      workEnvironment: personality.traits.extraversion > 0.7 ? 'collaborative' : 'quiet',
      meetingTolerance: personality.traits.extraversion * 0.8 + 0.2,
      taskPreferences: this.generateTaskPreferences(personality),
      learningStyle: personality.traits.openness > 0.7 ? 'hands_on' : 'theoretical',
      feedbackStyle: personality.traits.extraversion > 0.6 ? 'frequent' : 'periodic'
    };
  }

  private generateTaskPreferences(personality: Personality): string[] {
    const allTasks = ['development', 'design', 'testing', 'documentation', 'review', 'planning', 'research', 'mentoring'];
    const preferences: string[] = [];
    
    // Add preferences based on personality
    if (personality.traits.conscientiousness > 0.8) {
      preferences.push('testing', 'documentation', 'review');
    }
    if (personality.traits.openness > 0.8) {
      preferences.push('research', 'design', 'development');
    }
    if (personality.traits.extraversion > 0.7) {
      preferences.push('planning', 'mentoring', 'review');
    }
    
    return preferences;
  }

  private generateLearningProgress(): LearningProgress {
    return {
      currentGoals: ['improve_technical_skills', 'enhance_collaboration'],
      completedCourses: [],
      skillGrowth: new Map(),
      mentorshipGiven: 0,
      mentorshipReceived: 0,
      knowledgeSharing: Math.random() * 10
    };
  }

  private async initializeRelationships(): Promise<void> {
    const members = Array.from(this.teamMembers.values());
    
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const member1 = members[i];
        const member2 = members[j];
        
        // Calculate initial relationship based on personality compatibility
        const compatibility = this.calculatePersonalityCompatibility(
          member1.personality, 
          member2.personality
        );
        
        const relationship1: RelationshipState = {
          memberId: member2.id,
          trust: 0.5 + compatibility * 0.3,
          respect: 0.6 + compatibility * 0.2,
          compatibility,
          communication: 0.5 + compatibility * 0.4,
          collaboration: 0.5 + compatibility * 0.3,
          conflicts: [],
          positive_interactions: 0,
          negative_interactions: 0
        };
        
        const relationship2: RelationshipState = {
          memberId: member1.id,
          trust: 0.5 + compatibility * 0.3,
          respect: 0.6 + compatibility * 0.2,
          compatibility,
          communication: 0.5 + compatibility * 0.4,
          collaboration: 0.5 + compatibility * 0.3,
          conflicts: [],
          positive_interactions: 0,
          negative_interactions: 0
        };
        
        member1.relationships.set(member2.id, relationship1);
        member2.relationships.set(member1.id, relationship2);
      }
    }
  }

  private calculatePersonalityCompatibility(p1: Personality, p2: Personality): number {
    // Calculate compatibility based on personality traits
    const traitDifferences = [
      Math.abs(p1.traits.openness - p2.traits.openness),
      Math.abs(p1.traits.conscientiousness - p2.traits.conscientiousness),
      Math.abs(p1.traits.extraversion - p2.traits.extraversion),
      Math.abs(p1.traits.agreeableness - p2.traits.agreeableness),
      Math.abs(p1.traits.neuroticism - p2.traits.neuroticism)
    ];
    
    const avgDifference = traitDifferences.reduce((sum, diff) => sum + diff, 0) / traitDifferences.length;
    
    // Lower differences mean higher compatibility
    return Math.max(0.2, 1 - avgDifference);
  }

  async assignTask(task: Task, preferredMemberId?: string): Promise<string> {
    console.log(`📋 Assigning task: ${task.title}`);
    
    let selectedMember: AITeamMember;
    
    if (preferredMemberId && this.teamMembers.has(preferredMemberId)) {
      selectedMember = this.teamMembers.get(preferredMemberId)!;
    } else {
      // Use AI to select the best team member for this task
      selectedMember = await this.selectOptimalMemberForTask(task);
    }
    
    // Check workload and adjust if necessary
    if (selectedMember.workload > 0.85) {
      await this.balanceWorkload(selectedMember.id);
    }
    
    // Assign the task
    selectedMember.currentTasks.push(task);
    selectedMember.workload += this.estimateTaskWorkload(task);
    selectedMember.lastActive = new Date();
    
    // Update emotional state
    await this.updateEmotionalState(selectedMember.id, 'task_assigned', task);
    
    console.log(`✅ Task assigned to ${selectedMember.name}`);
    this.emit('task_assigned', { task, member: selectedMember });
    
    return selectedMember.id;
  }

  private async selectOptimalMemberForTask(task: Task): Promise<AITeamMember> {
    const members = Array.from(this.teamMembers.values());
    const scoredMembers = members.map(member => ({
      member,
      score: this.calculateTaskFitScore(member, task)
    }));
    
    // Sort by score (highest first)
    scoredMembers.sort((a, b) => b.score - a.score);
    
    return scoredMembers[0].member;
  }

  private calculateTaskFitScore(member: AITeamMember, task: Task): number {
    let score = 0;
    
    // Skill match
    const relevantSkills = this.getRelevantSkills(task.type);
    const skillScore = relevantSkills.reduce((sum, skillName) => {
      const skill = member.skills.find(s => s.name === skillName);
      return sum + (skill ? skill.level : 0);
    }, 0) / relevantSkills.length;
    score += skillScore * 0.4;
    
    // Workload consideration (prefer less loaded members)
    score += (1 - member.workload) * 0.2;
    
    // Availability
    score += member.availability * 0.1;
    
    // Motivation and energy
    score += member.emotions.motivation * 0.1;
    score += member.emotions.energy * 0.1;
    
    // Recent performance
    if (member.performanceHistory.length > 0) {
      const recentPerformance = member.performanceHistory.slice(-3);
      const avgPerformance = recentPerformance.reduce((sum, p) => sum + p.overallRating, 0) / recentPerformance.length;
      score += avgPerformance * 0.1;
    }
    
    return score;
  }

  private getRelevantSkills(taskType: string): string[] {
    const skillMap = {
      development: ['frontend', 'backend', 'apis', 'databases'],
      design: ['ui_design', 'ux_design', 'prototyping'],
      testing: ['test_automation', 'manual_testing', 'quality_assurance'],
      documentation: ['technical_writing', 'communication'],
      review: ['code_review', 'quality_assurance'],
      planning: ['project_management', 'agile', 'product_strategy']
    };
    
    return skillMap[taskType as keyof typeof skillMap] || [];
  }

  private estimateTaskWorkload(task: Task): number {
    // Convert estimated hours to workload percentage (assuming 40-hour work week)
    return task.estimatedHours / 40;
  }

  async updateEmotionalState(memberId: string, event: string, context?: any): Promise<void> {
    const member = this.teamMembers.get(memberId);
    if (!member) return;
    
    // Use AI model to predict emotional changes
    if (this.emotionalModel) {
      const inputFeatures = this.encodeEmotionalContext(member, event, context);
      const prediction = this.emotionalModel.predict(inputFeatures) as tf.Tensor;
      const emotionalChanges = await prediction.data();
      
      // Apply predicted changes
      member.emotions.mood = Math.max(-1, Math.min(1, member.emotions.mood + emotionalChanges[0] * 0.1));
      member.emotions.stress = Math.max(0, Math.min(1, member.emotions.stress + emotionalChanges[1] * 0.1));
      member.emotions.motivation = Math.max(0, Math.min(1, member.emotions.motivation + emotionalChanges[2] * 0.1));
      member.emotions.confidence = Math.max(0, Math.min(1, member.emotions.confidence + emotionalChanges[3] * 0.1));
      member.emotions.satisfaction = Math.max(0, Math.min(1, member.emotions.satisfaction + emotionalChanges[4] * 0.1));
      member.emotions.energy = Math.max(0, Math.min(1, member.emotions.energy + emotionalChanges[5] * 0.1));
      member.emotions.lastUpdated = new Date();
      
      prediction.dispose();
    }
    
    this.emit('emotional_state_updated', { memberId, emotions: member.emotions });
  }

  private encodeEmotionalContext(member: AITeamMember, event: string, context?: any): tf.Tensor {
    const features = [
      member.emotions.mood,
      member.emotions.stress,
      member.emotions.motivation,
      member.emotions.confidence,
      member.emotions.satisfaction,
      member.emotions.energy,
      member.workload,
      member.availability,
      member.personality.traits.neuroticism,
      member.personality.traits.extraversion,
      member.personality.traits.agreeableness,
      ...this.encodeEvent(event),
      ...Array(5).fill(0).map(() => Math.random()) // Additional context features
    ];
    
    return tf.tensor2d([features]);
  }

  private encodeEvent(event: string): number[] {
    const eventMap = {
      task_assigned: [1, 0, 0, 0, 0],
      task_completed: [0, 1, 0, 0, 0],
      conflict_occurred: [0, 0, 1, 0, 0],
      praise_received: [0, 0, 0, 1, 0],
      deadline_missed: [0, 0, 0, 0, 1]
    };
    
    return eventMap[event as keyof typeof eventMap] || [0, 0, 0, 0, 0];
  }

  async balanceWorkload(overloadedMemberId?: string): Promise<void> {
    console.log('⚖️ Balancing team workload...');
    
    const members = Array.from(this.teamMembers.values());
    const overloaded = members.filter(m => m.workload > 0.85);
    const underloaded = members.filter(m => m.workload < 0.6);
    
    for (const overloadedMember of overloaded) {
      const tasksToRedistribute = overloadedMember.currentTasks
        .filter(task => task.status === 'not_started')
        .sort((a, b) => a.priority.localeCompare(b.priority));
      
      for (const task of tasksToRedistribute) {
        const bestCandidate = underloaded
          .filter(m => m.workload + this.estimateTaskWorkload(task) <= 0.8)
          .sort((a, b) => this.calculateTaskFitScore(b, task) - this.calculateTaskFitScore(a, task))[0];
        
        if (bestCandidate) {
          // Reassign task
          overloadedMember.currentTasks = overloadedMember.currentTasks.filter(t => t.id !== task.id);
          overloadedMember.workload -= this.estimateTaskWorkload(task);
          
          bestCandidate.currentTasks.push(task);
          bestCandidate.workload += this.estimateTaskWorkload(task);
          
          console.log(`📋 Reassigned task "${task.title}" from ${overloadedMember.name} to ${bestCandidate.name}`);
          this.emit('task_reassigned', { task, from: overloadedMember, to: bestCandidate });
          
          break; // Only reassign one task at a time
        }
      }
    }
  }

  async detectAndResolveConflicts(): Promise<void> {
    console.log('🤝 Detecting and resolving team conflicts...');
    
    const members = Array.from(this.teamMembers.values());
    const conflicts = this.identifyConflicts(members);
    
    for (const conflict of conflicts) {
      await this.resolveConflict(conflict);
    }
  }

  private identifyConflicts(members: AITeamMember[]): any[] {
    const conflicts = [];
    
    for (const member of members) {
      for (const [otherId, relationship] of member.relationships) {
        if (relationship.trust < 0.4 || relationship.communication < 0.4) {
          conflicts.push({
            member1: member.id,
            member2: otherId,
            type: 'trust_communication',
            severity: 1 - Math.min(relationship.trust, relationship.communication)
          });
        }
        
        if (relationship.conflicts.length > 0) {
          const ongoingConflicts = relationship.conflicts.filter(c => c.resolution === 'ongoing');
          if (ongoingConflicts.length > 0) {
            conflicts.push({
              member1: member.id,
              member2: otherId,
              type: 'ongoing_conflict',
              severity: Math.max(...ongoingConflicts.map(c => c.severity))
            });
          }
        }
      }
    }
    
    return conflicts;
  }

  private async resolveConflict(conflict: any): Promise<void> {
    const member1 = this.teamMembers.get(conflict.member1);
    const member2 = this.teamMembers.get(conflict.member2);
    
    if (!member1 || !member2) return;
    
    // Use AI to determine best resolution strategy
    const strategy = await this.selectConflictResolutionStrategy(conflict, member1, member2);
    
    console.log(`🔧 Applying conflict resolution strategy: ${strategy}`);
    
    switch (strategy) {
      case 'mediation':
        await this.mediateConflict(member1, member2);
        break;
      case 'task_separation':
        await this.separateConflictingMembers(member1, member2);
        break;
      case 'team_building':
        await this.scheduleTeamBuilding(member1, member2);
        break;
      case 'skill_development':
        await this.assignCommunicationTraining(member1, member2);
        break;
    }
  }

  private async selectConflictResolutionStrategy(
    conflict: any, 
    member1: AITeamMember, 
    member2: AITeamMember
  ): Promise<string> {
    if (!this.conflictResolver) return 'mediation';
    
    const features = this.encodeConflictContext(conflict, member1, member2);
    const prediction = this.conflictResolver.predict(features) as tf.Tensor;
    const probabilities = await prediction.data();
    
    const strategies = ['mediation', 'task_separation', 'team_building', 'skill_development'];
    const selectedIndex = probabilities.indexOf(Math.max(...Array.from(probabilities)));
    
    prediction.dispose();
    return strategies[selectedIndex];
  }

  private encodeConflictContext(conflict: any, member1: AITeamMember, member2: AITeamMember): tf.Tensor {
    const features = [
      conflict.severity,
      member1.personality.traits.agreeableness,
      member2.personality.traits.agreeableness,
      member1.emotions.stress,
      member2.emotions.stress,
      member1.workload,
      member2.workload,
      ...Array(28).fill(0).map(() => Math.random()) // Additional context features
    ];
    
    return tf.tensor2d([features]);
  }

  private async mediateConflict(member1: AITeamMember, member2: AITeamMember): Promise<void> {
    // Simulate mediation process
    const relationship1 = member1.relationships.get(member2.id)!;
    const relationship2 = member2.relationships.get(member1.id)!;
    
    // Improve relationship metrics through mediation
    relationship1.trust += 0.1;
    relationship1.communication += 0.15;
    relationship2.trust += 0.1;
    relationship2.communication += 0.15;
    
    console.log(`🤝 Mediated conflict between ${member1.name} and ${member2.name}`);
  }

  private async separateConflictingMembers(member1: AITeamMember, member2: AITeamMember): Promise<void> {
    // Reassign tasks to minimize interaction
    console.log(`🔄 Separating ${member1.name} and ${member2.name} into different projects`);
  }

  private async scheduleTeamBuilding(member1: AITeamMember, member2: AITeamMember): Promise<void> {
    // Schedule team building activities
    console.log(`🎯 Scheduling team building for ${member1.name} and ${member2.name}`);
  }

  private async assignCommunicationTraining(member1: AITeamMember, member2: AITeamMember): Promise<void> {
    // Assign communication skill development
    console.log(`📚 Assigning communication training to ${member1.name} and ${member2.name}`);
  }

  private startAutonomousManagement(): void {
    // Run autonomous management cycles
    setInterval(async () => {
      try {
        await this.runManagementCycle();
      } catch (error) {
        console.error('Management cycle failed:', error);
      }
    }, 300000); // Every 5 minutes
  }

  private async runManagementCycle(): Promise<void> {
    console.log('🔄 Running autonomous management cycle...');
    
    // Update team dynamics
    await this.updateTeamDynamics();
    
    // Balance workload
    await this.balanceWorkload();
    
    // Detect and resolve conflicts
    await this.detectAndResolveConflicts();
    
    // Update emotional states
    for (const member of this.teamMembers.values()) {
      await this.updateEmotionalState(member.id, 'daily_update');
    }
    
    // Optimize team composition if needed
    await this.optimizeTeamComposition();
    
    console.log('✅ Management cycle completed');
  }

  private async updateTeamDynamics(): Promise<void> {
    const members = Array.from(this.teamMembers.values());
    
    // Calculate team metrics
    const avgMood = members.reduce((sum, m) => sum + m.emotions.mood, 0) / members.length;
    const avgStress = members.reduce((sum, m) => sum + m.emotions.stress, 0) / members.length;
    const avgWorkload = members.reduce((sum, m) => sum + m.workload, 0) / members.length;
    
    // Update team dynamics
    this.teamDynamics.morale = (avgMood + 1) / 2; // Convert from -1,1 to 0,1
    this.teamDynamics.productivity = Math.max(0.1, 1 - avgStress - (avgWorkload > 0.8 ? 0.3 : 0));
    
    // Calculate communication quality
    let totalCommunication = 0;
    let relationshipCount = 0;
    for (const member of members) {
      for (const relationship of member.relationships.values()) {
        totalCommunication += relationship.communication;
        relationshipCount++;
      }
    }
    this.teamDynamics.communication = relationshipCount > 0 ? totalCommunication / relationshipCount : 0.5;
    
    this.emit('team_dynamics_updated', this.teamDynamics);
  }

  private async optimizeTeamComposition(): Promise<void> {
    // Use AI to suggest team optimizations
    if (!this.teamOptimizer) return;
    
    const currentState = this.encodeTeamState();
    const optimization = this.teamOptimizer.predict(currentState) as tf.Tensor;
    const suggestions = await optimization.data();
    
    // Apply optimizations based on AI suggestions
    // This would include hiring recommendations, role changes, etc.
    
    optimization.dispose();
  }

  private encodeTeamState(): tf.Tensor {
    const members = Array.from(this.teamMembers.values());
    
    const features = [
      this.teamDynamics.cohesion,
      this.teamDynamics.productivity,
      this.teamDynamics.communication,
      this.teamDynamics.innovation,
      this.teamDynamics.morale,
      this.teamDynamics.conflictLevel,
      this.teamDynamics.knowledgeSharing,
      this.teamDynamics.adaptability,
      members.length,
      members.reduce((sum, m) => sum + m.workload, 0) / members.length,
      members.reduce((sum, m) => sum + m.emotions.stress, 0) / members.length,
      ...Array(39).fill(0).map(() => Math.random()) // Additional features
    ];
    
    return tf.tensor2d([features]);
  }

  // Public API
  async getTeamMembers(): Promise<AITeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamDynamics(): Promise<TeamDynamics> {
    return { ...this.teamDynamics };
  }

  async getTeamMember(id: string): Promise<AITeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async addTeamMember(definition: any): Promise<AITeamMember> {
    const member = await this.createTeamMember(definition);
    this.teamMembers.set(member.id, member);
    
    // Initialize relationships with existing members
    for (const existingMember of this.teamMembers.values()) {
      if (existingMember.id !== member.id) {
        const compatibility = this.calculatePersonalityCompatibility(
          member.personality,
          existingMember.personality
        );
        
        const relationship1: RelationshipState = {
          memberId: existingMember.id,
          trust: 0.5,
          respect: 0.6,
          compatibility,
          communication: 0.5,
          collaboration: 0.5,
          conflicts: [],
          positive_interactions: 0,
          negative_interactions: 0
        };
        
        const relationship2: RelationshipState = {
          memberId: member.id,
          trust: 0.5,
          respect: 0.6,
          compatibility,
          communication: 0.5,
          collaboration: 0.5,
          conflicts: [],
          positive_interactions: 0,
          negative_interactions: 0
        };
        
        member.relationships.set(existingMember.id, relationship1);
        existingMember.relationships.set(member.id, relationship2);
      }
    }
    
    console.log(`✅ Added new team member: ${member.name}`);
    this.emit('team_member_added', member);
    
    return member;
  }

  async removeTeamMember(id: string): Promise<boolean> {
    const member = this.teamMembers.get(id);
    if (!member) return false;
    
    // Reassign their tasks
    for (const task of member.currentTasks) {
      await this.assignTask(task);
    }
    
    // Remove relationships
    for (const otherMember of this.teamMembers.values()) {
      otherMember.relationships.delete(id);
    }
    
    this.teamMembers.delete(id);
    
    console.log(`❌ Removed team member: ${member.name}`);
    this.emit('team_member_removed', member);
    
    return true;
  }

  async exportTeamData(): Promise<string> {
    const data = {
      teamMembers: Array.from(this.teamMembers.entries()),
      teamDynamics: this.teamDynamics,
      currentProject: this.currentProject,
      exportedAt: new Date()
    };
    
    return JSON.stringify(data, null, 2);
  }
} 