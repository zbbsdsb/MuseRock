import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type ApiProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

@Entity('api_keys')
@Index(['userId', 'provider'], { unique: true })
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: ['gemini', 'openai', 'anthropic', 'custom'],
  })
  provider: ApiProvider;

  @Column({ type: 'text' })
  encryptedKey: string;

  @Column()
  iv: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastUsedAt: Date;
}