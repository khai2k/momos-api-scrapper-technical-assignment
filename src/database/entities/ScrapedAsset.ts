import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ScrapedPage } from './ScrapedPage';

@Entity('scraped_assets')
export class ScrapedAsset {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 500 })
  asset_url!: string;

  @Column({ type: 'varchar', length: 50 })
  asset_type!: string; // 'image' or 'video'

  @Column({ type: 'varchar', length: 255, nullable: true })
  alt_text!: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'int' })
  scraped_page_id!: number;

  @ManyToOne(() => ScrapedPage, page => page.assets)
  @JoinColumn({ name: 'scraped_page_id' })
  scrapedPage!: ScrapedPage;
}
