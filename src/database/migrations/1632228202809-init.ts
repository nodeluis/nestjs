import {MigrationInterface, QueryRunner} from "typeorm";

export class init1632228202809 implements MigrationInterface {
    name = 'init1632228202809'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD "sendId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" ADD CONSTRAINT "FK_53213c2de520357126f335a759e" FOREIGN KEY ("sendId") REFERENCES "sendings_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP CONSTRAINT "FK_53213c2de520357126f335a759e"`);
        await queryRunner.query(`ALTER TABLE "public"."student_entity" DROP COLUMN "sendId"`);
    }

}
