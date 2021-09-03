import {MigrationInterface, QueryRunner} from "typeorm";

export class init1630699004131 implements MigrationInterface {
    name = 'init1630699004131'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "credential"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "departament"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "yearOfSchoollarity"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "identification" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "pdfNumber" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "department" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."united_entity" ADD "year" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "grade" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "level" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "level"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "grade"`);
        await queryRunner.query(`ALTER TABLE "public"."united_entity" DROP COLUMN "year"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "department"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "pdfNumber"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "identification"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "yearOfSchoollarity" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "departament" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "credential" character varying NOT NULL`);
    }

}
