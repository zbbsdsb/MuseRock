import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type ApiProvider = 'gemini' | 'openai' | 'anthropic' | 'custom' | 'deo' | 'dia';

export interface ModelParameters {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['gemini', 'openai', 'anthropic', 'custom', 'deo', 'dia'],
  })
  provider: ApiProvider;

  @Column({ type: 'text' })
  encryptedKey: string;

  @Column()
  iv: string;

  @Column({ type: 'text', nullable: true })
  endpoint: string;

  @Column({ type: 'json', nullable: true })
  modelParameters: ModelParameters;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  displayName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastUsedAt: Date;

  @Column({ nullable: true })
  lastTestedAt: Date;

  @Column({ default: false })
  isTested: boolean;

  @Column({ default: false })
  testSuccess: boolean;
}
