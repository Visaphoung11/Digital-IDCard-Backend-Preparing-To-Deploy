import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { User } from './user';

@Entity()
@Unique([
  'user',
  // 'favoriteUser'
])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  user?: User;

  // @ManyToOne(() => User, (user) => user.favoritedBy, { onDelete: 'CASCADE' })
  // favoriteUser?: User;

  @CreateDateColumn()
  created_at?: Date;

  @Column({ default: false })
  is_deleted?: boolean;

  @UpdateDateColumn()
  updated_at?: Date;
}
