const express = require("express");
const router = express.Router();
const db = require("../db/db");
const multer = require('multer');
const path = require('path');
const config = require("../../config");
var midway = require('./midway');




router.post("/newTradeRequest", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("INSERT INTO `buyer_trade`( `OrderId`, `BuyerName`, `BuyerId`, `BuyerQuantity`, `BuyerRate`, `PaymentTerms`, `BuyerQuality`, `PaymentDays`, `PaymentValidity`,`CreatedDate`) VALUES (null,'" + req.body.buyerName + "'," + req.body.buyerId + ",'" + req.body.quantity + "','" + req.body.buyerRate + "','" + req.body.payment_terms + "','" + req.body.material_quality + "'," + req.body.payment_days + ",'" + req.body.payment_validity + "',CURRENT_TIMESTAMP);", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            let str=new Date();
            let dd=str.getDate();
            let mm=str.getMonth()+1;
            let yyyy=str.getFullYear();
            let orderId=dd+''+mm+''+yyyy+data.insertId;
            db.executeSql("update buyer_trade set OrderId ="+orderId+" where Id="+data.insertId,function(data1,err){
                if(err){
                    console.log(err)
                }else{
                    return res.json('success');
                }
            })
           
        }
    });
});

router.post("/SaveTransporterDetails", midway.checkToken, (req, res, next) => {
    for (let i = 0; i < req.body.length; i++) {
        db.executeSql("INSERT INTO `transport_trade`(`orderId`, `startDate`, `driverContact`, `vehicleNo`, `weightSlip`,`invoiceImage`, `materialQuantity`, `invoiceAmount`, `deliveryStatus`,`CreatedDate`) VALUES ('" + req.body[i].subOrderId + "',CURRENT_TIMESTAMP," + req.body[i].transporterContact + ",'" + req.body[i].transportVehicle + "','" + req.body[i].transportImage + "','" + req.body[i].invoiceImage + "','" + req.body[i].materialQuantity + "'," + req.body[i].invoiceAmount + ",'" + req.body[i].deliveryStatus + "',CURRENT_TIMESTAMP);", function (data, err) {
            if (err) {
                console.log(err);
            } else {
                if(i+1 ==req.body.length){
                    return res.json('success');
                }
            }
        });
    }
   
});
router.post("/SaveDeliveryRecieptData", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `transport_trade` set `EndDate`=CURRENT_TIMESTAMP,`DeliveryReceipt`='" + req.body.DeliveryReciept + "',`DeliveryStatus`='Delivered',`DueDate`='" + req.body.dueDate + "',`UpdatedDate`=CURRENT_TIMESTAMP WHERE Id=" + req.body.Id, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            db.executeSql("update seller_trade set TransportDetailStatus=true where SubOrderId='"+req.body.OrderId+"'",function(data1,err){
                if(err){
                    console.log(err)
                }else{
                    return res.json('success');
                }
            })
           
        }
    })
});
router.post("/SaveBuyerPaymentDetails", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `transport_trade` set `UtrNo`='" + req.body.utrNo + "',`PaymentImage`='" + req.body.paymentImage + "',`PaymentDate`=CURRENT_TIMESTAMP,`UpdatedDate`=CURRENT_TIMESTAMP WHERE Id=" + req.body.TransportId, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json('success');
        }
    })
});
router.post("/GetTransporterDetailsbyIdForSeller", midway.checkToken, (req, res, next) => {
    db.executeSql("SELECT * FROM `transport_trade`WHERE OrderId='" + req.body.tradeId + "';", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })
});
router.post("/getNewTradingDatabyIdForBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("select t.id as tradeId,t.buyerName,t.buyerId,t.req_quality,t.req_quantity,t.payment_terms,t.payment_days,t.payment_validity,t.buyerRate,t.sellerName,t.sellerId,t.sellerQuantity,t.sellerRate,t.materialImage,t.deliveryTerms,t.tradeStatus,t.buyerComissionPay,t.sellerComissionPay,t.transportDetailsStatus,t.createdDate,t.updatedDate from trades where  t.buyerId=" + req.body.uid + " and t.tradeStatus='IDEAL';", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    })
});

