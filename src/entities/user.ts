import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { IdCard } from './id-card';
import { SocialLink } from './social-link';
import { Favorite } from './favorite';
import { Device } from './device';
import { UserRole } from '@/enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  full_name!: string;

  @Column({ unique: true })
  user_name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true }) // <-- Add this
cover_image?: string;

  @Column({ default: false })
  is_deleted?: boolean;

  @Column({ default: true })
  is_active?: boolean;

  // @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  // role?: UserRole;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.USER],
  })
  roles?: UserRole[];

  @CreateDateColumn()
  created_at?: Date;

  @CreateDateColumn()
  updated_at?: Date;

  @OneToMany(() => Device, (device) => device.user)
  devices?: Device[];

  @OneToMany(() => IdCard, (idCard) => idCard.user, { cascade: true })
  idCard?: IdCard[];

  // @OneToMany(() => SocialLink, (link) => link.user)
  // socialLinks?: SocialLink[];

  @OneToMany(() => Favorite, (fav) => fav.user)
  favorites?: Favorite[];

  // @OneToMany(() => Favorite, (fav) => fav.favoriteUser)
  // favoritedBy?: Favorite[];
}
