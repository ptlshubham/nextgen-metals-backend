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
let dates = new Date(new Date().setDate(new Date().getDate() - 60));

console.log(dates.toISOString().slice(0, 10));
const job = schedule.scheduleJob('0 0 * * *', function () {
    console.log('hello schedule')
    db.executeSql("UPDATE `customer` SET `status`=false WHERE updateddate='" + dates.toISOString().slice(0, 10) + "';", function (data, err) {

        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    });
});


router.post("/RegisterNewUser", (req, res, next) => {
    db.executeSql("INSERT INTO `user`(`salutation`, `firstName`, `lastName`, `phone`, `email`, `role`, `companyName`, `designation`, `GST_no`, `company_contact`, `material_quality`, `bank_name`, `bank_acc_no`, `acc_type`, `acc_holder_name`, `isfc_code`, `branch_name`, `cancel_cheque`, `PAN_card`, `KYC_status`, `created_date`, `updated_date`) VALUES ('"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','["+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"','"+req.body+"')", function (data, err) {
        if (err) {
            res.json("error");
        } else {

            return res.json(data);
        }
    });
});

router.get("/GetAllServices", (req, res, next) => {
    db.executeSql("select * from serviceslist", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});


router.post("/UpdateServicesList", (req, res, next) => {
    db.executeSql("UPDATE  `serviceslist` SET name='" + req.body.name + "',price=" + req.body.price + ",time=" + req.body.time + ",point=" + req.body.point + ",epoint=" + req.body.epoint + ",updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/UpdateSalaryList", (req, res, next) => {
    db.executeSql("UPDATE `salary` SET `salary`= " + req.body.salary + " ,`desc`='" + req.body.desc + "',`paiddate`='" + req.body.paiddate + "' WHERE id= " + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/RemoveSalaryList", (req, res, next) => {

    console.log(req.body);
    db.executeSql("Delete from salary where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/SaveEmployeeList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `employee`(`fname`,`lname`,`contact`,`whatsapp`,`address`,`city`,`pincode`,`gender`,`isactive`,`createddate`)VALUES('" + req.body.fname + "','" + req.body.lname + "','" + req.body.contact + "','" + req.body.whatsapp + "','" + req.body.address + "','" + req.body.city + "'," + req.body.pincode + ",'" + req.body.gender + "'," + req.body.isactive + ",CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            console.log(req.body.service.length)
            for (let i = 0; i < req.body.service.length; i++) {
                console.log(req.body.service[i]);
                db.executeSql("INSERT INTO `empservices`(`servicesid`,`servicesname`,`empid`) VALUES(" + req.body.service[i].id + ",'" + req.body.service[i].name + "'," + data.insertId + ");", function (data1, err) {
                    if (err) {
                        console.log(err);

                    } else {

                    }
                });

            }
            return res.json('success');
        }
    });
});

// router.get("/GetAllEmployee", (req, res, next) => {
//     db.executeSql("select e.id,e.fname,e.lname,e.contact,e.whatsapp,e.address,e.city,e.pincode,e.gender,e.isactive,e.createddate,e.updateddate,s.servicesid,s.servicesname from employee e join empservices s on e.id=s.empid", function (data, err) {
//         if (err) {
//             console.log(err);
//         } else {
//             return res.json(data);
//         }
//     })
// });
router.get("/GetAllEmployee", (req, res, next) => {
    db.executeSql("select * from employee where isactive=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetEmployeeService", (req, res, next) => {
    db.executeSql("select * from empservices", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/RemoveEmployeeList", (req, res, next) => {

    console.log(req.body);
    db.executeSql("update `employee` set isactive='0' where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetAllSalaryList", (req, res, next) => {
    console.log(req.body);
    db.executeSql("select s.id,s.salary,s.desc,s.paiddate,s.empid,e.id as eId,e.fname,e.lname,e.contact,e.whatsapp,e.address,e.city,e.pincode,e.gender from salary s join employee e on s.empid=e.id where s.empid=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetAllOrderList", (req, res, next) => {
    db.executeSql("select o.id,o.userid,o.totalprice,o.isactive,o.orderdate,c.fname,c.lname,c.email,c.contact,c.whatsapp,c.gender,c.address,c.uid,c.vip,c.ismembership from orderlist o join customer c on o.userid=c.uid", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetAllProductOrderList/:id", (req, res, next) => {
    db.executeSql("select o.id,o.oid,o.uid,o.pid,o.oquant,p.id as Pid,p.name,p.image,p.category,p.price,p.quantity,p.vendorname,p.vendorcontact,p.descripition,p.isactive from orderdetails o join products p on o.pid=p.id where oid=" + req.params.id + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})

router.get("/RemoveCustomerOrder/:id", (req, res, next) => {
    db.executeSql("DELETE FROM `orderlist` WHERE id=" + req.params.id + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            db.executeSql("DELETE FROM `orderdetails` WHERE oid=" + req.params.id + "", function (data, err) {
                if (err) {
                    console.log(err);
                } else {

                }
            })
        }
        return res.json('success');
    })
})
router.post("/UpdateEmployeeList", (req, res, next) => {
    db.executeSql("UPDATE `employee` SET fname='" + req.body.fname + "',lname='" + req.body.lname + "',contact='" + req.body.contact + "',whatsapp='" + req.body.whatsapp + "',address='" + req.body.address + "',city='" + req.body.city + "',gender='" + req.body.gender + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/UpdateWorkingStatus", (req, res, next) => {
    db.executeSql("UPDATE `employee` SET isworking=" + req.body.isworking + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/SaveCustomerList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `customer`(`fname`,`lname`,`email`,`contact`,`whatsapp`,`gender`,`createddate`,`address`,`vip`)VALUES('" + req.body.fname + "','" + req.body.lname + "','" + req.body.email + "','" + req.body.contact + "','" + req.body.whatsapp + "','" + req.body.gender + "',CURRENT_TIMESTAMP,'" + req.body.address + "'," + req.body.vip + ");", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            return res.json('success');
        }
    });
});


router.get("/GetAllCustomer", (req, res, next) => {
    db.executeSql("select * from customer", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/GetAllOffer", (req, res, next) => {
    db.executeSql("select * from offer", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/SaveOfferList", (req, res, next) => {
    console.log(req.body)

    db.executeSql("INSERT INTO `offer`(`offername`,`totalprice`,`offerprice`,`percentage`,`status`)VALUES('" + req.body.offername + "'," + req.body.totalprice + "," + req.body.offerprice + "," + req.body.percentage + ",true);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            for (let i = 0; i < req.body.services.length; i++) {
                db.executeSql("INSERT INTO `offerservices`(`offerid`,`servicesname`,`totalprice`,`offername`,`offerprice`) VALUES(" + data.insertId + ",'" + req.body.services[i].selectedServ + "'," + req.body.totalprice + ",'" + req.body.offername + "'," + req.body.offerprice + ");", function (data1, err) {
                    if (err) {
                        console.log(err);
                    } else { }
                });
            }
        }
        return res.json('success');
    });

});
// router.post("/GetUsedServicesByOffer", (req, res, next) => {

//     db.executeSql("select s.offerid,s.servicesname,s.offername,s.,s.offerprice,sl.id as slId,sl.totalprice,sl.time,sl.point from offerservices s join serviceslist sl on s.servicesid=sl.id where s.appointmentid = " + req.body.id + "", function (data, err) {
//         if (err) {
//             console.log("Error in store.js", err);
//         } else {
//             return res.json(data);
//         }
//     });
// })
router.post("/GetUsedServicesByOffer", (req, res, next) => {

    db.executeSql("select s.offerid,s.servicesname,s.offername,s.offerprice,sl.id as slId,sl.offerid,sl.servicesname,sl.offername,sl.offerprice from offerservices s join serviceslist sl on s.servicesid=sl.id where s.offerappointmentid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/SaveAcceptUserOrder", (req, res, next) => {

    db.executeSql("UPDATE `orderlist` SET isactive=false,updateddate=CURRENT_TIMESTAMP WHERE id = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/removeOfferDetails/:id", (req, res, next) => {

    db.executeSql("Delete from offer where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    });
})

router.get("/GetActiveOffer", (req, res, next) => {
    db.executeSql("select * from offer where status=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/getAllOfferDataList", (req, res, next) => {

    db.executeSql("select * from offerservices where offerid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/SaveMembershipList", (req, res, next) => {
    console.log(req.body)

    db.executeSql("INSERT INTO `membership`(`membershipname`,`membershipdiscount`,`totalprice`,`membershipprice`,`status`)VALUES('" + req.body.membershipname + "'," + req.body.membershipdiscount + "," + req.body.totalprice + "," + req.body.membershipprice + ",true);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            for (let i = 0; i < req.body.services.length; i++) {
                db.executeSql("INSERT INTO `membershipservices` ( `membershipid`, `servicesname`, `serviceid`, `totalprice`, `membershipname`, `quantity`, `serviceprice`) VALUES(" + data.insertId + ",'" + req.body.services[i].selectedServ + "'," + req.body.services[i].selectedServid + "," + req.body.services[i].finalprice + ",'" + req.body.membershipname + "'," + req.body.services[i].quantity + "," + req.body.services[i].serprice + ");", function (data1, err) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (i == req.body.services.length - 1) {
                            console.log("prnv")
                            res.json('success');
                        }
                    }
                });
            }

        }

    });
});
router.post("/GetUsedServicesByMembership", (req, res, next) => {

    db.executeSql("SELECT * FROM `membershipservices` WHERE membershipid=" + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/removeMembershipDetails/:id", (req, res, next) => {

    db.executeSql("Delete from membership where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/GetAllMembership", (req, res, next) => {
    db.executeSql("select * from membership", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/SaveAppointmentList", (req, res, next) => {
    console.log(req.body)
    var checkdate = req.body.selectdate;

    if (checkdate == undefined) {
        if (req.body.offerId != undefined) {
            db.executeSql("INSERT INTO `appointment`(`custid`, `totalprice`, `totalpoint`, `totaltime`, `isactive`, `createddate`,`updatedate`,`ispayment`,`appointmentdate`,`timeslot`)VALUES(" + req.body.custid + ",'" + req.body.totalprice + "','" + req.body.totalpoint + "','" + req.body.totaltime + "'," + req.body.isactive + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,false,'" + req.body.bookingdate + "','" + req.body.timeSlot + "');", function (data, err) {
                if (err) {
                    console.log(err)
                } else {
                    for (let i = 0; i < req.body.selectedService.length; i++) {
                        db.executeSql("INSERT INTO `custservices`(`servicesid`,`servicesname`,`custid`,`appointmentid`,`employeename`,`empid`) VALUES(" + req.body.selectedService[i].selectedServid + ",'" + req.body.selectedService[i].servicesname + "'," + req.body.custid + "," + data.insertId + ",'" + req.body.selectedService[i].employeename + "'," + req.body.selectedService[i].selectedEmpid + ");", function (data1, err) {
                            if (err) {
                                console.log(err);
                            } else { }
                        });
                    }
                    if (req.body.tCustPoint == 0) {
                        db.executeSql("INSERT INTO `point`( `custid`, `totalcustpoint`)VALUES(" + req.body.custid + "," + req.body.lessPoints + ");", function (data2, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(data);
                            }
                        });
                    } else {
                        console.log('defined')
                        console.log(req.body)
                        db.executeSql("UPDATE `point` SET totalcustpoint=" + req.body.lessPoints + " WHERE custid=" + req.body.custid + ";", function (data3, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(data);
                            }
                        });
                    }

                }
                return res.json(data);
            });
        } else {
            db.executeSql("INSERT INTO `appointment`(`custid`, `totalprice`, `totalpoint`, `totaltime`, `isactive`, `createddate`,`updatedate`,`ispayment`,`appointmentdate`,`timeslot`)VALUES(" + req.body.custid + ",'" + req.body.totalprice + "','" + req.body.totalpoint + "','" + req.body.totaltime + "'," + req.body.isactive + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,false,'" + req.body.bookingdate + "','" + req.body.timeSlot + "');", function (data, err) {
                if (err) {
                    console.log(err)
                } else {
                    for (let i = 0; i < req.body.selectedService.length; i++) {
                        db.executeSql("INSERT INTO `custservices`(`servicesid`,`servicesname`,`custid`,`appointmentid`,`employeename`,`empid`) VALUES(" + req.body.selectedService[i].selectedServid + ",'" + req.body.selectedService[i].servicesname + "'," + req.body.custid + "," + data.insertId + ",'" + req.body.selectedService[i].employeename + "'," + req.body.selectedService[i].selectedEmpid + ");", function (data1, err) {
                            if (err) {
                                console.log(err);
                            } else { }
                        });
                    }
                    if (req.body.tCustPoint == 0) {
                        db.executeSql("INSERT INTO `point`( `custid`, `totalcustpoint`)VALUES(" + req.body.custid + "," + req.body.lessPoints + ");", function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(data);
                            }
                        });
                    } else {
                        db.executeSql("UPDATE `point` SET totalcustpoint=" + req.body.lessPoints + " WHERE custid=" + req.body.custid + ";", function (data, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(data);
                            }
                        });
                    }

                }
                return res.json('success');
            });
        }
    }
    else {
        db.executeSql("INSERT INTO `appointment`(`custid`, `totalprice`, `totalpoint`, `totaltime`, `isactive`, `createddate`,`updatedate`,`ispayment`,`appointmentdate`,`timeslot`)VALUES(" + req.body.custid + ",'" + req.body.totalprice + "','" + req.body.totalpoint + "','" + req.body.totaltime + "'," + req.body.isactive + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,false,'" + req.body.bookingdate + "','" + req.body.timeSlot + "');", function (data, err) {
            if (err) {
                console.log(err)
            } else {
                for (let i = 0; i < req.body.selectedService.length; i++) {
                    db.executeSql("INSERT INTO `custservices`(`servicesid`,`servicesname`,`custid`,`appointmentid`,`employeename`,`empid`) VALUES(" + req.body.selectedService[i].selectedServid + ",'" + req.body.selectedService[i].servicesname + "'," + req.body.custid + "," + data.insertId + ",'" + req.body.selectedService[i].employeename + "'," + req.body.selectedService[i].selectedEmpid + ");", function (data1, err) {
                        if (err) {
                            console.log(err);
                        } else { }
                    });
                }
                if (req.body.tCustPoint == 0) {
                    db.executeSql("INSERT INTO `point`( `custid`, `totalcustpoint`)VALUES(" + req.body.custid + "," + req.body.lessPoints + ");", function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(data);
                        }
                    });
                } else {
                    db.executeSql("UPDATE `point` SET totalcustpoint=" + req.body.lessPoints + " WHERE custid=" + req.body.custid + ";", function (data, err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(data);
                        }
                    });
                }
            }
            return res.json('success');
        });
    }
});

router.post("/saveOfferPurchase", (req, res, next) => {
    db.executeSql("INSERT INTO `purchasedoffer`( `custid`, `employeeid`, `offerid`,`appointmentId`, `payment`, `offerprice`, `createddate`, `updateddate`) VALUES (" + req.body.custid + "," + req.body.empId + "," + req.body.offerId + "," + req.body.appointmentId + "," + false + "," + req.body.offerprice + ",CURRENT_TIMESTAMP,null);", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})


router.get("/GetAllAppointment", (req, res, next) => {
    db.executeSql("select a.id,a.custid,a.totalprice,a.totalpoint,a.totaltime,a.isactive,a.createddate,a.updatedate,a.ispayment,a.appointmentdate,a.ratings,a.timeslot,c.id as cId,c.fname,c.lname,c.email,c.contact,c.whatsapp,c.gender from appointment a join customer c on a.custid=c.id where isactive=true ORDER BY a.appointmentdate", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/ChackForPassword", (req, res, next) => {
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.pass;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("select * from users where userid=" + req.body.id + " and password='" + encPassword + "'", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data)
        }
    })
})

