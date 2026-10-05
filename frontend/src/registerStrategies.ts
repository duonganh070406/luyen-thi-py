import { QuestionRegistry } from './strategies/QuestionStrategy.ts';
import { SingleChoiceStrategy } from './strategies/SingleChoiceStrategy.tsx';
import { MultiChoiceStrategy } from './strategies/MultiChoiceStrategy.tsx';
import { ShortAnswerStrategy } from './strategies/ShortAnswerStrategy.tsx';
import { EssayStrategy } from './strategies/EssayStrategy.tsx';
import { MatchingStrategy } from './strategies/MatchingStrategy.tsx';

QuestionRegistry.register(SingleChoiceStrategy);
QuestionRegistry.register(MultiChoiceStrategy);
QuestionRegistry.register(ShortAnswerStrategy);
QuestionRegistry.register(EssayStrategy);
QuestionRegistry.register(MatchingStrategy);
