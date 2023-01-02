const express = require("express");
const router = express.Router();
const db = require("../db/db");
const multer = require('multer');
const path = require('path');
const config = require("../../config");
var midway = require('./midway');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
var handlebars = require("handlebars");
const fs = require('fs');
const schedule = require('node-schedule');


router.post("/RegisterNewUser", (req, res, next) => {
    console.log(req.body, 'vgfyfyiftudtydtyg')
    db.executeSql("select * from user where Email='" + req.body.email + "'", function (data, err) {
        console.log(data.multiDefaultOption)
        if (data != null && data.length>0) {
            res.json('duplicate email');
        } else {
            db.executeSql("INSERT INTO `user`(`Salutation`, `FirstName`, `LastName`, `Phone`, `Email`, `Role`, `CompanyName`, `Designation`,`AvgMonthTrade`, `GSTNo`, `CompanyContact`, `MaterialQuality`, `KYCStatus`, `CreatedDate`,`ProfileUpdation`) VALUES ('" + req.body.select + "','" + req.body.fname + "','" + req.body.lname + "','" + req.body.contact + "','" + req.body.email + "','" + req.body.regAs + "','" + req.body.companyname + "','" + req.body.designation + "','" + req.body.avg_mnth_trade + "','" + req.body.gstno + "','" + req.body.workphone + "','" + req.body.multiDefaultOption + "',false,CURRENT_TIMESTAMP,false)", function (data, err) {
                if (err) {
                    res.json("error");
                } else {
                    console
                    db.executeSql("INSERT INTO `address`(`uid`, `street`, `city`, `state`, `pincode`, `landmark`, `createddate`) VALUES (" + data.insertId + ",'" + req.body.address + "','" + req.body.city + "','" + req.body.selectState + "','" + req.body.pincode + "','" + req.body.landmark + "',CURRENT_TIMESTAMP)", function (data, err) {
                        if (err) {
                            res.json("error");
                        } else {
                            return res.json('sucess');
                        }
                    });
                }
            });
        }
    })

});

// router.post("/RegisterNewUser", (req, res, next) => {
//     console.log(req.body)
//     db.executeSql("INSERT INTO `user`(`salutation`, `firstName`, `lastName`, `phone`, `email`, `role`, `companyName`, `designation`,`avg_mnth_trade`, `GST_no`, `company_contact`, `material_quality`, `KYC_status`, `created_date`) VALUES ('"+req.body.select+"','"+req.body.fname+"','"+req.body.lname+"','"+req.body.contact+"','"+req.body.email+"','"+req.body.regAs+"','"+req.body.companyname+"','"+req.body.designation+"','"+req.body.avg_mnth_trade+"','"+req.body.gstno+"','"+req.body.workphone+"','"+req.body.selectMaterial+"',false,CURRENT_TIMESTAMP)", function (data, err) {
//         if (err) {
//             res.json("error");
//         } else {
//             return res.json('sucess');
//         }
//     });
// });


router.post("/completeProfile", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    console.log("req.body")
    db.executeSql("UPDATE `user` SET `FirstName`='" + req.body.FirstName + "',`LastName`='" + req.body.LastName + "',`Phone`='" + req.body.Phone + "',`Email`='" + req.body.Email + "',`CompanyName`='" + req.body.CompanyName + "',`Designation`='" + req.body.Designation + "',`AvgMonthTrade`='" + req.body.AvgMonthTrade + "',`GSTNo`='" + req.body.GSTNo + "',`CompanyContact`='" + req.body.CompanyContact + "',`MaterialQuality`='" + req.body.MaterialQuality + "',`BankName`='" + req.body.BankName + "',`BankAccNo`='" + req.body.BankAccNo + "',`AccType`='" + req.body.AccType + "',`AccHolderName`='" + req.body.AccHolderName + "',`ISFCCode`='" + req.body.ISFCCode + "',`BranchName`='" + req.body.BranchName + "',`CancelCheque`='" + req.body.CancelCheque + "',`PANCard`='" + req.body.PANCard + "',`UpdatedDate`=CURRENT_TIMESTAMP,`ProfileUpdation`=true WHERE Id=" + req.body.uid, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})

router.get("/getUserDetailById/:id", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT u.Id as UserId,u.Salutation,u.FirstName,u.LastName,u.Phone,u.Email,u.Password,u.Role,u.CompanyName,u.Designation,u.AvgMonthTrade,u.GSTNo,u.CompanyContact,u.MaterialQuality,u.BankName,u.BankAccNo,u.AccType,u.AccHolderName,u.ISFCCode,u.BranchName,u.CancelCheque,u.PANCard,u.KYCStatus,u.KYCDate,a.street,a.city,a.state,a.pincode,a.landmark FROM `user` u LEFT join address a on u.Id=a.uid where u.Id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err)
        }
        else {
            res.json(data)
        }
    })
})

