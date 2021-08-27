import {MigrationInterface, QueryRunner} from "typeorm";

export class init1629983276260 implements MigrationInterface {
    name = 'init1629983276260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "student_entity" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "courseId" integer, CONSTRAINT "PK_fca1c1cc9adc7aea54a40e70e88" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "united_entity" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1436f2a7dbc99bae06aae11466c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course_entity" ("id" SERIAL NOT NULL, "rude" character varying NOT NULL, "credential" character varying NOT NULL, "name" character varying NOT NULL, "gender" character varying NOT NULL, "dateOfBirth" TIMESTAMP NOT NULL, "registration" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "unitedId" integer, CONSTRAINT "PK_9fcfc62edbcd9339ddd4a026e9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "student_entity" ADD CONSTRAINT "FK_5c7ca74255a88548a52c5e51cfd" FOREIGN KEY ("courseId") REFERENCES "course_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_entity" ADD CONSTRAINT "FK_dfb3b16c867c91cdf0162891ae2" FOREIGN KEY ("unitedId") REFERENCES "united_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_entity" DROP CONSTRAINT "FK_dfb3b16c867c91cdf0162891ae2"`);
        await queryRunner.query(`ALTER TABLE "student_entity" DROP CONSTRAINT "FK_5c7ca74255a88548a52c5e51cfd"`);
        await queryRunner.query(`DROP TABLE "course_entity"`);
        await queryRunner.query(`DROP TABLE "united_entity"`);
        await queryRunner.query(`DROP TABLE "student_entity"`);
    }

}