router.post("/getAllSellerResponse",midway.checkToken,(req,res,next)=>{
    db.executeSql("select st.OrderId,st.SubOrderId,st.SellerName,st.SellerId,st.SellerQuantity,st.DeliveryTerms,st.TradeStatus,st.BuyerCommisionPay,st.SellerCommisionPay,st.BuyerId,a.street,a.city,a.state,a.pincode,a.landmark,bt.BuyerQuantity,bt.BuyerRate,bt.PaymentTerms,bt.BuyerQuality,bt.PaymentDays,bt.PaymentValidity from seller_trade st left join address a on st.SellerId=a.uid left join buyer_trade bt on bt.OrderId = st.OrderId where st.OrderId="+req.body.orderId+";",function(data1,err){
        if(err){
            console.log(err)
        }else{
           res.json(data1);
        }
    })
})


router.post("/getAllTradingDatabyIdForBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("select t.OrderId,t.BuyerName,t.BuyerId,t.BuyerQuality,t.BuyerQuantity,t.PaymentTerms,t.Paymentdays,t.PaymentValidity,t.BuyerRate,t.CreatedDate,t.UpdatedDate,t.isActive from buyer_trade t  where  t.BuyerId=" + req.body.uid+" and t.isActive=true;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            if(data.length>0){
                for(let i=0;i<data.length;i++){
                    db.executeSql("select * from seller_trade where OrderId="+data[i].OrderId,function(data1,err){
                        if(err){
                            console.log(err)
                        }else{
                            if(data1.length>0){
                                // data[i].push(data1[0]);
                                data[i].TotalResponse = data1.length;
                                data[i].TradeStatus = null;
                                let totalSell=0;
                                data1.forEach(element=>{
                                    totalSell = totalSell+element.SellerQuantity;
                                    if(element.TradeStatus =='ACCEPTED'){
                                        data[i].TradeStatus = element.TradeStatus;
                                    }
                                });
                                data[i].RemainingQuantity = data[i].BuyerQuantity-totalSell;
                                if(i+1 == data.length){
                                    res.json(data);
                                }   
                            }else{
                                data[i].TotalResponse = 0;
                                data[i].RemainingQuantity = data[i].BuyerQuantity;
                                if(i+1 == data.length){
                                    res.json(data);
                                }   
                            }  
                        }
                    })
                }   
            }
        }
    })
});

router.post("/getBillTradingDataForBuyer", midway.checkToken, (req, res, next) => {
    db.executeSql("select t.OrderId,t.BuyerName,t.BuyerId,t.BuyerQuality,t.BuyerQuantity,t.PaymentTerms,t.Paymentdays,t.PaymentValidity,t.BuyerRate,t.CreatedDate,t.UpdatedDate,st.SellerName from buyer_trade t left join seller_trade st on t.OrderId=st.OrderId  where  t.BuyerId=" + req.body.userId+" and st.TransportDetailStatus=true;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            if(data.length>0){
                for(let i=0;i<data.length;i++){
                    db.executeSql("SELECT st.Id , st.OrderId, st.SubOrderId, st.SellerName, st.SellerId, st.SellerQuantity, st.DeliveryTerms, st.TradeStatus, st.BuyerCommisionPay, st.SellerCommisionPay, st.BuyerTotalQuantity, st.BuyerRemainQuantity, st.BuyerId, st.CreatedDate, st.UpdatedDate,st.TransportDetailStatus, tt.Id as TransportId, tt.OrderId, tt.StartDate, tt.EndDate, tt.DriverContact, tt.VehicleNo, tt.WeightSlip, tt.InvoiceImage, tt.MaterialQuantity, tt.InvoiceAmount, tt.DeliveryReceipt, tt.DeliveryStatus, tt.UtrNo, tt.PaymentImage, tt.PaymentDate, tt.DueDate, tt.CreatedDate, tt.UpdatedDate from seller_trade st left join transport_trade tt on st.SubOrderId = tt.OrderId WHERE st.OrderId="+data[i].OrderId+" and st.TransportDetailStatus=true and tt.DeliveryStatus='Delivered'",function(data1,err){
                        if(err){
                            console.log(err)
                        }else{
                            if(data1.length>0){
                                // data[i].push(data1[0]);
                                data[i].TotalResponse = data1.length;
                                data[i].TrasnportDetail = data1
                                data[i].TradeStatus = null;
                                let totalSell=0;
                                data1.forEach(element=>{
                                    totalSell = totalSell+element.SellerQuantity;
                                    if(element.TradeStatus =='ACCEPTED'){
                                        data[i].TradeStatus = element.TradeStatus;
                                    }
                                });
                                data[i].RemainingQuantity = data[i].BuyerQuantity-totalSell;
                                if((i+1) == data.length){
                                    console.log("1111111");
                                    res.json(data);
                                }   
                            }else{
                                data[i].TotalResponse = 0;
                                data[i].RemainingQuantity = data[i].BuyerQuantity;
                                if(i+1 == data.length){
                                    res.json(data);
                                }   
                            }  
                        }
                    })
                }   
            }
        }
    })
});


