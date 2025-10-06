import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDb1759753190972 implements MigrationInterface {
    name = 'InitDb1759753190972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "scraped_assets" ("id" SERIAL NOT NULL, "asset_url" character varying(500) NOT NULL, "asset_type" character varying(50) NOT NULL, "alt_text" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "scraped_page_id" integer NOT NULL, CONSTRAINT "PK_50a149ed7174607ae2315036a9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "scraped_pages" ("id" SERIAL NOT NULL, "url" character varying(500) NOT NULL, "title" character varying(255), "description" text, "success" boolean NOT NULL DEFAULT true, "error_message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_73d4c064c14d82edfe131010190" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "scraped_assets" ADD CONSTRAINT "FK_3407855289d5acc0c05a0401d08" FOREIGN KEY ("scraped_page_id") REFERENCES "scraped_pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scraped_assets" DROP CONSTRAINT "FK_3407855289d5acc0c05a0401d08"`);
        await queryRunner.query(`DROP TABLE "scraped_pages"`);
        await queryRunner.query(`DROP TABLE "scraped_assets"`);
    }

}
