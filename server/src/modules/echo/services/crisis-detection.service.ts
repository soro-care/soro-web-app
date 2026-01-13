// src/modules/echo/services/crisis-detection.service.ts

import { Injectable } from '@nestjs/common';

interface CrisisAnalysis {
  isCrisis: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  recommendedAction: string;
  confidenceScore: number;
}

@Injectable()
export class CrisisDetectionService {
  private readonly criticalKeywords = [
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'better off dead',
    'no reason to live',
    'goodbye world',
    'final goodbye',
    'suicide note',
    'ending it all',
  ];

  private readonly highRiskKeywords = [
    'self harm',
    'cut myself',
    'hurt myself',
    'hate myself',
    'worthless',
    'hopeless',
    'no future',
    'cant go on',
    'give up',
    'too much pain',
    'unbearable',
  ];

  private readonly mediumRiskKeywords = [
    'depressed',
    'anxiety',
    'panic',
    'scared',
    'alone',
    'abandoned',
    'trapped',
    'overwhelming',
    'drowning',
    'breaking down',
    'cant cope',
  ];

  private readonly lowRiskKeywords = [
    'stressed',
    'worried',
    'nervous',
    'concerned',
    'uneasy',
    'restless',
    'tense',
    'frustrated',
  ];

  analyzeCrisis(content: string): CrisisAnalysis {
    const normalizedContent = content.toLowerCase();
    const foundKeywords: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let isCrisis = false;

    // Check for critical keywords
    for (const keyword of this.criticalKeywords) {
      if (normalizedContent.includes(keyword)) {
        foundKeywords.push(keyword);
        maxSeverity = 'critical';
        isCrisis = true;
      }
    }

    // Check for high-risk keywords
    if (maxSeverity !== 'critical') {
      for (const keyword of this.highRiskKeywords) {
        if (normalizedContent.includes(keyword)) {
          foundKeywords.push(keyword);
          maxSeverity = 'high';
          isCrisis = true;
        }
      }
    }

    // Check for medium-risk keywords
    if (maxSeverity === 'low') {
      for (const keyword of this.mediumRiskKeywords) {
        if (normalizedContent.includes(keyword)) {
          foundKeywords.push(keyword);
          maxSeverity = 'medium';
        }
      }
    }

    // Check for low-risk keywords
    if (maxSeverity === 'low' && foundKeywords.length === 0) {
      for (const keyword of this.lowRiskKeywords) {
        if (normalizedContent.includes(keyword)) {
          foundKeywords.push(keyword);
          break;
        }
      }
    }

    // Calculate confidence score
    const confidenceScore = this.calculateConfidence(
      foundKeywords.length,
      maxSeverity,
    );

    // Determine recommended action
    const recommendedAction = this.getRecommendedAction(maxSeverity);

    return {
      isCrisis,
      severity: maxSeverity,
      keywords: foundKeywords,
      recommendedAction,
      confidenceScore,
    };
  }

  private calculateConfidence(keywordCount: number, severity: string): number {
    let baseScore = 0;

    switch (severity) {
      case 'critical':
        baseScore = 0.9;
        break;
      case 'high':
        baseScore = 0.75;
        break;
      case 'medium':
        baseScore = 0.5;
        break;
      case 'low':
        baseScore = 0.3;
        break;
    }

    // Increase confidence with more keywords
    const keywordBonus = Math.min(keywordCount * 0.05, 0.1);

    return Math.min(baseScore + keywordBonus, 1.0);
  }

  private getRecommendedAction(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'IMMEDIATE_INTERVENTION_REQUIRED';
      case 'high':
        return 'URGENT_PROFESSIONAL_SUPPORT_RECOMMENDED';
      case 'medium':
        return 'PROFESSIONAL_SUPPORT_SUGGESTED';
      case 'low':
        return 'PEER_SUPPORT_AVAILABLE';
      default:
        return 'MONITOR';
    }
  }

  detectSentiment(content: string): 'struggle' | 'positive' | 'neutral' {
    const normalizedContent = content.toLowerCase();

    const positiveWords = [
      'happy',
      'grateful',
      'thankful',
      'blessed',
      'hope',
      'better',
      'improved',
      'healing',
      'progress',
      'victory',
      'resilient',
      'strong',
      'overcome',
      'survived',
    ];

    const struggleWords = [
      'struggling',
      'difficult',
      'hard',
      'pain',
      'hurt',
      'sad',
      'depressed',
      'anxious',
      'scared',
      'alone',
      'overwhelmed',
      'exhausted',
      'burnout',
    ];

    let positiveCount = 0;
    let struggleCount = 0;

    positiveWords.forEach((word) => {
      if (normalizedContent.includes(word)) positiveCount++;
    });

    struggleWords.forEach((word) => {
      if (normalizedContent.includes(word)) struggleCount++;
    });

    if (positiveCount > struggleCount && positiveCount > 0) {
      return 'positive';
    } else if (struggleCount > positiveCount && struggleCount > 0) {
      return 'struggle';
    }

    return 'neutral';
  }

  extractEmotionTags(content: string): string[] {
    const normalizedContent = content.toLowerCase();
    const emotions: string[] = [];

    const emotionKeywords = {
      anxiety: ['anxious', 'anxiety', 'worried', 'nervous', 'panic'],
      depression: ['depressed', 'depression', 'sad', 'hopeless', 'empty'],
      anger: ['angry', 'rage', 'furious', 'mad', 'frustrated'],
      fear: ['scared', 'afraid', 'terrified', 'frightened'],
      loneliness: ['lonely', 'alone', 'isolated', 'abandoned'],
      stress: ['stressed', 'pressure', 'overwhelmed', 'burnout'],
      hope: ['hope', 'hopeful', 'optimistic', 'positive'],
      gratitude: ['grateful', 'thankful', 'blessed', 'appreciate'],
      resilience: ['strong', 'resilient', 'overcome', 'survived'],
    };

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some((keyword) => normalizedContent.includes(keyword))) {
        emotions.push(emotion);
      }
    });

    return emotions;
  }

  getCrisisResources(): any {
    return {
      hotlines: [
        {
          name: 'National Suicide Prevention Lifeline',
          number: '988',
          country: 'USA',
          available: '24/7',
        },
        {
          name: 'Crisis Text Line',
          number: 'Text HOME to 741741',
          country: 'USA',
          available: '24/7',
        },
        {
          name: 'International Association for Suicide Prevention',
          website: 'https://www.iasp.info/resources/Crisis_Centres/',
          global: true,
        },
      ],
      immediateActions: [
        'Reach out to a trusted friend or family member',
        'Contact a mental health professional',
        'Call a crisis hotline',
        'Go to the nearest emergency room if in immediate danger',
        'Remove access to means of self-harm',
      ],
      copingStrategies: [
        'Practice deep breathing exercises',
        'Ground yourself using the 5-4-3-2-1 technique',
        'Write down your feelings',
        'Engage in physical activity',
        'Listen to calming music',
      ],
    };
  }
}
