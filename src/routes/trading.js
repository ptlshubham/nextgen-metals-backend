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


router.post("/newTradeRequest", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `trades`( `buyerName`, `buyerLocation`, `buyerId`, `req_quality`, `req_quantity`, `payment_terms`, `payment_days`, `payment_validity`, `buyerRate`, `tradeStatus`) VALUES ('" + req.body.buyerName + "','" + req.body.buyerLocation + "','" + req.body.buyerId + "','" + req.body.material_quality + "','" + req.body.quantity + "','" + req.body.payment_terms + "','" + req.body.payment_days + "','" + req.body.payment_validity + "','" + req.body.buyerRate + "','" + req.body.tradeStatus + "');", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json('sucess');
        }
    });
});

router.post("/getNewTradingDatabyIdForBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from trades where  buyerId=" + req.body.uid + " and tradeStatus='IDEAL';", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })
});


router.post("/getAllTradingDatabyIdForBuyer", midway.checkToken,(req,res,next)=>{
    db.executeSql("select * from trades t left join address a on t.sellerId = a.uid where  t.buyerId="+req.body.uid,function(data,err){
        if(err){
            console.log(err);
        } else {
            res.json(data);
        }
    })
});

router.post("/getAllTradingDatabyIdForSeller", midway.checkToken,(req,res,next)=>{
    console.log("vfvfvfvfvf")
    db.executeSql("select * from trades t left join user u on t.buyerId = u.id left join address a on t.buyerId = a.uid where t.sellerId="+req.body.uid+";",function(data,err){
        if(err){
            console.log(err);
        }else{
            console.log(data)
            res.json(data);
        }
    })
});

router.post("/saveSellerTradeRequest", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `trades` set `sellerName`='" + req.body.name + "',`sellerId`='" + req.body.sellerId + "',`sellerLocation`='" + req.body.sellerLocation + "',`sellerQuantity`='" + req.body.sell_quantity + "',`sellerRate`='null',`materialImage`='" + req.body.materialImage + "',`deliveryTerms`='" + req.body.diliveryterms + "',`tradeStatus`='PENDING',`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body.orderId, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})

router.post("/getNewTradingReqForSeller", midway.checkToken,(req,res,next)=>{
    db.executeSql("SELECT t.id as orderId, u.firstName as buyFirstName,t.payment_days, u.lastName as buyLastName, t.buyerLocation ,t.req_quality,t.req_quantity,t.buyerRate,t.deliveryTerms,t.payment_validity,t.payment_terms, a.street,a.state,a.city,a.pincode from trades t join user u on u.id = t.buyerId join address a on a.uid = t.buyerId where  t.req_quality='"+req.body.mat_qlty+"'  and t.tradeStatus='IDEAL';",function(data,err){
        if(err){
            console.log(err);
        } else {
            res.json(data);
        }
    })
})

router.post("/RegisterNewUser", (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `user`(`salutation`, `firstName`, `lastName`, `phone`, `email`, `role`, `companyName`, `designation`,`avg_mnth_trade`, `GST_no`, `company_contact`, `material_quality`, `KYC_status`, `created_date`) VALUES ('" + req.body.select + "','" + req.body.fname + "','" + req.body.lname + "','" + req.body.contact + "','" + req.body.email + "','" + req.body.regAs + "','" + req.body.companyname + "','" + req.body.designation + "','" + req.body.avg_mnth_trade + "','" + req.body.gstno + "','" + req.body.workphone + "','" + req.body.selectMaterial + "',false,CURRENT_TIMESTAMP)", function (data, err) {
        if (err) {
            res.json("error");
        } else {
            return res.json('sucess');
        }
    });
});


router.post("/completeProfile", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("UPDATE `user` SET `firstName`='" + req.body.firstName + "',`lastName`='" + req.body.lastName + "',`phone`='" + req.body.phone + "',`email`='" + req.body.email + "',`companyName`='" + req.body.companyName + "',`designation`='" + req.body.designation + "',`avg_mnth_trade`='" + req.body.avg_mnth_trade + "',`GST_no`='" + req.body.GST_no + "',`company_contact`='" + req.body.company_contact + "',`material_quality`='" + req.body.material_quality + "',`bank_name`='" + req.body.bank_name + "',`bank_acc_no`='" + req.body.bank_acc_no + "',`acc_type`='" + req.body.acc_type + "',`acc_holder_name`='" + req.body.acc_holder_name + "',`isfc_code`='" + req.body.isfc_code + "',`branch_name`='" + req.body.branch_name + "',`cancel_cheque`='" + req.body.cancel_cheque + "',`PAN_card`='" + req.body.PAN_card + "',`updated_date`=CURRENT_TIMESTAMP,`profileUpdation`=true WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})

router.get("/getUserDetailById/:id", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from user where id=" + req.params.id, function (data, err) {
        if (err) {
            console.log(err)
        }
        else {
            res.json(data)
        }
    })
})

router.get("/getAllUser", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from user;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});

router.get("/getAllBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from user where role='buyer' and KYC_status=true;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/NewComissionPaymentForBuyer", midway.checkToken, (req, res, next) => {
    console.log("req.body")
    db.executeSql("UPDATE `trades` set `tradeStatus`='ACCEPTED',`buyerComissionPay`=true,`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})

router.post("/NewComissionPaymentForSeller", midway.checkToken, (req, res, next) => {
    console.log("req.body")
    db.executeSql("UPDATE `trades` set `sellerComissionPay`=true,`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body.id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})
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