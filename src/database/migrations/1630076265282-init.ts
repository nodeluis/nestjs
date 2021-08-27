import {MigrationInterface, QueryRunner} from "typeorm";

export class init1630076265282 implements MigrationInterface {
    name = 'init1630076265282'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "rude"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "credential"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "registration"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "rude" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "credential" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "gender" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "dateOfBirth" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "country" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "departament" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "province" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "locality" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "registration" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."united_entity" ADD "schoolCode" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."united_entity" ADD "schoolName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "turn" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "yearOfSchoollarity" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "group" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "group"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "yearOfSchoollarity"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" DROP COLUMN "turn"`);
        await queryRunner.query(`ALTER TABLE "public"."united_entity" DROP COLUMN "schoolName"`);
        await queryRunner.query(`ALTER TABLE "public"."united_entity" DROP COLUMN "schoolCode"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "registration"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "locality"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "province"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "departament"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "gender"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "credential"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "rude"`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "registration" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "dateOfBirth" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "gender" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "credential" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "public"."course_entity" ADD "rude" character varying NOT NULL`);
    }

}