router.post("/getBillTradingDataForSeller", midway.checkToken, (req, res, next) => {
   
                    db.executeSql("SELECT st.Id , st.OrderId, st.SubOrderId, st.SellerName, st.SellerId, st.SellerQuantity, st.DeliveryTerms, st.TradeStatus, st.BuyerCommisionPay, st.SellerCommisionPay, st.BuyerTotalQuantity, st.BuyerRemainQuantity, st.BuyerId, st.CreatedDate, st.UpdatedDate,st.TransportDetailStatus, tt.Id as TransportId, tt.OrderId, tt.StartDate, tt.EndDate, tt.DriverContact, tt.VehicleNo, tt.WeightSlip, tt.InvoiceImage, tt.MaterialQuantity, tt.InvoiceAmount, tt.DeliveryReceipt, tt.DeliveryStatus, tt.UtrNo, tt.PaymentImage, tt.PaymentDate, tt.DueDate, tt.CreatedDate, tt.UpdatedDate ,u.FirstName as BuyerFirstName,u.LastName as BuyerLastName,ua.street,ua.city,ua.state,ua.pincode from seller_trade st left join transport_trade tt on st.SubOrderId = tt.OrderId left join user u on st.BuyerId=u.Id left join address ua on ua.uid=st.BuyerId WHERE st.SellerId="+req.body.userId+" and st.TransportDetailStatus=true and tt.DeliveryStatus='Delivered'",function(data1,err){
                        if(err){
                            console.log(err)
                        }else{
                            if(data1.length>0){
                                res.json(data1);
                            }  
                        }
                    })
                
});




router.post("/getAllTradingDatabyIdForSeller", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    db.executeSql("select t.OrderId,t.SubOrderId,t.BuyerId,t.BuyerTotalQuantity,t.SellerName,t.SellerId,t.SellerQuantity,t.DeliveryTerms,t.TradeStatus,t.BuyerCommisionPay,t.SellerCommisionPay,t.CreatedDate,a.street,a.city,a.state,a.pincode,a.landmark,u.FirstName as BuyerFirstName,u.LastName as BuyerLastName,bt.BuyerQuantity,bt.BuyerRate,bt.PaymentTerms,bt.PaymentDays,bt.PaymentValidity,bt.BuyerQuality from seller_trade t left join user u on t.BuyerId = u.Id left join address a on t.buyerId = a.uid left join buyer_trade bt on t.OrderId=bt.OrderId where t.sellerId=" + req.body.uid + ";", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            console.log("active req")
            console.log(data)
            res.json(data);
        }
    })
});

