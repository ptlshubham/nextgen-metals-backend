
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "new_nextgen"
});
exports.executeSql = function (sql, callback) {
    con.query(sql, function (err, result) {
        if (err) {
            // throw err;
            callback(null, err);
        }
        else {
            callback(result);
        }

    });

}
