import {MigrationInterface, QueryRunner} from "typeorm";

export class init1630076573764 implements MigrationInterface {
    name = 'init1630076573764'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "yearOfSchoollarity"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "yearOfSchoollarity" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "yearOfSchoollarity"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "yearOfSchoollarity" character varying NOT NULL`);
    }

}
