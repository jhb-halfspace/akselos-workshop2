var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
var fs = require("fs");
var csv = require("fast-csv");
var _a = require("fs").promises, writeFile = _a.writeFile, appendFile = _a.appendFile, copyFile = _a.copyFile;
var parseCsv = function (filename) {
    return new Promise(function (resolve, reject) {
        var data = [];
        fs.createReadStream(filename)
            .pipe(csv.parse({ headers: true }))
            .on("error", reject)
            .on("data", function (row) { return data.push(row); })
            .on("end", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                resolve(data);
                return [2];
            });
        }); });
    });
};
(function () { return __awaiter(_this, void 0, void 0, function () {
    var data, outputFileName, cutOffIndex, i, datum, departmentMap, i, datum, initSql, i, name_1, department, level, note, projectsCsv, i, datum, projectMap, i, datum, i, datum, workPackageCsv, workPackageTracker, i, datum, workPackageTracker2, workPackages, i, projectId, workPackage, userMap, i, datum, workPackageMap, i, datum, i, datum;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, parseCsv("./data/raw_ytd.csv")];
            case 1:
                data = _a.sent();
                outputFileName = "data/ytd.csv";
                cutOffIndex = data.findIndex(function (d) { return d["PROJECT"] === "TOTAL"; });
                data = data.slice(0, cutOffIndex);
                return [4, writeCSV(outputFileName, "CUSTOMER,MARKET SEGMENT,ASSET TYPE,PROJECT,REF CODE,DEPARTMENT,ACTIVITIES\n")];
            case 2:
                _a.sent();
                i = 0;
                _a.label = 3;
            case 3:
                if (!(i < data.length)) return [3, 6];
                datum = data[i];
                return [4, appendFile(outputFileName, "".concat(datum["CUSTOMER"], ",").concat(datum["MARKET SEGMENT"], ",").concat(datum["ASSET TYPE"], ",").concat(datum["PROJECT"], ",").concat(datum["REF CODE"], ",").concat(datum["DEPARTMENT"], ",").concat(datum["ACTIVITIES"]).concat(i === data.length - 1 ? "" : "\n"))];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                i++;
                return [3, 3];
            case 6: return [4, parseCsv("./data/departments.csv")];
            case 7:
                data = _a.sent();
                departmentMap = {};
                for (i = 0; i < data.length; i++) {
                    datum = data[i];
                    departmentMap[datum["department_name"].toLowerCase()] = datum.id;
                }
                initSql = "output/init.sql";
                return [4, copyFile("./data/init_template.sql", initSql)];
            case 8:
                _a.sent();
                return [4, parseCsv("./data/employee_entry.csv")];
            case 9:
                data = _a.sent();
                outputFileName = "output/users.sql";
                return [4, writeCSV(outputFileName, "INSERT INTO users (id, user_name, department_id, position, note) VALUES\n")];
            case 10:
                _a.sent();
                return [4, appendFile(initSql, "INSERT INTO users (id, user_name, department_id, position, note) VALUES\n")];
            case 11:
                _a.sent();
                i = 0;
                _a.label = 12;
            case 12:
                if (!(i < data.length)) return [3, 16];
                name_1 = data[i]["NAME"];
                department = data[i]["DEPARTMENT"];
                level = data[i]["LEVEL"];
                note = data[i]["NOTE"];
                return [4, appendFile(outputFileName, "  (".concat(i + 1, ", '").concat(name_1, "', ").concat(departmentMap[department.toLowerCase()], ", '").concat(level, "', '").concat(note, "')").concat(i === data.length - 1 ? ";\n\n" : ",\n"))];
            case 13:
                _a.sent();
                return [4, appendFile(initSql, "  (".concat(i + 1, ", '").concat(name_1, "', ").concat(departmentMap[department.toLowerCase()], ", '").concat(level, "', '").concat(note, "')").concat(i === data.length - 1 ? ";\n\n" : ",\n"))];
            case 14:
                _a.sent();
                _a.label = 15;
            case 15:
                i++;
                return [3, 12];
            case 16: return [4, parseCsv("./data/ytd.csv")];
            case 17:
                data = _a.sent();
                outputFileName = "output/projects.sql";
                projectsCsv = "data/projects.csv";
                return [4, writeCSV(outputFileName, "INSERT INTO projects (id, project_name, ref_code, department_id, activity) VALUES\n")];
            case 18:
                _a.sent();
                return [4, appendFile(initSql, "INSERT INTO projects (id, project_name, ref_code, department_id, activity) VALUES\n")];
            case 19:
                _a.sent();
                return [4, writeCSV(projectsCsv, "id,project_name,ref_code,department_id,activity\n")];
            case 20:
                _a.sent();
                i = 0;
                _a.label = 21;
            case 21:
                if (!(i < data.length)) return [3, 26];
                datum = data[i];
                return [4, appendFile(outputFileName, "  (".concat(i + 1, ", '").concat(datum["PROJECT"], "', '").concat(datum["REF CODE"], "', '").concat(departmentMap[datum["DEPARTMENT"].toLowerCase()], "', '").concat(datum["ACTIVITIES"], "')").concat(i === data.length - 1 ? ";\n\n" : ",\n"))];
            case 22:
                _a.sent();
                return [4, appendFile(initSql, "  (".concat(i + 1, ", '").concat(datum["PROJECT"], "', '").concat(datum["REF CODE"], "', '").concat(departmentMap[datum["DEPARTMENT"].toLowerCase()], "', '").concat(datum["ACTIVITIES"], "')").concat(i === data.length - 1 ? ";\n\n" : ",\n"))];
            case 23:
                _a.sent();
                return [4, appendFile(projectsCsv, "".concat(i + 1, ",").concat(datum["PROJECT"], ",").concat(datum["REF CODE"], ",").concat(departmentMap[datum["DEPARTMENT"].toLowerCase()], ",").concat(datum["ACTIVITIES"]).concat(i === data.length - 1 ? "" : "\n"))];
            case 24:
                _a.sent();
                _a.label = 25;
            case 25:
                i++;
                return [3, 21];
            case 26: return [4, parseCsv("./data/projects.csv")];
            case 27:
                data = _a.sent();
                projectMap = {};
                for (i = 0; i < data.length; i++) {
                    datum = data[i];
                    projectMap[datum["project_name"].toLowerCase()] = datum.id;
                }
                return [4, parseCsv("./data/ytd.csv")];
            case 28:
                data = _a.sent();
                outputFileName = "output/assets.sql";
                return [4, writeCSV(outputFileName, "INSERT INTO assets (customer_name, market_segment, project_id, asset_type) VALUES\n")];
            case 29:
                _a.sent();
                return [4, appendFile(initSql, "INSERT INTO assets (customer_name, market_segment, project_id, asset_type) VALUES\n")];
            case 30:
                _a.sent();
                i = 0;
                _a.label = 31;
            case 31:
                if (!(i < data.length)) return [3, 35];
                datum = data[i];
                return [4, appendFile(outputFileName, "  ('".concat(datum["CUSTOMER"], "', '").concat(datum["MARKET SEGMENT"], "', ").concat(projectMap[datum["PROJECT"].toLowerCase()], ", '").concat(datum["ASSET TYPE"], "')").concat(i === data.length - 1 ? ";\n\n" : ",\n"))];
            case 32:
                _a.sent();
                return [4, appendFile(initSql, "  ('".concat(datum["CUSTOMER"], "', '").concat(datum["MARKET SEGMENT"], "', ").concat(projectMap[datum["PROJECT"].toLowerCase()], ", '").concat(datum["ASSET TYPE"], "')").concat(i === data.length - 1 ? ";\n\n" : ",\n"))];
            case 33:
                _a.sent();
                _a.label = 34;
            case 34:
                i++;
                return [3, 31];
            case 35: return [4, parseCsv("./data/timerecord.csv")];
            case 36:
                data = _a.sent();
                outputFileName = "output/work_packages.sql";
                workPackageCsv = "data/workPackage.csv";
                return [4, writeCSV(outputFileName, "INSERT INTO work_packages (id, project_id, work_package_name) VALUES\n")];
            case 37:
                _a.sent();
                return [4, appendFile(initSql, "INSERT INTO work_packages (id, project_id, work_package_name) VALUES\n")];
            case 38:
                _a.sent();
                return [4, writeCSV(workPackageCsv, "id,work_package_name\n")];
            case 39:
                _a.sent();
                workPackageTracker = [];
                for (i = 0; i < data.length; i++) {
                    datum = data[i];
                    workPackageTracker.push("".concat(projectMap[datum.PROJECT.toLowerCase()], "___").concat(datum["WORK PACKAGE"]));
                }
                workPackageTracker2 = removeDuplicates(workPackageTracker);
                workPackages = workPackageTracker2.map(function (w) {
                    var _a;
                    var wSplitted = w.split("___");
                    var id = wSplitted[0];
                    var package = wSplitted[1];
                    return _a = {}, _a[id] = package, _a;
                });
                i = 0;
                _a.label = 40;
            case 40:
                if (!(i < workPackages.length)) return [3, 45];
                projectId = Object.keys(workPackages[i]);
                workPackage = Object.values(workPackages[i]);
                return [4, appendFile(outputFileName, "  (".concat(i + 1, ", ").concat(projectId, ", '").concat(workPackage, "')").concat(i === workPackages.length - 1 ? ";\n\n" : ",\n"))];
            case 41:
                _a.sent();
                return [4, appendFile(initSql, "  (".concat(i + 1, ", ").concat(projectId, ", '").concat(workPackage, "')").concat(i === workPackages.length - 1 ? ";\n\n" : ",\n"))];
            case 42:
                _a.sent();
                return [4, appendFile(workPackageCsv, "".concat(i + 1, ",").concat(workPackage).concat(i === workPackages.length - 1 ? "" : "\n"))];
            case 43:
                _a.sent();
                _a.label = 44;
            case 44:
                i++;
                return [3, 40];
            case 45: return [4, parseCsv("./data/employee_entry.csv")];
            case 46:
                data = _a.sent();
                userMap = {};
                for (i = 0; i < data.length; i++) {
                    datum = data[i];
                    userMap[datum["NAME"]] = i + 1;
                }
                return [4, parseCsv("./data/workPackage.csv")];
            case 47:
                data = _a.sent();
                workPackageMap = {};
                for (i = 0; i < data.length; i++) {
                    datum = data[i];
                    workPackageMap[datum.work_package_name] = datum.id;
                }
                return [4, parseCsv("./data/timerecord.csv")];
            case 48:
                data = _a.sent();
                outputFileName = "output/records.sql";
                return [4, writeCSV(outputFileName, "INSERT INTO records (id, user_id, project_id, work_package_id, task_id, subtask_id, date, working_hours) VALUES\n")];
            case 49:
                _a.sent();
                return [4, appendFile(initSql, "INSERT INTO records (id, user_id, project_id, work_package_id, task_id, subtask_id, date, working_hours) VALUES\n")];
            case 50:
                _a.sent();
                i = 0;
                _a.label = 51;
            case 51:
                if (!(i < data.length)) return [3, 55];
                datum = data[i];
                return [4, appendFile(outputFileName, "  (".concat(i + 1, ", ").concat(userMap[datum.NAME], ", ").concat(projectMap[datum["PROJECT"].toLowerCase()], ", ").concat(workPackageMap[datum["WORK PACKAGE"]], ", 0, 0, TO_DATE('").concat(datum.DATE, "', 'DD/MM/YYYY'), ").concat(datum["WORKING HOURS"], ")").concat(i === data.length - 1 ? ";\n\n" : ",\n"))];
            case 52:
                _a.sent();
                return [4, appendFile(initSql, "  (".concat(i + 1, ", ").concat(userMap[datum.NAME], ", ").concat(projectMap[datum["PROJECT"].toLowerCase()], ", ").concat(workPackageMap[datum["WORK PACKAGE"]], ", 0, 0, TO_DATE('").concat(datum.DATE, "', 'DD/MM/YYYY'), ").concat(datum["WORKING HOURS"], ")").concat(i === data.length - 1 ? ";\n\n" : ",\n"))];
            case 53:
                _a.sent();
                _a.label = 54;
            case 54:
                i++;
                return [3, 51];
            case 55: return [4, appendFile(initSql, "SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('\"users\"', 'id')), (SELECT (MAX(\"id\") + 1) FROM \"users\"), FALSE);\n")];
            case 56:
                _a.sent();
                return [4, appendFile(initSql, "SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('\"projects\"', 'id')), (SELECT (MAX(\"id\") + 1) FROM \"projects\"), FALSE);\n")];
            case 57:
                _a.sent();
                return [4, appendFile(initSql, "SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('\"work_packages\"', 'id')), (SELECT (MAX(\"id\") + 1) FROM \"work_packages\"), FALSE);\n")];
            case 58:
                _a.sent();
                return [4, appendFile(initSql, "SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('\"tasks\"', 'id')), (SELECT (MAX(\"id\") + 1) FROM \"tasks\"), FALSE);\n")];
            case 59:
                _a.sent();
                return [4, appendFile(initSql, "SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('\"subtasks\"', 'id')), (SELECT (MAX(\"id\") + 1) FROM \"subtasks\"), FALSE);\n")];
            case 60:
                _a.sent();
                return [4, appendFile(initSql, "SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('\"records\"', 'id')), (SELECT (MAX(\"id\") + 1) FROM \"records\"), FALSE);\n")];
            case 61:
                _a.sent();
                return [2];
        }
    });
}); })();
var removeDuplicates = function (arr) {
    return __spreadArray([], __read(new Set(arr)), false);
};
var writeCSV = function (fileName, data) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, writeFile(fileName, data, "utf8")];
            case 1:
                _a.sent();
                return [2];
        }
    });
}); };