// router.post("/updatePasswordAccordingRole", (req, res, next) => {
//     console.log(req.body)
//     var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
//     var repass = salt + '' + req.body.password;
//     var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
//     if (req.body.role == 'Admin') {
//         db.executeSql("UPDATE  `admin` SET password='" + encPassword + "' WHERE id=" + req.body.id + ";", function(data, err) {
//             if (err) {
//                 console.log("Error in store.js", err);
//             } else {
//                 return res.json(data);
//             }
//         });
//     }
// });


router.get("/GetAllEnquiryList", (req, res, next) => {
    db.executeSql("select * from appointment WHERE isactive=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/UpdateSalaryStatus", (req, res, next) => {
    db.executeSql("UPDATE  `salary` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

var nowDate = new Date();
date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
router.get("/GetDailyTotal", (req, res, next) => {
    db.executeSql("select * from appointment where createddate='" + date + "' and ispayment=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {

            return res.json(data);
        }
    })
});

router.get("/GetMonthlyTotal", (req, res, next) => {
    db.executeSql("select * from appointment where  DATE_FORMAT(createddate, '%m') = DATE_FORMAT(CURRENT_TIMESTAMP, '%m') and ispayment=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});


router.post("/UpdateCustomerList", (req, res, next) => {
    db.executeSql("UPDATE  `customer` SET fname='" + req.body.fname + "',lname='" + req.body.lname + "',email='" + req.body.email + "',contact='" + req.body.contact + "',whatsapp='" + req.body.whatsapp + "',gender='" + req.body.gender + "',vip=" + req.body.vip + ",updateddate=CURRENT_TIMESTAMP,address='" + req.body.address + "' WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})



router.get("/removeCustomerDetails/:id", (req, res, next) => {

    db.executeSql("Delete from customer where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.get("/RemoveServicesList/:id", (req, res, next) => {

    db.executeSql("Delete from serviceslist where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    });
})

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
        attachments: [{
            filename: '8ef701a9-e74c-41f7-a851-2fe09139a836.png',
            path: 'src/assets/img/8ef701a9-e74c-41f7-a851-2fe09139a836.png',
            cid: 'web-logo'
        }, {
            filename: 'boucher-img.jpg',
            path: 'src/assets/img/boucher-img.jpg',
            cid: 'boucher-img'
        }, {
            filename: 'check-icon.png',
            path: 'src/assets/img/check-icon.png',
            cid: 'check-icon'
        }, {
            filename: 'facebook2x.png',
            path: 'src/assets/img/facebook2x.png',
            cid: 'facebook'
        }, {
            filename: 'instagram2x.png',
            path: 'src/assets/img/instagram2x.png',
            cid: 'instagram'
        }, {
            filename: 'pinterest2x.png',
            path: 'src/assets/img/pinterest2x.png',
            cid: 'pinterest'
        }, {
            filename: 'whatsapp2x.png',
            path: 'src/assets/img/whatsapp2x.png',
            cid: 'whatsapp'
        }, {
            filename: 'youtube2x.png',
            path: 'src/assets/img/youtube2x.png',
            cid: 'youtube'
        }, {
            filename: 'sad-icon.png',
            path: 'src/assets/img/sad-icon.png',
            cid: 'sad-icon'
        }, {
            filename: 'bell-icon.png',
            path: 'src/assets/img/bell-icon.png',
            cid: 'bell-icon'
        }, {
            filename: 'reminder-img.png',
            path: 'src/assets/img/reminder-img.png',
            cid: 'reminder-img'
        }, {
            filename: 'cover-img-0.png',
            path: 'src/assets/img/cover-img-0.png',
            cid: 'cover-img'
        }, {
            filename: 'cover-img-002.png',
            path: 'src/assets/img/cover-img-002.png',
            cid: 'cover-img2'
        }]

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


router.post("/ForgotPassword", (req, res, next) => {
    let otp = Math.floor(100000 + Math.random() * 900000);
    console.log(req.body);
    db.executeSql("select * from users where email='" + req.body.email + "';", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
            return res.json('err');
        } else {
            console.log(data[0]);
            db.executeSql("INSERT INTO `otp`(`userid`, `otp`, `createddate`, `createdtime`,`role`,`isactive`) VALUES (" + data[0].userid + "," + otp + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'" + data[0].role + "',true)", function (data1, err) {
                if (err) {
                    console.log(err);
                } else {
                    const replacements = {
                        votp: otp,
                        email: req.body.email
                    };
                    mail('verification.html', replacements, req.body.email, "Password resetting", " ")
                    res.json(data);
                }
            })

        }
    });
});

router.post("/GetOneTimePassword", (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from otp where userid = '" + req.body.id + "' " + " and otp =' " + req.body.otp + "' ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
// router.post("/ChackForPassword", midway.checkToken, (req, res, next) => {
//     var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
//     var repass = salt + '' + req.body.pass;
//     var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
//     db.executeSql("select * from users where userid=" + req.body.id + " and password='" + encPassword + "'", function(data, err) {
//         if (err) {
//             console.log(err);
//         } else {
//             return res.json(data)
//         }
//     })
// })

router.post("/UpdatePassword", (req, res, next) => {
    console.log(req.body);
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("UPDATE users SET password='" + encPassword + "' WHERE userid=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            console.log("shsyuhgsuygdyusgdyus", data);
            return res.json(data);
        }
    });
});


router.post("/UpdateActiveStatus", (req, res, next) => {
    db.executeSql("UPDATE  `appointment` SET isactive=" + req.body.isactive + ", updatedate=CURRENT_TIMESTAMP,ispayment=true WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetViewAppointment", (req, res, next) => {
    db.executeSql("select * from appointment where custid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/UpdateEnquiryStatus", (req, res, next) => {
    db.executeSql("UPDATE  `enquiry` SET isactive=" + req.body.isactive + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})


router.post("/GetCustomerTotalPoints", (req, res, next) => {
    db.executeSql("select * from point where custid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetAllCustomerDataList", (req, res, next) => {

    db.executeSql("select * from appointment where custid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetCustomerById", (req, res, next) => {
    db.executeSql("select * from customer where uid=" + req.body.id + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            if (data.length > 0) {
                db.executeSql("select * from appointment where custid = " + data[0].id + "", function (data1, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else {

                    }
                    return res.json(data1);
                });
            } else {
                res.json('customer not found');
            }

        }
    })

})
router.post("/SaveRatingsDetails", (req, res, next) => {
    db.executeSql("UPDATE `appointment` SET ratings=" + req.body.ratings + " WHERE id=" + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json('success');
        }
    });
})
router.post("/GetUsedServicesByCustomer", (req, res, next) => {

    db.executeSql("select s.servicesid,s.servicesname,s.custid,s.appointmentid,s.employeename,s.empid,sl.id as slId,sl.price,sl.time,sl.point from custservices s join serviceslist sl on s.servicesid=sl.id where s.appointmentid = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + '-' + mm + '-' + dd;

router.get("/GetAllCompletedServices", (req, res, next) => {
    db.executeSql("select a.id,a.custid,a.totalprice,a.totalpoint,a.totaltime,a.isactive,a.createddate,a.updatedate,c.id as cId,c.fname,c.lname,c.email,c.contact,c.whatsapp,c.gender from appointment a join customer c on a.custid=c.id where a.isactive=false and a.createddate='" + today + "'", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/SaveModeOfPayment", (req, res, next) => {
    db.executeSql("INSERT INTO `payment`(`cid`, `appointmentid`, `cname`, `modeofpayment`, `tprice`, `tpoint`, `pdate`,`createddate`) VALUES (" + req.body.cid + "," + req.body.appointmentid + ",'" + req.body.cname + "','" + req.body.modeofpayment + "'," + req.body.tprice + "," + req.body.tpoint + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            res.json("error");
        } else {

            return res.json("success");
        }
    });
});

router.get("/GetAllModeOfPayment", (req, res, next) => {
    db.executeSql("select * from payment where pdate ='" + today + "' ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.get("/GetMonthlyPayment", (req, res, next) => {
    db.executeSql("select * from payment ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})


router.post("/SaveExpensesList", (req, res, next) => {
    db.executeSql("INSERT INTO expenses (expensesdate, expensesname, expensesprices, employeename, paymenttype) VALUES ('" + req.body.expensesdate + "','" + req.body.expensesname + "','" + req.body.expensesprices + "','" + req.body.employeename + "','" + req.body.paymenttype + "');", function (data, err) {
        console.log(req.body.expensesdate, " , ", req.body.expensesdate);
        if (err) {
            res.json("error");
        } else {

            return res.json(data);
        }
    });
});

router.get("/GetAllExpenses", (req, res, next) => {
    db.executeSql("select * from expenses", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/RemoveExpensesDetails", (req, res, next) => {
    db.executeSql("Delete from expenses where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/UpdateExpensesDetails", (req, res, next) => {
    var newdate = new Date(req.body.expensesdate).getDate() + 1;
    var newMonth = new Date(req.body.expensesdate).getMonth();
    var newyear = new Date(req.body.expensesdate).getFullYear();
    var querydate = new Date(newyear, newMonth, newdate)
    db.executeSql("UPDATE expenses SET expensesdate='" + querydate.toISOString() + "',expensesname='" + req.body.expensesname + "',expensesprices='" + req.body.expensesprices + "',employeename='" + req.body.employeename + "',paymenttype='" + req.body.paymenttype + "' WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.get("/getMonthlyExpensesList", (req, res, next) => {
    db.executeSql("select * from expenses where  DATE_FORMAT(expensesdate, '%m') = DATE_FORMAT(CURRENT_TIMESTAMP, '%m')", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/UpdateCategoryList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `category` SET name='" + req.body.name + "' where id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/SaveCategoryList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `category`( `name`, `isactive`, `createddate`) VALUES ('" + req.body.name + "',true,CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            return res.json('success');
        }
    });
});
router.post("/saveCartList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `cartlist`( `userid`, `productid`, `quantity`,`price`, `createddate`) VALUES ('" + req.body.uid + "','" + req.body.id + "','" + req.body.quant + "'," + req.body.price + ",CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            return res.json('success');
        }
    });
});
router.post("/SavePlaceOrderList", (req, res, next) => {
    db.executeSql("INSERT INTO `orderlist`(`userid`,`totalprice`,`isactive`,`orderdate`,`createddate`) VALUES (" + req.body.uid + "," + req.body.totalprice + ",true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            console.log(data.insertId, req.body.productlist.length);
            for (let i = 0; i < req.body.productlist.length; i++) {
                db.executeSql("INSERT INTO `orderdetails`(`oid`, `uid`, `pid`, `oquant`, `createddate`) VALUES(" + data.insertId + "," + req.body.productlist[i].userid + "," + req.body.productlist[i].Pid + "," + req.body.productlist[i].quantity + ",CURRENT_TIMESTAMP);", function (data1, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else {
                        for (let i = 0; i < req.body.productlist.length; i++) {
                            db.executeSql("DELETE FROM `cartlist` WHERE id=" + req.body.productlist[i].id + "", function (data3, err) {
                                if (err) {
                                    console.log("Error in store.js", err);
                                } else {

                                }
                            });
                        }
                    }
                });
            }
        }
        return res.json('success');
    });
});
router.post("/SavePurchaseServiceList", (req, res, next) => {
    db.executeSql("UPDATE `customer` SET ismembership=true WHERE id=" + req.body.cid + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            for (let i = 0; i < req.body.services.length; i++) {
                db.executeSql("INSERT INTO `purchasedmembership`(`cid`, `memid`, `serid`, `sname`, `quntity`, `tprice`, `discount`, `dprice`, `isactive`, `createddate`) VALUES (" + req.body.cid + "," + req.body.memid + "," + req.body.services[i].serviceid + ",'" + req.body.services[i].servicesname + "'," + req.body.services[i].quantity + "," + req.body.tprice + "," + req.body.discount + "," + req.body.dprice + "," + req.body.isactive + ",CURRENT_TIMESTAMP);", function (data1, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else {
                        if (i == req.body.services.length - 1) {
                            res.json(data1);
                        }
                    }
                });
            }
        }
    })

});

router.get("/GetAllMembershipPurchased", (req, res, next) => {
    db.executeSql("SELECT * FROM purchasedmembership,membership,customer where purchasedmembership.memid=membership.id AND purchasedmembership.cid=customer.id GROUP BY cid,memid;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})
router.post("/GetMembershipPurchasedByID", (req, res, next) => {
    db.executeSql("SELECT * FROM purchasedmembership where cid=" + req.body.cid + " AND memid=" + req.body.memid + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})

router.post("/GetActivatedMembership", (req, res, next) => {
    db.executeSql("SELECT * FROM purchasedmembership where cid=" + req.body.id + " AND isactive=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
})
router.post("/updateCartList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `cartlist` SET quantity=" + req.body.quantity + " where id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/getAllCartList", (req, res, next) => {
    db.executeSql("select * from products , cartlist WHERE products.id=cartlist.productid ", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/removeCartDetails", (req, res, next) => {
    console.log(req.body);
    db.executeSql("Delete from cartlist where userid=" + req.body.userid + " AND id=" + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/RemoveCategoryDetails/:id", (req, res, next) => {
    console.log(req.params.id)
    db.executeSql("Delete from category where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/GetAllCategoryList", (req, res, next) => {
    db.executeSql("select * from category", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/SaveProductsList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `products`(`name`, `image`, `category`, `price`, `quantity`, `purchasedate`, `vendorname`, `vendorcontact`, `descripition`, `isactive`, `createddate`,`display`) VALUES ('" + req.body.name + "','" + req.body.image + "','" + req.body.category + "','" + req.body.price + "','" + req.body.quantity + "','" + req.body.purchasedate + "','" + req.body.vendorname + "','" + req.body.vendorcontact + "','" + req.body.descripition + "',true,CURRENT_TIMESTAMP," + req.body.display + ");", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            for (let i = 0; i < req.body.multi.length; i++) {
                db.executeSql("INSERT INTO `images`(`productid`,`catid`,`listimages`,`createddate`)VALUES(" + data.insertId + ",1,'" + req.body.multi[i] + "',CURRENT_TIMESTAMP);", function (data, err) {
                    if (err) {
                        console.log("Error in store.js", err);
                    } else { }
                });
            }
        }
    });
    return res.json('success');

});
router.get("/GetAllProductsList", (req, res, next) => {
    db.executeSql("select * from products", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.get("/GetActiveProducts", (req, res, next) => {
    db.executeSql("select * from products where display=true", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/RemoveProductDetails/:id", (req, res, next) => {

    db.executeSql("Delete from products where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/UploadProductImage", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/products');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/products/' + req.file.filename);

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
        return res.json('/images/products/' + req.file.filename);

        console.log("You have uploaded this image");
    });
});

router.post("/UploadMultiProductImage", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/listimages');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + '/images/listimages/' + req.file.filename);

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
        return res.json('/images/listimages/' + req.file.filename);
        console.log("You have uploaded this image");
    });
});

router.get("/RemoveRecentUoloadImage", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("SELECT * FROM images ORDER BY createddate DESC LIMIT 1", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.get("/CourosalImage/:id", (req, res, next) => {
    console.log(req.body);
    db.executeSql("SELECT * FROM images, products WHERE  images.productid = products.id AND productid=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.get("/GetCartDataByID/:id", (req, res, next) => {
    db.executeSql("select c.id,c.userid,c.productid,c.quantity,c.price,c.createddate,p.id as Pid,p.name,p.image,p.category,p.price,p.quantity as pquantity,p.vendorname,p.vendorcontact,p.descripition,p.isactive from cartlist c join products p on c.productid=p.id  WHERE c.productid=p.id AND c.userid=" + req.params.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/UpdateProductList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `products` SET name='" + req.body.name + "',descripition='" + req.body.descripition + "',category='" + req.body.category + "',purchasedate='" + req.body.purchasedate + "',quantity=" + req.body.quantity + ",price=" + req.body.price + ",vendorname='" + req.body.vendorname + "',display=" + req.body.display + ",updateddate=CURRENT_TIMESTAMP where id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})
router.post("/Verification", (req, res, next) => {
    let otp = Math.floor(100000 + Math.random() * 900000);
    db.executeSql("INSERT INTO `otp`(`otp`,`createddate`,`createdtime`,`role`,`isactive`,`email`) VALUES (" + otp + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'" + req.body.role + "',true,'" + req.body.email + "')", function (data1, err) {
        if (err) {
            console.log(err);
        } else {
            const replacements = {
                votp: otp,
                email: req.body.email
            };
            mail('verification.html', replacements, req.body.email, "Verify a New Account", " ")
            res.json(data1);
        }
    })
});

router.post("/GetRegisterOtp", (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from otp where email = '" + req.body.email + "'", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });


});

router.post("/SaveUserCustomerList", (req, res, next) => {
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    db.executeSql("INSERT INTO `users`(`email`,`password`,`role`,`isactive`)VALUES('" + req.body.email + "','" + encPassword + "','Customer',true);", function (data, err) {
        if (err) {
            console.log(err)
        } else {
            db.executeSql("INSERT INTO `customer`(`fname`,`lname`,`email`,`contact`,`whatsapp`,`gender`,`createddate`,`uid`,`ismembership`)VALUES('" + req.body.fname + "','" + req.body.lname + "','" + req.body.email + "','" + req.body.contact + "','" + req.body.contact + "','" + req.body.gender + "',CURRENT_TIMESTAMP," + data.insertId + "," + req.body.isMembership + ");", function (data, err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(data);
                }
            });
        }
        return res.json('success');
    });
});

router.post("/SaveVendorList", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `vendor`( `fname`, `gst`, `contact`, `whatsapp`, `address`, `city`, `pincode`, `isactive`, `createdate`, `updatedate`) VALUES ('" + req.body.fname + "','" + req.body.gst + "','" + req.body.contact + "','" + req.body.whatsapp + "','" + req.body.address + "','" + req.body.city + "'," + req.body.pincode + ",true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err)
        } else {

            return res.json('success');
        }
    });
});
router.get("/GetAllVendor", (req, res, next) => {
    db.executeSql("select * from vendor", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.post("/RemoveVendorList", (req, res, next) => {

    console.log(req.body);
    db.executeSql("Delete from vendor where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/UpdateVendorList", (req, res, next) => {
    db.executeSql("UPDATE `vendor` SET fname='" + req.body.fname + "',gst='" + req.body.gst + "',contact='" + req.body.contact + "',whatsapp='" + req.body.whatsapp + "',address='" + req.body.address + "',city='" + req.body.city + "',updatedate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.get("/GetCustDetails", (req, res, next) => {
    db.executeSql("select c.fname,c.lname,c.contact,c.whatsapp,c.email,c.gender from customer c where custid = id" + req.body.id + "", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    });
})

router.post("/GetCustomerDataById", (req, res, next) => {
    console.log(req.body)
    db.executeSql("select * from customer where id = " + req.body.id + "", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
// router.post("/GetCustomerTotalPoints", (req, res, next) => {
//     db.executeSql("select * from point where custid = " + req.body.id + "", function (data, err) {
//         if (err) {
//             console.log("Error in store.js", err);
//         } else {
//             return res.json(data);
//         }
//     });
// })


router.post("/UploadMaterialImage", (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/banners');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/banners/' + req.file.filename);

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
        return res.json('/images/banners/' + req.file.filename);


    });
});

router.post("/SaveWebBanners", (req, res, next) => {
    console.log(req.body);
    db.executeSql("INSERT INTO `webbanners`(`name`,`bannersimage`,`status`)VALUES('" + req.body.name + "','" + req.body.bannersimage + "'," + req.body.status + ");", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            res.json("success");
        }
    });
});

router.get("/GetWebBanners", (req, res, next) => {
    console.log("call-4");
    console.log(req.body.id)
    db.executeSql("select * from webbanners ", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/RemoveWebBanners", (req, res, next) => {
    console.log(req.id)
    db.executeSql("Delete from webbanners where id=" + req.body.id, function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});

router.post("/UpdateActiveWebBanners", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE  `webbanners` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.post("/UpdateActiveOffers", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE  `OFFER` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
router.get("/GetWebBanner", (req, res, next) => {
    db.executeSql("select * from webbanners where status=1", function (data, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            return res.json(data);
        }
    });
});
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
router.post("/removeLastInsertedOTP", (req, res, next) => {
    console.log(req.body)
    db.executeSql("Delete from otp where email='" + req.body.email + "'", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    });
})
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

router.post("/UpdateLogoutDetails", (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE users SET status=false,out_time=CURRENT_TIMESTAMP WHERE userid=" + req.body.userid, function (msg, err) {
        if (err) {
            console.log("Error in store.js", err);
        } else {
            db.executeSql("INSERT INTO `logintime`(`userid`, `login_minute`, `login_date`)VALUES(" + req.body.userid + "," + req.body.loginMinute + ",CURRENT_TIMESTAMP);", function (data, err) {
                if (err) {
                    console.log("Error in store.js", err);
                } else {
                    return res.json('Success');
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