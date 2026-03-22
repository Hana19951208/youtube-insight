// 频道配置
export interface Channel {
  id: string;
  name: string;
  slug: string;
  url: string;
}

export interface ChannelConfig {
  channels: Channel[];
  settings: {
    maxVideosPerChannel: number;
  };
}

// 视频列表项
export interface VideoListItem {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  channelName: string;
  channelSlug: string;
  thumbnailUrl: string;
  duration?: string;
  publishedAt: string;
  analyzedAt: string;
  overviewSummary: string;
  creationValueScore: number;
  insightCount: number;
  hasScript: boolean;
}

// API 响应类型
export interface VideosApiResponse {
  videos: VideoListItem[];
  channels: Array<{
    slug: string;
    name: string;
    videoCount: number;
  }>;
}

// 分析结果完整类型
export interface AnalysisResult {
  meta: {
    videoId: string;
    videoTitle: string;
    videoUrl: string;
    channelId: string;
    channelName: string;
    channelSlug: string;
    thumbnailUrl: string;
    duration: string;
    publishedAt: string;
    analyzedAt: string;
    outputLevel: string;
  };
  overview: {
    oneSentenceSummary: string;
    coreInsightsSummary: string | string[];
    targetAudience: string;
    creationValue: {
      score: number;
      reason: string;
    };
  };
  guest: {
    name: string;
    title: string;
    uniqueness: string;
    potentialBias: string[];
    readingAdvice: string;
  };
  insights: Array<{
    id: string;
    title: string;
    timeRange?: {
      start: string;
      end: string;
    };
    coreArgument: string;
    evidences: Array<{
      type: 'data' | 'case' | 'quote' | 'analogy' | 'logic';
      content: string;
    }>;
    goldenQuote?: {
      original: string;
      translation?: string;
      timestamp?: string;
    };
    plainExplanation: string;
    conceptExplanations?: Array<{
      term: string;
      explanation: string;
    }>;
  }>;
  glossary: Array<{
    term: string;
    originalTerm?: string;
    context: string;
    explanation: string;
  }>;
  insightRelations: {
    causalChains: Array<{
      from: string;
      relation: string;
      to: string;
    }>;
    parallels: Array<{
      insights: string[];
      description: string;
    }>;
    dependencies: Array<{
      insight: string;
      dependsOn: string;
    }>;
    narrativeSummary: string;
  };
  goldenQuotes: Array<{
    quote: string;
    timestamp?: string;
    context: string;
    useCase: string;
  }>;
  qualityAssessment: {
    dimensions: {
      informationDensity: { score: number; note: string };
      uniqueness: { score: number; note: string };
      evidenceStrength: { score: number; note: string };
      accessibilityScore: { score: number; note: string };
      creationValue: { score: number; note: string };
    };
    overallRecommendation: string;
    topInsightsToExpand: Array<{
      insightId: string;
      reason: string;
    }>;
  };
  scriptStructure?: {
    meta?: {
      narrativeFramework: string;
      coreHook: string;
      uniqueAngle: string;
      targetDuration: string;
      difficulty: string;
    };
    titles?: {
      recommended: string;
      options: Array<{
        title: string;
        type: string;
        strength: string;
        risk?: string;
      }>;
    };
    opening?: {
      type: string;
      hook: string;
      avoidCliche: string;
      emotionGoal: string;
      duration: string;
    };
    structure: Array<{
      order: number;
      section: string;
      purpose: string;
      keyPoints: string[];
      supportingElements?: {
        data?: string;
        example?: string;
        analogy?: string;
      };
      quotesToUse: string[];
      transition: string;
      emotionCurve: string;
      pacing: string;
      duration: string;
    }>;
    closing?: {
      elevation: string;
      callToAction: string;
      memorableEnd: string;
      emotionGoal: string;
    };
    fullScript?: {
      totalWordCount: number;
      estimatedDuration: string;
      sections: Array<{
        sectionTitle: string;
        lines: string[];
        visualCues: string[];
        duration: string;
      }>;
    };
  };
}

export interface VideoDetailApiResponse {
  analysis: AnalysisResult;
}
