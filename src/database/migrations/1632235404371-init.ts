import {MigrationInterface, QueryRunner} from "typeorm";

export class init1632235404371 implements MigrationInterface {
    name = 'init1632235404371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."sendings_entity" RENAME COLUMN "state" TO "stateStudent"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."sendings_entity" RENAME COLUMN "stateStudent" TO "state"`);
    }

}