router.post("/saveSellerTradeRequest", midway.checkToken, (req, res, next) => {

    db.executeSql("SELECT COUNT(*) as totalTradeBySeller FROM seller_trade where OrderId="+req.body.OrderId,function(data,err){
        if(err){
            console.log(err)
        }else{
            let test = data[0].totalTradeBySeller+1
            let subOrderId =req.body.OrderId+'-'+test;
            db.executeSql("INSERT INTO `seller_trade`( `OrderId`, `SubOrderId`, `SellerName`, `SellerId`, `SellerQuantity`, `DeliveryTerms`, `TradeStatus`,`BuyerTotalQuantity`, `BuyerRemainQuantity`, `BuyerId`,`CreatedDate`) VALUES ("+req.body.OrderId+",'"+subOrderId+"','"+req.body.sellerName+"',"+req.body.sellerId+",'"+req.body.sell_quantity+"','"+req.body.diliveryTerms+"','PENDING',"+req.body.BuyerQuantity+","+(req.body.BuyerQuantity-req.body.sell_quantity)+","+req.body.BuyerId+",CURRENT_TIMESTAMP);", function(data1,err){
                if(err){
                    console.log(err)
                }else{
                    if (req.body.materialMultiImage.length > 0) {
                        for (let i = 0; i < req.body.materialMultiImage.length; i++) {
                            db.executeSql("INSERT INTO `materialimage`(`tradeId`, `image`) VALUES (" + subOrderId + ",'" + req.body.materialMultiImage[i] + "');", function (data1, err) {
                                if (err) {
                                    res.json("error");
                                } else {
                                }
                            });
                        }
                    }
                    return res.json("success");
                }
            })
        }
    })  
})



router.post("/getNewTradingReqForSeller", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    let myArray =  req.body.mat_qlty.split(',');
    let str=new Date();
    let dd=str.getDate();
    let mm=str.getMonth()+1;
    let yyyy=str.getFullYear();
    let order=yyyy+'-'+mm+'-'+dd;
    console.log(order);

    if(myArray.length==1){
        db.executeSql("SELECT t.OrderId, u.FirstName as buyFirstName,t.PaymentDays,t.BuyerId, u.LastName as buyLastName,t.BuyerQuality,t.BuyerQuantity,t.BuyerRate,t.PaymentTerms,t.PaymentValidity, a.street,a.state,a.city,a.pincode from buyer_trade t join user u on u.Id = t.BuyerId join address a on a.uid = t.BuyerId where  t.BuyerQuality='" + myArray[0] + "'and t.PaymentValidity >='"+order+"';", function (data, err) {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        })
    }
    else if(myArray.length ==2){
        db.executeSql("SELECT t.OrderId, u.FirstName as buyFirstName,t.PaymentDays,t.BuyerId, u.LastName as buyLastName,t.BuyerQuality,t.BuyerQuantity,t.BuyerRate,t.PaymentTerms,t.PaymentValidity, a.street,a.state,a.city,a.pincode from buyer_trade t join user u on u.Id = t.BuyerId join address a on a.uid = t.BuyerId where  (t.BuyerQuality='" + myArray[0] + "' OR t.BuyerQuality='" + myArray[1] + "') and t.PaymentValidity >='"+order+"';", function (data, err) {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        })
    }
    else{
        db.executeSql("SELECT t.OrderId, u.FirstName as buyFirstName,t.PaymentDays,t.BuyerId, u.LastName as buyLastName,t.BuyerQuality,t.BuyerQuantity,t.BuyerRate,t.PaymentTerms,t.PaymentValidity, a.street,a.state,a.city,a.pincode from buyer_trade t join user u on u.Id = t.BuyerId join address a on a.uid = t.BuyerId where   (t.BuyerQuality='" + myArray[0] + "' OR t.BuyerQuality='" + myArray[1] + "' OR t.BuyerQuality='" + myArray[2] + "') and t.PaymentValidity >='"+order+"';", function (data, err) {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        })
    }
    
})

router.post("/RegisterNewUser", (req, res, next) => {
    // console.log(req.body);
    db.executeSql("select * from user where Email='" + req.body.email + "'", function (data, err) {
        if (data.length > 0) {
            res.json('duplicate email');
        } else {
            db.executeSql("INSERT INTO `user`(`Salutation`, `FirstName`, `LastName`, `Phone`, `Email`, `Role`, `CompanyName`, `Designation`,`avgMonthTrade`, `GSTNo`, `CompanyContact`, `MaterialQuality`, `KYCStatus`, `CreatedDate`,`ProfileUpdation`) VALUES ('" + req.body.select + "','" + req.body.fname + "','" + req.body.lname + "','" + req.body.contact + "','" + req.body.email + "','" + req.body.regAs + "','" + req.body.companyname + "','" + req.body.designation + "','" + req.body.avg_mnth_trade + "','" + req.body.gstno + "','" + req.body.workphone + "','" + req.body.selectMaterial + "',false,CURRENT_TIMESTAMP,false)", function (data3, err) {
                if (err) {
                    res.json("error");
                } else {
                    db.executeSql("INSERT INTO `address`(`uid`, `street`, `city`, `state`, `pincode`, `landmark`,`createddate`) VALUES (" + data3.insertId + ",'" + req.body.address + "','" + req.body.city + "','" + req.body.selectState + "'," + req.body.pincode + ",'" + req.body.landmark + "',CURRENT_TIMESTAMP)", function (data1, err) {
                        if (err) {
                            res.json("error");
                        } else {
                        }
                    });
                }
            });
        }
        return res.json('sucess');

    })

});


