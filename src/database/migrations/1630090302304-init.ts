import {MigrationInterface, QueryRunner} from "typeorm";

export class init1630090302304 implements MigrationInterface {
    name = 'init1630090302304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "dateOfBirth" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "dateOfBirth" TIMESTAMP NOT NULL`);
    }

}
