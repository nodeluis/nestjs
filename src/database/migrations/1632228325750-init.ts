import {MigrationInterface, QueryRunner} from "typeorm";

export class init1632228325750 implements MigrationInterface {
    name = 'init1632228325750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."sendings_entity" DROP COLUMN "studentId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."sendings_entity" ADD "studentId" character varying NOT NULL`);
    }

}