router.post("/completeProfile", midway.checkToken, (req, res, next) => {
    console.log(req.body)
    console.log("req.body")
    db.executeSql("UPDATE `user` SET `FirstName`='" + req.body.FirstName + "',`LastName`='" + req.body.LastName + "',`Phone`='" + req.body.Phone + "',`Email`='" + req.body.Email + "',`CompanyName`='" + req.body.CompanyName + "',`Designation`='" + req.body.Designation + "',`AvgMonthTrade`='" + req.body.AvgMonthTrade + "',`GSTNo`='" + req.body.GSTNo + "',`CompanyContact`='" + req.body.CompanyContact + "',`MaterialQuality`='" + req.body.MaterialQuality + "',`BankName`='" + req.body.BankName + "',`BankAccNo`='" + req.body.BankAccNo + "',`AccType`='" + req.body.AccType + "',`AccHoldeName`='" + req.body.AccHolderName + "',`ISFCCode`='" + req.body.ISFCCode + "',`BranchName`='" + req.body.BranchName + "',`CancelCheque`='" + req.body.CancelCheque + "',`PANCard`='" + req.body.PANCard + "',`UpdatedDate`=CURRENT_TIMESTAMP,`ProfileUpdation`=true WHERE Id=" + req.body.uid, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})

router.get("/getUserDetailById/:id", midway.checkToken, (req, res, next) => {
    db.executeSql("select * from user where Id=" + req.params.id, function (data, err) {
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
    db.executeSql("select * from user where Role='buyer' and KYCStatus=true;", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            return res.json(data);
        }
    })
});
router.post("/NewComissionPaymentForBuyer", midway.checkToken, (req, res, next) => {
    console.log(req.body);
    db.executeSql("UPDATE `seller_trade` set `TradeStatus`='ACCEPTED',`BuyerCommisionPay`=true,`UpdatedDate`=CURRENT_TIMESTAMP WHERE SubOrderId='" + req.body.SubOrderId+"'", function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})

router.post("/NewComissionPaymentForSeller", midway.checkToken, (req, res, next) => {
    db.executeSql("UPDATE `trades` set `sellerComissionPay`=true,`updatedDate`=CURRENT_TIMESTAMP WHERE id=" + req.body.tradeId, function (data, err) {
        if (err) {
            console.log(err);
        } else {
            res.json('success');
        }
    })
})
router.post("/UploadWeightSlipImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/weight');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/weight/' + req.file.filename);

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
        return res.json('/images/weight/' + req.file.filename);


    });
});
router.post("/InvoiceRecieptImageUpload", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/invoice');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/invoice/' + req.file.filename);

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
        return res.json('/images/invoice/' + req.file.filename);


    });
});

router.post("/UploadDeliveryRecieptImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/delivery-reciept');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/delivery-reciept/' + req.file.filename);

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
        return res.json('/images/delivery-reciept/' + req.file.filename);


    });
});

router.post("/UploadPaymentSlipImage", midway.checkToken, (req, res, next) => {
    var imgname = generateUUID();

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'images/payment');
        },
        // By default, multer removes file extensions so let's add them back
        filename: function (req, file, cb) {

            cb(null, imgname + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage }).single('file');
    upload(req, res, function (err) {
        console.log("path=", config.url + 'images/payment/' + req.file.filename);

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
        return res.json('/images/payment/' + req.file.filename);


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