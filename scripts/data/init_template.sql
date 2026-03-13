CREATE TABLE IF NOT EXISTS "assets" (
  "customer_name" varchar,
  "market_segment" varchar,
  "project_id" bigint,
  "asset_type" varchar NOT NULL,
  PRIMARY KEY ("customer_name", "market_segment", "project_id")
);

CREATE TABLE IF NOT EXISTS "projects" (
  "id" bigserial PRIMARY KEY,
  "project_name" varchar UNIQUE NOT NULL,
  "ref_code" varchar,
  "department_id" bigint,
  "activity" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "records" (
  "id" bigserial PRIMARY KEY,
  "user_id" bigint,
  "project_id" bigint,
  "work_package_id" bigint,
  "task_id" bigint,
  "subtask_id" bigint,
  "date" date NOT NULL,
  "working_hours" float8 NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" bigserial PRIMARY KEY,
  "user_name" varchar UNIQUE NOT NULL,
  "department_id" bigint,
  "position" varchar NOT NULL,
  "note" varchar
);

CREATE TABLE IF NOT EXISTS "work_packages" (
  "id" bigserial PRIMARY KEY,
  "project_id" bigint,
  "work_package_name" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "tasks" (
  "id" bigserial PRIMARY KEY,
  "work_package_id" bigint,
  "task_name" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "subtasks" (
  "id" bigserial PRIMARY KEY,
  "task_id" bigint,
  "subtask_name" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "departments" (
  "id" bigserial PRIMARY KEY,
  "department_name" varchar UNIQUE NOT NULL
);

ALTER TABLE "assets" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "projects" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("id");

ALTER TABLE "records" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "records" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "users" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("id");

ALTER TABLE "work_packages" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("work_package_id") REFERENCES "work_packages" ("id");

ALTER TABLE "subtasks" ADD FOREIGN KEY ("task_id") REFERENCES "tasks" ("id");

INSERT INTO departments (id, department_name) VALUES
  (1, 'Showcase'),
  (2, 'Production'),
  (3, 'Sales'),
  (4, 'Marketing'),
  (5, 'Training & Support'),
  (6, 'Development'),
  (7, '');

SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"departments"', 'id')), (SELECT (MAX("id") + 1) FROM "departments"), FALSE);

