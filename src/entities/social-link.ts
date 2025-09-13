import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  CreateDateColumn,
  Unique,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { IdCard } from './id-card';

@Entity()
// @Unique(['card', 'platform']) // Prevent same platform for same card
export class SocialLink {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @ManyToOne(() => User, (user) => user.socialLinks, { onDelete: 'CASCADE' })
  // user?: User;
  @JoinColumn({ name: 'card_id' })
  @ManyToOne(() => IdCard, (card) => card.socialLinks, { onDelete: 'CASCADE' })
  card?: IdCard;

  @Column()
  platform?: string; // e.g., Twitter, GitHub, LinkedIn

  @Column()
  url?: string;

  @Column()
  icon?: string;

  @Column({ default: false })
  is_deleted?: boolean;

  @UpdateDateColumn()
  updated_at?: Date;

  @CreateDateColumn()
  created_at?: Date;

  // @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
  // deletedAt?: Date;
}
