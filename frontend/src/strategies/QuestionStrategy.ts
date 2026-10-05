import React from 'react';
import { Question } from '../types.ts';

export interface RenderInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export interface RenderReviewProps {
  question: Question;
  userAnswer: any;
  isCorrect: boolean;
  feedback?: string;
}

export interface QuestionStrategy {
  type: string;
  hasAnswer(value: any, question: Question): boolean;
  isCorrect(value: any, question: Question): boolean;
  renderInput(props: RenderInputProps): React.ReactNode;
  renderReview(props: RenderReviewProps): React.ReactNode;
}

export class QuestionRegistry {
  private static strategies = new Map<string, QuestionStrategy>();

  public static register(strategy: QuestionStrategy) {
    this.strategies.set(strategy.type, strategy);
  }

  public static get(type: string): QuestionStrategy | undefined {
    return this.strategies.get(type);
  }

  public static getAll(): QuestionStrategy[] {
    return Array.from(this.strategies.values());
  }
}
