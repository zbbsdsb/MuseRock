import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Apprentice } from './apprentice.entity';

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Apprentice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'apprenticeId' })
  apprentice: Apprentice;

  @Column()
  apprenticeId: string;

  @Column()
  task: string;

  @Column('jsonb')
  parameters: Record<string, any>;

  @Column({ default: 'pending' })
  status: 'pending' | 'in_progress' | 'completed' | 'failed';

  @Column('jsonb', { nullable: true })
  result?: any;

  @Column({ nullable: true })
  error?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  startedAt?: Date;

  @UpdateDateColumn({ nullable: true })
  completedAt?: Date;

  @Column({ default: 0 })
  tokensUsed: number;
}