router.post("/GetAllTradesByUseridForBuyer",midway.checkToken,(req,res,next)=>{
    db.executeSql("select * from buyer_trade where BuyerId="+req.body.buyerId,function(data,err){
        if(err){
            console.log(err);
        }else{
            res.json(data);
        }
    })
})

router.get("/getAllUser", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM user u JOIN address a ON u.Id = a.uid;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/getAllBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM user u JOIN address a ON u.Id = a.uid where u.Role='buyer' and u.KYCStatus=true;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/getAllSeller", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM user u JOIN address a ON u.Id = a.uid where u.Role='seller' and u.KYCStatus=true;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/getAllKYCPendingUser", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM user u JOIN address a ON u.Id = a.uid where u.KYCStatus=false;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            console.log(data, 'pendoinf')

            return res.json(data);
        }
    })
});

router.post("/updateKYCUser", midway.checkToken, (req, res, next) => {
    console.log(req.body.id,'upfyfdyafyucfyufcuyhj')
    db.executeSql("update user set KYCStatus=true, KYCDate=CURRENT_TIMESTAMP where Id=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            db.executeSql("select * from user where Id=" + req.body.id, function (data1, err) {
                if (err) {
                    console.log(er);
                } else {
                    const replacements = {
                        votp: data1[0].FirstName + '@123',
                        email: data1[0].Email,
                        id: req.body.id
                    };
                    console.log(replacements);


                    mail('newpassword.html', replacements, data1[0].Email, "Setting Password", "New Password for Nextgen ");
                    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
                    var repass = salt + '' + data1[0].FirstName + '@123';
                    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
                    db.executeSql("UPDATE user SET Password='" + encPassword + "' WHERE Id=" + req.body.id + ";", function (data, err) {
                        if (err) {
                            console.log("Error in store.js", err);
                        } else {
                            return res.json('success');
                        }
                    });
                }
            })

            // return res.json('success');
        }
    })
});

router.post("/UploadMaterialImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/material');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/material/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/material/' + req.file.filename);


    });
});

router.post("/UploadCancelCheckImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/cancelcheck');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/cancelcheck/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/cancelcheck/' + req.file.filename);


    });
});

router.post("/UploadMaterialMultiImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/material-multi');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/material-multi/' + req.file.filename);

        if (req.fileValidationError) {
            console.log("err1", req.fileValidationError);
            return res.json("err1", req.fileValidationError);
        } else if (!req.file) {
            console.log('Please select an image to upload');
            return res.json('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            console.log("err3");
            return res.json("err3", err);
        } else if (err) {
            console.log("err4");
            return res.json("err4", err);
        }
        return res.json('/images/material-multi/' + req.file.filename);


    });
});

function mail(filename, data, toemail, subj, mailname) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: 'smtp.gmail.com',
        auth: {
            user: 'ptlshubham@gmail.com',
            pass: 'hvcukfxtadulqrnb'
        },
    });
    const filePath = 'src/assets/emailtemplets/' + filename;
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = data;
    const htmlToSend = template(replacements);

    const mailOptions = {
        from: `"ptlshubham@gmail.com"`,
        subject: subj,
        to: toemail,
        Name: mailname,
        html: htmlToSend,


    };
    transporter.sendMail(mailOptions, function (error, info) {
        console.log('fgfjfj')
        if (error) {
            console.log(error);
            res.json("Errror");
        } else {
            console.log('Email sent: ' + info.response);
            res.json(data);
        }
    });
}
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

// let secret = 'prnv';
router.post('/login', function (req, res, next) {

    const body = req.body;
    console.log(body);
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("select * from admin where email='" + req.body.email + "';", function (data, err) {
        console.log(data);
        if (data.length > 0) {
            db.executeSql("select * from admin where email='" + req.body.email + "' and password='" + encPassword + "';", function (data1, err) {
                console.log(data1);
                if (data1.length > 0) {

                    module.exports.user1 = {
                        username: data1[0].email,
                        password: data1[0].password
                    }
                    let token = jwt.sign({ username: data1[0].email, password: data1[0].password },
                        secret, {
                        expiresIn: '1h' // expires in 24 hours
                    }
                    );
                    console.log("token=", token);
                    data[0].token = token;

                    res.cookie('auth', token);
                    res.json(data);
                } else {
                    return res.json(2);
                }
            });
        } else {
            return res.json(1);
        }
    });

});

