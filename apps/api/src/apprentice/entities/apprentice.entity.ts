import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Apprentice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column('simple-array')
  skills: string[];

  @Column({ default: 1000 })
  budget: number; // Token budget

  @Column({ default: 60000 })
  timeout: number; // Execution timeout in milliseconds

  @Column({ default: 'auto' })
  reviewMode: 'auto' | 'manual';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUsed: Date;
}
