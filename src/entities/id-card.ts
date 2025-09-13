import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from './user';
import { Gender } from '@/enum';
import { SocialLink } from './social-link';
import { CardType } from '@/enum/card-type-enum';

@Entity()
export class IdCard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @OneToOne(() => User, (user) => user.idCard)
  // @JoinColumn()
  // user?: User;
  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, (user) => user.idCard, { onDelete: 'CASCADE' })
  user?: User;

  @Column({
    type: 'enum',
    enum: Gender,
    default: Gender.OTHER,
  })
  gender?: string;

  @Column()
  dob?: Date;

  @Column()
  address?: string;

  @Column()
  phone?: string;

  @Column({ default: 'UnKnown' })
  job?: string;

  @Column({ default: 'UnKnown' })
  bio?: string;

  @Column({ default: 'UnKnown' })
  web_site?: string;

  @Column({ default: 'UnKnown' })
  company?: string;

  @Column()
  nationality?: string;

  @Column({ nullable: true })
  qr_url?: string;

  @Column({ nullable: true })
  qr_code?: string;

  @Column({
    type: 'enum',
    enum: CardType,
    array: false,
    default: [CardType.MODERN],
  })
  card_type?: CardType;

  @Column({ default: true })
  is_active?: boolean;

  @Column({ default: false })
  is_deleted?: boolean;

  @Column({ nullable: true })
  theme_color?: string;

  @OneToMany(() => SocialLink, (link) => link.card)
  socialLinks?: SocialLink[];

  @UpdateDateColumn()
  updated_at?: Date;

  @CreateDateColumn()
  created_at?: Date;
}
