import {MigrationInterface, QueryRunner} from "typeorm";

export class init1632227840061 implements MigrationInterface {
    name = 'init1632227840061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sendings_entity" ("id" SERIAL NOT NULL, "rude" character varying NOT NULL, "studentId" character varying NOT NULL, "state" boolean NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_cedf4740cbbc347b585ddbdb709" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sendings_entity" ADD CONSTRAINT "FK_ffcc42675095d9912d5a0cf1aa4" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sendings_entity" DROP CONSTRAINT "FK_ffcc42675095d9912d5a0cf1aa4"`);
        await queryRunner.query(`DROP TABLE "sendings_entity"`);
    }

}