let secret = 'prnv';
router.post('/GetUsersLogin', function (req, res, next) {
    const body = req.body;
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("select * from users where email='" + req.body.email + "';", function (data, err) {
        console.log(data);
        if (data == null || data == undefined || data.length === 0) {
            return res.json(1);
        } else {
            // var time = get_time_diff;
            // console.log(time);
            db.executeSql("select * from users where email='" + req.body.email + "' and password='" + encPassword + "';", function (data1, err) {
                if (data1.length > 0) {
                    module.exports.user1 = {
                        username: data1[0].email,
                        password: data1[0].password
                    }
                    let token = jwt.sign({ username: data1[0].email, password: data1[0].password },
                        secret, {
                        expiresIn: '1h' // expires in 24 hours
                    }
                    );
                    console.log("token=", token);


                    res.cookie('auth', token);
                    if (data1[0].role == 'Admin') {
                        let resdata = [];
                        db.executeSql("select * from admin where uid=" + data1[0].userid, function (data2, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                resdata.push(data2[0]);
                                resdata[0].token = token;
                                resdata[0].role = data1[0].role;
                                resdata[0].last_login = data1[0].out_time;
                                resdata[0].last_inTime = data1[0].in_time;
                                db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata);
                            }
                        })

                    } else if (data1[0].role == 'Customer') {
                        console.log('helllllllll')
                        let resdata1 = [];
                        db.executeSql("select * from customer where uid=" + data1[0].userid, function (data3, err) {
                            if (err) {
                                console.log("data");
                                console.log(err);
                            } else {
                                console.log(data1[0].userid)
                                resdata1.push(data3[0]);
                                resdata1[0].token = token;
                                resdata1[0].role = data1[0].role;
                                resdata1[0].last_login = data1[0].out_time;
                                resdata1[0].last_inTime = data1[0].in_time;

                                db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata1);
                            }
                        })
                    }
                    else if (data1[0].role == 'Sub-Admin') {
                        let resdata5 = [];
                        db.executeSql("select * from admin where uid=" + data1[0].userid, function (data7, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                resdata5.push(data7[0]);
                                resdata5[0].token = token;
                                resdata5[0].role = data1[0].role;
                                resdata5[0].last_login = data1[0].out_time;
                                resdata5[0].last_inTime = data1[0].in_time;
                                db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata5);
                            }
                        })

                    }
                    // else if (data1[0].role == 'Student') {
                    //     let resdata2 = [];
                    //     db.executeSql("select * from studentlist where uid=" + data1[0].userid, function (data4, err) {
                    //         if (err) {
                    //             console.log(err);
                    //         } else {
                    //             resdata2.push(data4[0]);
                    //             resdata2[0].token = token;
                    //             resdata2[0].role = data1[0].role;
                    //             resdata2[0].last_login = data1[0].out_time;
                    //             resdata2[0].last_inTime = data1[0].in_time;
                    //             db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                    //                 if (err) {
                    //                     console.log("Error in store.js", err);
                    //                 } else { }
                    //             });
                    //             return res.json(resdata2);
                    //         }
                    //     })
                    // } else if (data1[0].role == 'Visitor') {
                    //     let resdata3 = [];
                    //     db.executeSql("select * from visitorreg where uid=" + data1[0].userid, function (data5, err) {
                    //         if (err) {
                    //             console.log(err);
                    //         } else {
                    //             resdata3.push(data5[0]);
                    //             resdata3[0].token = token;
                    //             resdata3[0].role = data1[0].role;
                    //             resdata3[0].last_login = data1[0].out_time;
                    //             resdata3[0].last_inTime = data1[0].in_time;
                    //             db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                    //                 if (err) {
                    //                     console.log("Error in store.js", err);
                    //                 } else { }
                    //             });
                    //             return res.json(resdata3);
                    //         }
                    //     })
                    // } else if (data1[0].role == 'Parents') {
                    //     let resdata4 = [];
                    //     db.executeSql("select * from parentsinfo where uid=" + data1[0].userid, function (data6, err) {
                    //         if (err) {
                    //             console.log(err);
                    //         } else {
                    //             resdata4.push(data6[0]);
                    //             resdata4[0].token = token;
                    //             resdata4[0].role = data1[0].role;
                    //             resdata4[0].last_login = data1[0].out_time;
                    //             resdata4[0].last_inTime = data1[0].in_time;
                    //             db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                    //                 if (err) {
                    //                     console.log("Error in store.js", err);
                    //                 } else { }
                    //             });
                    //             return res.json(resdata4);
                    //         }
                    //     })
                    // } 



                } else {
                    return res.json(2);
                }
            });
        }

    });

});



function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    return uuid;
}


module.exports = router;