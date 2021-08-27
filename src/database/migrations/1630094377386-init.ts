import {MigrationInterface, QueryRunner} from "typeorm";

export class init1630094377386 implements MigrationInterface {
    name = 'init1630094377386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "asignated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "public"."user_entity" ADD "courseId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."user_entity" ADD CONSTRAINT "UQ_bec04a9f2a9fc17d4feab01963e" UNIQUE ("courseId")`);
        await queryRunner.query(`ALTER TABLE "public"."user_entity" ADD CONSTRAINT "FK_bec04a9f2a9fc17d4feab01963e" FOREIGN KEY ("courseId") REFERENCES "course_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."user_entity" DROP CONSTRAINT "FK_bec04a9f2a9fc17d4feab01963e"`);
        await queryRunner.query(`ALTER TABLE "public"."user_entity" DROP CONSTRAINT "UQ_bec04a9f2a9fc17d4feab01963e"`);
        await queryRunner.query(`ALTER TABLE "public"."user_entity" DROP COLUMN "courseId"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "asignated"`);
    }

}
