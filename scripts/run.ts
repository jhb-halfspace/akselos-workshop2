const fs = require("fs");
const csv = require("fast-csv");
const { writeFile, appendFile, copyFile } = require("fs").promises;

const parseCsv = (filename: string): Promise<any[]> =>
  new Promise((resolve, reject) => {
    const data: any[] = [];
    fs.createReadStream(filename)
      .pipe(csv.parse({ headers: true }))
      .on("error", reject)
      .on("data", (row: any) => data.push(row))
      .on("end", async () => {
        resolve(data);
      });
  });

(async () => {
  //// Edit ytd.csv
  let data = await parseCsv("./data/raw_ytd.csv");
  let outputFileName = "data/ytd.csv";
  const cutOffIndex = data.findIndex((d) => d["PROJECT"] === "TOTAL");
  data = data.slice(0, cutOffIndex);
  await writeCSV(
    outputFileName,
    `CUSTOMER,MARKET SEGMENT,ASSET TYPE,PROJECT,REF CODE,DEPARTMENT,ACTIVITIES\n`
  );
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    await appendFile(
      outputFileName,
      `${datum["CUSTOMER"]},${datum["MARKET SEGMENT"]},${
        datum["ASSET TYPE"]
      },${datum["PROJECT"]},${datum["REF CODE"]},${
        datum["DEPARTMENT"]
      },${datum["ACTIVITIES"]}${i === data.length - 1 ? "" : "\n"}`
    );
  }

  //// Make departmentMap
  data = await parseCsv("./data/departments.csv");
  const departmentMap: any = {};
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    departmentMap[datum["department_name"].toLowerCase()] = datum.id;
  }

  //// Write users.sql
  const initSql = "output/init.sql";
  await copyFile(`./data/init_template.sql`, initSql);
  data = await parseCsv("./data/employee_entry.csv");
  outputFileName = "output/users.sql";

  await writeCSV(
    outputFileName,
    `INSERT INTO users (id, user_name, department_id, position, note) VALUES\n`
  );
  await appendFile(
    initSql,
    `INSERT INTO users (id, user_name, department_id, position, note) VALUES\n`
  );

  for (let i = 0; i < data.length; i++) {
    const name = data[i]["NAME"];
    const department = data[i]["DEPARTMENT"];
    const level = data[i]["LEVEL"];
    const note = data[i]["NOTE"];

    await appendFile(
      outputFileName,
      `  (${i + 1}, '${name}', ${
        departmentMap[department.toLowerCase()]
      }, '${level}', '${note}')${i === data.length - 1 ? ";\n\n" : ",\n"}`
    );
    await appendFile(
      initSql,
      `  (${i + 1}, '${name}', ${
        departmentMap[department.toLowerCase()]
      }, '${level}', '${note}')${i === data.length - 1 ? ";\n\n" : ",\n"}`
    );
  }

  //// Write projects.sql
  data = await parseCsv("./data/ytd.csv");
  outputFileName = "output/projects.sql";
  let projectsCsv = "data/projects.csv";
  await writeCSV(
    outputFileName,
    `INSERT INTO projects (id, project_name, ref_code, department_id, activity) VALUES\n`
  );
  await appendFile(
    initSql,
    `INSERT INTO projects (id, project_name, ref_code, department_id, activity) VALUES\n`
  );
  await writeCSV(
    projectsCsv,
    `id,project_name,ref_code,department_id,activity\n`
  );

  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    await appendFile(
      outputFileName,
      `  (${i + 1}, '${datum["PROJECT"]}', '${datum["REF CODE"]}', '${
        departmentMap[datum["DEPARTMENT"].toLowerCase()]
      }', '${datum["ACTIVITIES"]}')${i === data.length - 1 ? ";\n\n" : ",\n"}`
    );
    await appendFile(
      initSql,
      `  (${i + 1}, '${datum["PROJECT"]}', '${datum["REF CODE"]}', '${
        departmentMap[datum["DEPARTMENT"].toLowerCase()]
      }', '${datum["ACTIVITIES"]}')${i === data.length - 1 ? ";\n\n" : ",\n"}`
    );
    await appendFile(
      projectsCsv,
      `${i + 1},${datum["PROJECT"]},${datum["REF CODE"]},${
        departmentMap[datum["DEPARTMENT"].toLowerCase()]
      },${datum["ACTIVITIES"]}${i === data.length - 1 ? "" : "\n"}`
    );
  }

  //// Make projectMap
  data = await parseCsv("./data/projects.csv");
  const projectMap: any = {};
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    projectMap[datum["project_name"].toLowerCase()] = datum.id;
  }
  // console.log(projectMap);

  //// Write assets.sql
  data = await parseCsv("./data/ytd.csv");
  outputFileName = "output/assets.sql";
  await writeCSV(
    outputFileName,
    `INSERT INTO assets (customer_name, market_segment, project_id, asset_type) VALUES\n`
  );
  await appendFile(
    initSql,
    `INSERT INTO assets (customer_name, market_segment, project_id, asset_type) VALUES\n`
  );

  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    await appendFile(
      outputFileName,
      `  ('${datum["CUSTOMER"]}', '${datum["MARKET SEGMENT"]}', ${
        projectMap[datum["PROJECT"].toLowerCase()]
      }, '${datum["ASSET TYPE"]}')${i === data.length - 1 ? ";\n\n" : ",\n"}`
    );
    await appendFile(
      initSql,
      `  ('${datum["CUSTOMER"]}', '${datum["MARKET SEGMENT"]}', ${
        projectMap[datum["PROJECT"].toLowerCase()]
      }, '${datum["ASSET TYPE"]}')${i === data.length - 1 ? ";\n\n" : ",\n"}`
    );
  }

  //// Write work_packages.sql
  data = await parseCsv("./data/timerecord.csv");
  outputFileName = "output/work_packages.sql";
  let workPackageCsv = "data/workPackage.csv";

  await writeCSV(
    outputFileName,
    `INSERT INTO work_packages (id, project_id, work_package_name) VALUES\n`
  );
  await appendFile(
    initSql,
    `INSERT INTO work_packages (id, project_id, work_package_name) VALUES\n`
  );
  await writeCSV(workPackageCsv, `id,work_package_name\n`);

  const workPackageTracker = [];

  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    workPackageTracker.push(
      `${projectMap[datum.PROJECT.toLowerCase()]}___${datum["WORK PACKAGE"]}`
    );
  }
  const workPackageTracker2 = removeDuplicates(workPackageTracker);
  const workPackages = workPackageTracker2.map((w) => {
    const wSplitted = w.split("___");
    const id = wSplitted[0];
    const package = wSplitted[1];
    return { [id]: package };
  });
  // console.log(workPackages);

  for (let i = 0; i < workPackages.length; i++) {
    const projectId = Object.keys(workPackages[i]);
    const workPackage = Object.values(workPackages[i]);

    await appendFile(
      outputFileName,
      `  (${i + 1}, ${
        projectId /** need to add project id for undefined's */
      }, '${workPackage}')${i === workPackages.length - 1 ? ";\n\n" : ",\n"}`
    );
    await appendFile(
      initSql,
      `  (${i + 1}, ${projectId}, '${workPackage}')${
        i === workPackages.length - 1 ? ";\n\n" : ",\n"
      }`
    );
    await appendFile(
      workPackageCsv,
      `${i + 1},${workPackage}${i === workPackages.length - 1 ? "" : "\n"}`
    );
  }

  //// Make userMap
  data = await parseCsv("./data/employee_entry.csv");
  const userMap: any = {};
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    userMap[datum["NAME"]] = i + 1;
  }

  //// Make workPackageMap
  data = await parseCsv("./data/workPackage.csv");
  const workPackageMap: any = {};
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    workPackageMap[datum.work_package_name] = datum.id;
  }

  //// Write records.sql
  data = await parseCsv("./data/timerecord.csv");
  outputFileName = "output/records.sql";
  await writeCSV(
    outputFileName,
    `INSERT INTO records (id, user_id, project_id, work_package_id, task_id, subtask_id, date, working_hours) VALUES\n`
  );
  await appendFile(
    initSql,
    `INSERT INTO records (id, user_id, project_id, work_package_id, task_id, subtask_id, date, working_hours) VALUES\n`
  );
  // console.log(userMap);

  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    await appendFile(
      outputFileName,
      `  (${i + 1}, ${userMap[datum.NAME]}, ${
        projectMap[datum["PROJECT"].toLowerCase()]
      }, ${workPackageMap[datum["WORK PACKAGE"]]}, 0, 0, TO_DATE('${
        datum.DATE
      }', 'DD/MM/YYYY'), ${datum["WORKING HOURS"]})${
        i === data.length - 1 ? ";\n\n" : ",\n"
      }`
    );
    await appendFile(
      initSql,
      `  (${i + 1}, ${userMap[datum.NAME]}, ${
        projectMap[datum["PROJECT"].toLowerCase()]
      }, ${workPackageMap[datum["WORK PACKAGE"]]}, 0, 0, TO_DATE('${
        datum.DATE
      }', 'DD/MM/YYYY'), ${datum["WORKING HOURS"]})${
        i === data.length - 1 ? ";\n\n" : ",\n"
      }`
    );
  }

  await appendFile(
    initSql,
    `SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"users"', 'id')), (SELECT (MAX("id") + 1) FROM "users"), FALSE);\n`
  );
  await appendFile(
    initSql,
    `SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"projects"', 'id')), (SELECT (MAX("id") + 1) FROM "projects"), FALSE);\n`
  );
  await appendFile(
    initSql,
    `SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"work_packages"', 'id')), (SELECT (MAX("id") + 1) FROM "work_packages"), FALSE);\n`
  );
  await appendFile(
    initSql,
    `SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"tasks"', 'id')), (SELECT (MAX("id") + 1) FROM "tasks"), FALSE);\n`
  );
  await appendFile(
    initSql,
    `SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"subtasks"', 'id')), (SELECT (MAX("id") + 1) FROM "subtasks"), FALSE);\n`
  );
  await appendFile(
    initSql,
    `SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"records"', 'id')), (SELECT (MAX("id") + 1) FROM "records"), FALSE);\n`
  );
})();

const removeDuplicates = (arr: string[]) => {
  return [...new Set(arr)];
};

const writeCSV = async (fileName: string, data: string) => {
  await writeFile(fileName, data, "utf8");
};
