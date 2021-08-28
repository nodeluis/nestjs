import {MigrationInterface, QueryRunner} from "typeorm";

export class init1630161296664 implements MigrationInterface {
    name = 'init1630161296664'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "paid" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "paid"`);
    }

}
