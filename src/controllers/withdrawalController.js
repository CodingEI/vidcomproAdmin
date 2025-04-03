import moment from "moment";
import connection from "../config/connectDB.js";
import axios from "axios";
import path from "path";
import fs from "fs";

export const WITHDRAWAL_METHODS_MAP = {
  USDT_ADDRESS: "USDT_ADDRESS",
  BANK_CARD: "BANK_CARD",
};

export const WITHDRAWAL_STATUS_MAP = {
  PENDING: 0,
  APPROVED: 1,
  DENIED: 2,
};

const addBankCardPage = async (req, res) => {
  return res.render("wallet/addbank.ejs");
};

const selectBankPage = async (req, res) => {
  return res.render("wallet/selectBank.ejs");
};

const addUSDTAddressPage = async (req, res) => {
  return res.render("wallet/addAddress.ejs");
};

const addBankCard = async (req, res) => {
  let timeNow = Date.now();

  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    let bankName = req.body.bankName;
    let recipientName = req.body.recipientName;
    let bankAccountNumber = req.body.bankAccountNumber;
    let phoneNumber = req.body.phoneNumber;
    let IFSC = req.body.IFSC;
    let upiId = req.body.upiId;
    let aadhaar = req.body.aadhaar;
    let pan = req.body.pan;
    let upiImage =
      req.files.upi_image && req.files.upi_image.length > 0
        ? req.files?.upi_image[0]
        : null;

    const supportedTypes = ["BANK_CARD", "USDT_ADDRESS"];

    const type = req.body.type;

    if (!supportedTypes.includes(type)) {
      return res.status(500).json({
        message: "Illegal Type!",
        status: false,
        timeStamp: timeNow,
      });
    }

    // if (
    //   !bankName ||
    //   !recipientName ||
    //   !bankAccountNumber ||
    //   !phoneNumber ||
    //   !IFSC ||
    //   !upiId
    // ) {
    //   return res.status(400).json({
    //     message: "Please fill the required fields",
    //     status: false,
    //     timeStamp: timeNow,
    //   });
    // }

    const user = await getUserDataByAuthToken(auth);

    const account = await AccountDB.getUserBankCard({
      userPhoneNumber: user.phone,
    });

    if (account.isAvailable) {
      const account = await AccountDB.updateUserBankCard({
        userPhoneNumber: user.phone,
        bankName,
        recipientName,
        bankAccountNumber,
        phoneNumber,
        IFSC,
        upiId,
        aadhaar,
        pan,
        upiImage,
      });

      return res.status(200).json({
        account,
        message: "Successfully Updated Bank Card",
        status: true,
        timeStamp: timeNow,
      });
    } else {
      const account = await AccountDB.createUserBankCard({
        userPhoneNumber: user.phone,
        bankName,
        recipientName,
        bankAccountNumber,
        phoneNumber,
        IFSC,
        upiId,
        aadhaar,
        pan,
        upiImage,
      });

      return res.status(200).json({
        account,
        message: "Successfully Created Bank Card",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const getBankCardInfo = async (req, res) => {
  let timeNow = Date.now();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const account = await AccountDB.getUserBankCard({
      userPhoneNumber: user.phone,
    });

    return res.status(200).json({
      account,
      message: "Successfully fetched Bank Card",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const addUSDTAddress = async (req, res) => {
  let timeNow = Date.now();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    let mainNetwork = req.body.mainNetwork;
    let usdtAddress = req.body.usdtAddress;
    let addressAlias = req.body.addressAlias;
    let usdtImage =
      req.files.usdt_image && req.files.usdt_image.length > 0
        ? req.files?.usdt_image[0]
        : null;

    // if (!mainNetwork || !usdtAddress || !addressAlias) {
    //   return res.status(400).json({
    //     message: "Please fill the required fields",
    //     status: false,
    //     timeStamp: timeNow,
    //   });
    // }

    const user = await getUserDataByAuthToken(auth);

    const account = await AccountDB.getUserUSDTAddress({
      userPhoneNumber: user.phone,
    });

    const supportedTypes = ["BANK_CARD", "USDT_ADDRESS"];

    const type = req.body.type;

    if (!supportedTypes.includes(type)) {
      return res.status(500).json({
        message: "Illegal Type!" + type,
        status: false,
        timeStamp: timeNow,
      });
    }

    // if (type === "USDT_IMAGE") {
    //   const account = await AccountDB.getUSDTImage({
    //     userPhoneNumber: user.phone,
    //   });
    //   if (account.isAvailable) {
    //     await AccountDB.updateUsdtImage({
    //       userPhoneNumber: user.phone,
    //       file: req.files.usdt_image[0],
    //     });

    //     return res.status(200).json({
    //       account,
    //       message: "Successfully Updated USDT QR Image",
    //       status: true,
    //       timeStamp: timeNow,
    //     });
    //   } else {
    //     const account = await AccountDB.createUsdtImage({
    //       userPhoneNumber: user.phone,
    //       file: req.files.usdt_image[0],
    //     });

    //     return res.status(200).json({
    //       account,
    //       message: "Successfully Added USDT QR Image",
    //       status: true,
    //       timeStamp: timeNow,
    //     });
    //   }
    // }

    if (account.isAvailable) {
      const account = await AccountDB.updateUserUSDTAddress({
        userPhoneNumber: user.phone,
        mainNetwork,
        usdtAddress,
        addressAlias,
        usdtImage,
      });

      return res.status(200).json({
        account,
        message: "Successfully Updated USDT Address",
        status: true,
        timeStamp: timeNow,
      });
    } else {
      const account = await AccountDB.createUserUSDTAddress({
        userPhoneNumber: user.phone,
        mainNetwork,
        usdtAddress,
        addressAlias,
        usdtImage,
      });

      return res.status(200).json({
        account,
        message: "Successfully Created USDT Address",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const getUSDTAddressInfo = async (req, res) => {
  let timeNow = Date.now();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const account = await AccountDB.getUserUSDTAddress({
      userPhoneNumber: user.phone,
    });

    return res.status(200).json({
      account,
      message: "Successfully fetched USDT Address",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const createWithdrawalRequest = async (req, res) => {
  let timeNow = Date.now();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    let withdrawalMethod = req.body.withdrawalMethod;
    let amount = req.body.amount || 0;
    let AllowedWithdrawAmount = req.body.AllowedWithdrawAmount || false;
    let totalBetAmountRemaining = req.body.totalBetAmountRemaining || 0;

    if (!withdrawalMethod) {
      return res.status(400).json({
        message: "Please select the Withdrawal Method of your choice!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (
      WITHDRAWAL_METHODS_MAP.BANK_CARD !== withdrawalMethod &&
      WITHDRAWAL_METHODS_MAP.USDT_ADDRESS !== withdrawalMethod
    ) {
      return res.status(400).json({
        message: "Please select a valid the Withdrawal Method!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    if (user.restricted == 1) {
      return res.status(400).json({
        message: "You are restricted from making withdrawals. Contact support.",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [rechargeRow] = await connection.query(
      "SELECT * FROM recharge WHERE phone = ? AND status = 1",
      [user.phone],
    );

    if (rechargeRow.length === 0) {
      return res.status(400).json({
        message: "You must deposit first to withdraw",
        status: false,
        timeStamp: timeNow,
      });
    }

    // const [settings] = await connection.execute(
    //   "SELECT minimum_withdrawal, maximum_withdrawal_time_per_day FROM admin_ac",
    // );

    let account = { isAvailable: false };

    if (WITHDRAWAL_METHODS_MAP.BANK_CARD === withdrawalMethod) {
      account = await AccountDB.getUserBankCard({
        userPhoneNumber: user.phone,
      });
    } else {
      account = await AccountDB.getUserUSDTAddress({
        userPhoneNumber: user.phone,
      });
    }

    if (!account.isAvailable) {
      return res.status(400).json({
        message: "Please add your withdrawal method first!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const minimumMoneyAllowed =
      withdrawalMethod === WITHDRAWAL_METHODS_MAP.BANK_CARD
        ? parseInt(process.env.MINIMUM_WITHDRAWAL_MONEY_INR)
        : parseInt(process.env.MINIMUM_WITHDRAWAL_MONEY_USDT);

    const [[setting]] = await connection.execute(
      "SELECT financial_setting FROM admin_ac WHERE id = 1",
    );
    const usdtExchangeRate = JSON.parse(
      setting.financial_setting,
    ).usdtExchangeRate;

    let actualAmount =
      withdrawalMethod === WITHDRAWAL_METHODS_MAP.BANK_CARD
        ? parseInt(amount) - parseFloat()
        : parseInt(amount) * parseInt(usdtExchangeRate);

    if (amount < minimumMoneyAllowed) {
      return res.status(400).json({
        message: `You can withdraw minimum balance of ${withdrawalMethod === WITHDRAWAL_METHODS_MAP.BANK_CARD ? "₹" : "$"} ${minimumMoneyAllowed}`,
        status: false,
        timeStamp: timeNow,
      });
    }

    if (Number(user.withdrawable_money) < Number(actualAmount)) {
      return res.status(400).json({
        message: "The balance is not enough to fulfill the request",
        status: false,
        timeStamp: timeNow,
      });
    }

    // const totalBettingAmount = await gamesDB.getTotalBettingAmount({ userPhoneNumber: user.phone })
    // const totalDepositAmount = await depositDB.getTotalDeposit({ userPhoneNumber: user.phone })
    // const result = totalDepositAmount - totalBettingAmount > 0 ? totalDepositAmount - totalBettingAmount : 0

    // if (!AllowedWithdrawAmount) {
    //   return res.status(400).json({
    //     message: "You must bet ₹ " + totalBetAmountRemaining + " to withdraw",
    //     status: false,
    //     timeStamp: timeNow,
    //   });
    // }

    if (withdrawalMethod === WITHDRAWAL_METHODS_MAP.BANK_CARD) {
      const withd = await connection.query(
        "UPDATE users SET withdrawable_money = withdrawable_money - ?, total_money = total_money - ? WHERE `phone` = ?",
        [amount, amount, user.phone],
      );

      withdrawDB.createBankCardWithdrawalRequest({
        userPhoneNumber: user.phone,
        bankName: account.bankName,
        recipientName: account.recipientName,
        bankAccountNumber: account.bankAccountNumber,
        IFSC: account.IFSC,
        upiId: account.upiId,
        upiImage: account.upiImage || "",
        amount: amount,
      });

      return res.status(200).json({
        message: "Withdrawal request registered Successfully!",
        status: true,
        timeStamp: timeNow,
      });
    }

    if (withdrawalMethod === WITHDRAWAL_METHODS_MAP.USDT_ADDRESS) {
      const withd = await connection.query(
        "UPDATE users SET withdrawable_money = withdrawable_money - ?, total_money = total_money - ? WHERE `phone` = ? AND money >= ?",
        [actualAmount, actualAmount, user.phone, amount],
      );

      withdrawDB.createUSDTWithdrawalRequest({
        userPhoneNumber: user.phone,
        mainNetwork: account.mainNetwork,
        usdtAddress: account.usdtAddress,
        addressAlias: account.addressAlias,
        usdtImage: account.usdtImage || "",
        amount: amount,
      });

      return res.status(200).json({
        message: "Withdrawal request registered Successfully!",
        status: true,
        timeStamp: timeNow,
      });
    }

    return res.status(400).json({
      message: "Please select a valid the Withdrawal Method!",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const listWithdrawalRequests = async (req, res) => {
  let timeNow = Date.now();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const withdraw = await withdrawDB.getWithdrawalList({
      status: WITHDRAWAL_STATUS_MAP.PENDING,
    });

    const [[adminAc]] = await connection.execute(
      `SELECT * FROM admin_ac LIMIT 1`,
    );

    let financialSettings = adminAc.financial_setting
      ? JSON.parse(adminAc.financial_setting)
      : {};

    return res.status(200).json({
      message: "Withdrawal request fetched!",
      withdrawList: withdraw.isAvailable ? withdraw.withdrawalList : [],
      financialSettings,
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const listWithdrawalHistory = async (req, res) => {
  let timeNow = Date.now();
  try {
    let auth = req.cookies.auth;

    if (!auth) {
      return res.status(400).json({
        message: "Auth is required to fulfill the request!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const user = await getUserDataByAuthToken(auth);

    const withdraw = await withdrawDB.getWithdrawalList({
      status: undefined,
      userPhoneNumber: user.phone,
    });

    return res.status(200).json({
      message: "Withdrawal request fetched!",
      withdrawList: withdraw.isAvailable ? withdraw.withdrawalList : [],
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const approveOrDenyWithdrawalRequest = async (req, res) => {
  let timeNow = Date.now();
  try {
    let auth = req.cookies.auth;
    let id = req.body.id;
    let status = req.body.status;
    let remarks = req.body.remarks;
    const receipt = req.file;

    if (!auth) {
      return res.status(400).json({
        message: "Admin authentication is required!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!id || !status) {
      return res.status(400).json({
        message: "Please Provide the required fields!",
        status: false,
        timeStamp: timeNow,
      });
    }
    const withdraw = await withdrawDB.getWithdrawalById(id);

    if (!withdraw.isAvailable) {
      return res.status(400).json({
        message: "Withdrawal request not found!",
        status: false,
        timeStamp: timeNow,
      });
    }
    if (status == WITHDRAWAL_STATUS_MAP.APPROVED) {
      let uploadedReceipt = "";

      if (receipt) {
        const ext = receipt.originalname.split(".").pop();
        const filename = `${Date.now()}.${ext}`;
        const filepath = path.join(
          path.resolve(),
          "src",
          "public",
          "uploads",
          filename,
        );
        fs.writeFileSync(filepath, receipt.buffer);
        uploadedReceipt = filename;
      }

      await connection.execute(
        `UPDATE withdraw SET status = 1, remarks = ?, receipt = ? WHERE id = ?`,
        [remarks, uploadedReceipt, id],
      );
      return res.status(200).json({
        message: "Approved, Withdrawal Request!",
        status: true,
        timeStamp: timeNow,
      });
    }

    const [[adminAc]] = await connection.execute(
      `SELECT * FROM admin_ac LIMIT 1`,
    );

    let financialSettings = adminAc.financial_setting
      ? JSON.parse(adminAc.financial_setting)
      : {};

    if (status == WITHDRAWAL_STATUS_MAP.DENIED) {
      const amount = Number(withdraw.withdrawal.amount);
      let actualAmount =
        withdraw.withdrawal.type === WITHDRAWAL_METHODS_MAP.BANK_CARD
          ? Number(amount)
          : Number(amount) * Number(financialSettings.usdtExchangeRate);
      console.log("amount", withdraw.withdrawal.phoneNumber);
      console.log("amount", withdraw.withdrawal);

      console.log("amount", amount);
      console.log("actualAmount", actualAmount);
      await connection.query(
        `UPDATE withdraw SET status = 2, remarks = ? WHERE id = ?`,
        [remarks, id],
      );

      await connection.query(
        "UPDATE users SET withdrawable_money = withdrawable_money + ? WHERE phone = ? ",
        [actualAmount, withdraw.withdrawal.phoneNumber],
      );

      return res.status(200).json({
        message: "Denied Withdrawal Request!",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const approveAndInitiateAquapayWithdrawalRequest = async (req, res) => {
  let timeNow = Date.now();
  try {
    let auth = req.cookies.auth;
    let id = req.body.id;
    let password = req.body.password;

    if (!auth) {
      return res.status(400).json({
        message: "Admin authentication is required!",
        status: false,
        timeStamp: timeNow,
      });
    }

    if (!id) {
      return res.status(400).json({
        message: "Please Provide the required fields!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const withdraw = await withdrawDB.getWithdrawalById(id);

    if (!withdraw.isAvailable) {
      return res.status(400).json({
        message: "Withdrawal request not found!",
        status: false,
        timeStamp: timeNow,
      });
    }

    console.log("withdraw", {
      amount: withdraw.withdrawal.amount,
      accountName: withdraw.withdrawal.recipientName,
      accountNumber: withdraw.withdrawal.bankAccountNumber,
      ifscCode: withdraw.withdrawal.IFSC,
      username: process.env.AQUA_PAY_USERNAME,
      password: password,
      callbackUrl: `${process.env.APP_BASE_URL}/api/withdrawal/aqua_callback`,
    });

    const response = await axios({
      method: "post",
      url: "https://api.cpmall.co.in/api/external/initiate_payout",
      data: {
        amount: withdraw.withdrawal.amount,
        accountName: withdraw.withdrawal.recipientName,
        accountNumber: withdraw.withdrawal.bankAccountNumber,
        ifscCode: withdraw.withdrawal.IFSC,
        remark: "Payout is initiated from auto withdrawal system",
        username: process.env.AQUA_PAY_USERNAME,
        password: password,
        callbackUrl: `${process.env.APP_BASE_URL}/api/withdrawal/aqua_callback`,
      },
    });

    console.log("response", response.data);

    const remarks = `
      Payout is bing processed by our partnered banks. It will be credited to your account within 24 hours.
    `;

    await connection.execute(
      `UPDATE withdraw SET status = 1, remarks = ?, order_id = ? WHERE id = ?`,
      [remarks, response.data.data.orderId, id],
    );

    return res.status(200).json({
      message: "Approved Withdrawal Request!",
      status: true,
      timeStamp: timeNow,
    });
  } catch (error) {
    console.log(error?.response?.data);
    return res.status(500).json({
      message: error?.response?.data?.message || "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

const verifyAquapayWithdrawalRequest = async (req, res) => {
  let timeNow = Date.now();
  try {
    let orderId = req.body.orderId;
    let state = req.body.state;
    let amount = req.body.amount;

    if (!orderId || !state || !amount) {
      return res.status(400).json({
        message: "Please Provide the required fields!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const [rows] = await connection.query(
      "SELECT * FROM withdraw WHERE `order_id` = ?",
      [orderId],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Withdrawal request not found!",
        status: false,
        timeStamp: timeNow,
      });
    }

    const withdraw = rows[0];

    if (state === 1) {
      const remarks = `
        The payout has been successfully processed and credited to your account.
      `;

      await connection.execute(`UPDATE withdraw SET remarks = ? WHERE id = ?`, [
        remarks,
        withdraw.id,
      ]);

      return res.status(200).json({
        message: "Confirmed Withdrawal Request!",
        status: true,
        timeStamp: timeNow,
      });
    }

    if (state === 3) {
      const remarks = `
        The payout was declined by the bank. Please check the details and try again.
      `;

      await connection.query(
        `UPDATE withdraw SET status = 2, remarks = ? WHERE id = ?`,
        [remarks, withdraw.id],
      );

      await connection.query(
        "UPDATE users SET money = money + ? WHERE phone = ?",
        [withdraw.money, withdraw.phone],
      );

      return res.status(200).json({
        message: "Denied Withdrawal Request!",
        status: true,
        timeStamp: timeNow,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong!",
      status: false,
      timeStamp: timeNow,
    });
  }
};

// helpers ---------------
const getUserDataByAuthToken = async (authToken) => {
  let [users] = await connection.query(
    "SELECT `phone`, `code`,`name_user`,`invite`,`money`, `withdrawable_money` FROM users WHERE `token` = ? ",
    [authToken],
  );
  const user = users?.[0];

  if (user === undefined || user === null) {
    throw Error("Unable to get user data!");
  }

  return {
    phone: user.phone,
    code: user.code,
    username: user.name_user,
    invite: user.invite,
    money: user.money,
    withdrawable_money: user.withdrawable_money,
  };
};

const AccountDB = {
  async getUserBankCard({ userPhoneNumber }) {
    const type = WITHDRAWAL_METHODS_MAP.BANK_CARD;

    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      id: account.id,
      userPhoneNumber: account.phone,
      bankName: account.name_bank,
      recipientName: account.name_user,
      bankAccountNumber: account.stk,
      phoneNumber: account.tinh,
      IFSC: account.chi_nhanh,
      aadhaar: account.aadhaar,
      pan: account.pan,
      upiId: account.sdt,
      upiImage: account.upi_image,
      usdtImage: account.usdt_image,
      type,
    };
  },
  async getUserBankCard({ userPhoneNumber }) {
    const type = WITHDRAWAL_METHODS_MAP.BANK_CARD;
    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      id: account.id,
      userPhoneNumber: account.phone,
      bankName: account.name_bank,
      recipientName: account.name_user,
      bankAccountNumber: account.stk,
      phoneNumber: account.tinh,
      IFSC: account.chi_nhanh,
      aadhaar: account.aadhaar,
      pan: account.pan,
      upiId: account.sdt,
      upiImage: account.upi_image,
      usdtImage: account.usdt_image,
      type,
    };
  },
  async createUserBankCard({
    userPhoneNumber,
    bankName,
    recipientName,
    bankAccountNumber,
    phoneNumber,
    IFSC,
    upiId,
    aadhaar,
    pan,
    upiImage,
  }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.BANK_CARD;

    let upIImagefilename = "";

    if (upiImage) {
      const ext = upiImage.originalname.split(".").pop();

      const filename = `${Date.now()}.${ext}`;
      const filepath = path.join(
        path.resolve(),
        "src",
        "public",
        "uploads",
        filename,
      );
      upIImagefilename = filename;
      fs.writeFileSync(filepath, upiImage.buffer);
    }

    await connection.query(
      `INSERT INTO user_bank SET phone = '${userPhoneNumber}', name_bank = '${bankName}', name_user = '${recipientName}', stk = '${bankAccountNumber}', tinh = '${phoneNumber}', chi_nhanh = '${IFSC}', aadhaar = '${aadhaar}' , pan = '${pan}' , upi_image = '${upIImagefilename || ""}' , sdt = '${upiId}', tp = '${type}', time = '${time}'`,
    );

    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isCreated: false,
      };
    }

    return {
      isCreated: true,
      userPhoneNumber: account.phone,
      bankName: account.name_bank,
      recipientName: account.name_user,
      bankAccountNumber: account.stk,
      phoneNumber: account.tinh,
      IFSC: account.chi_nhanh,
      aadhaar: account.aadhaar,
      pan: account.pan,
      upiId: account.sdt,
      type,
    };
  },
  async updateUserBankCard({
    userPhoneNumber,
    bankName,
    recipientName,
    bankAccountNumber,
    phoneNumber,
    IFSC,
    upiId,
    aadhaar,
    pan,
    upiImage,
  }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.BANK_CARD;

    let [oldAccounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    let oldUpiImage = oldAccounts[0].upi_image;

    if (upiImage) {
      if (
        oldUpiImage &&
        fs.existsSync(
          path.join(path.resolve(), "src", "public", "uploads", oldUpiImage),
        )
      ) {
        fs.unlinkSync(
          path.join(path.resolve(), "src", "public", "uploads", oldUpiImage),
        );
      }

      const ext = upiImage.originalname.split(".").pop();

      const filename = `${Date.now()}.${ext}`;
      const filepath = path.join(
        path.resolve(),
        "src",
        "public",
        "uploads",
        filename,
      );
      oldUpiImage = filename;
      fs.writeFileSync(filepath, upiImage.buffer);
    }

    await connection.query(
      `UPDATE user_bank SET name_bank = '${bankName}', name_user = '${recipientName}', stk = '${bankAccountNumber}', tinh = '${phoneNumber}', aadhaar = '${aadhaar}', pan = '${pan}' , chi_nhanh = '${IFSC}', sdt = '${upiId}', time = '${time}', upi_image = '${oldUpiImage}' WHERE phone = '${userPhoneNumber}' AND tp = '${type}'`,
    );

    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isCreated: false,
      };
    }

    return {
      isAvailable: true,
      userPhoneNumber: account.phone,
      bankName: account.name_bank,
      recipientName: account.name_user,
      bankAccountNumber: account.stk,
      phoneNumber: account.tinh,
      IFSC: account.chi_nhanh,
      upiId: account.sdt,
      account: account.aadhaar,
      pain: account.pan,
      type,
    };
  },
  async getUserUSDTAddress({ userPhoneNumber }) {
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;
    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      id: account.id,
      userPhoneNumber: account.phone,
      mainNetwork: account.name_bank,
      usdtAddress: account.stk,
      addressAlias: account.sdt,
      usdtImage: account.usdt_image,
      type,
    };
  },
  async createUserUSDTAddress({
    userPhoneNumber,
    mainNetwork,
    usdtAddress,
    addressAlias,
    usdtImage,
  }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;

    let usdtImagefilename = "";

    if (usdtImage) {
      const ext = usdtImage.originalname.split(".").pop();

      const filename = `${Date.now()}.${ext}`;
      const filepath = path.join(
        path.resolve(),
        "src",
        "public",
        "uploads",
        filename,
      );
      usdtImagefilename = filename;
      fs.writeFileSync(filepath, usdtImage.buffer);
    }

    console.log({ usdtImage, usdtImagefilename });

    await connection.query(
      `INSERT INTO user_bank SET phone = '${userPhoneNumber}', name_bank =' ${mainNetwork}', stk = '${usdtAddress}', sdt = '${addressAlias}', tp = '${type}', time = '${time}', usdt_image = '${usdtImagefilename}'`,
    );

    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isCreated: false,
      };
    }

    return {
      isCreated: true,
      userPhoneNumber: account.phone,
      mainNetwork: account.name_bank,
      usdtAddress: account.stk,
      addressAlias: account.sdt,
      type,
    };
  },
  async updateUserUSDTAddress({
    userPhoneNumber,
    mainNetwork,
    usdtAddress,
    addressAlias,
    usdtImage,
  }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;

    let [oldAccounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const oldAcc = oldAccounts?.[0];

    let oldUsdtImage = oldAcc.usdt_image;

    if (usdtImage) {
      if (
        oldUsdtImage &&
        fs.existsSync(
          path.join(path.resolve(), "src", "public", "uploads", oldUsdtImage),
        )
      ) {
        fs.unlinkSync(
          path.join(path.resolve(), "src", "public", "uploads", oldUsdtImage),
        );
      }

      const ext = usdtImage.originalname.split(".").pop();

      const filename = `${Date.now()}.${ext}`;
      const filepath = path.join(
        path.resolve(),
        "src",
        "public",
        "uploads",
        filename,
      );
      oldUsdtImage = filename;
      fs.writeFileSync(filepath, usdtImage.buffer);
    }

    await connection.query(
      `UPDATE user_bank SET name_bank = '${mainNetwork}', stk = '${usdtAddress}', sdt = '${addressAlias}',  usdt_image = '${oldUsdtImage}' , time = '${time}' WHERE phone = '${userPhoneNumber}' AND tp = '${type}'`,
    );

    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      userPhoneNumber: account.phone,
      mainNetwork: account.name_bank,
      usdtAddress: account.stk,
      addressAlias: account.sdt,
      type,
    };
  },

  async getUPIImage({ userPhoneNumber }) {
    const type = WITHDRAWAL_METHODS_MAP.BANK_CARD;
    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      id: account.id,
      userPhoneNumber: account.phone,
      upiImage: account.upi_image,
      type,
    };
  },
  async createUpiImage({ userPhoneNumber, file }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.BANK_CARD;

    const ext = file.originalname.split(".").pop();

    const filename = `${Date.now()}.${ext}`;
    const filepath = path.join(
      path.resolve(),
      "src",
      "public",
      "uploads",
      filename,
    );

    fs.writeFile(filepath, file.buffer, async (err) => {
      if (err) {
        console.log(file.buffer);
        console.log(err);
      }

      await connection.query(
        `INSERT INTO user_bank SET upi_image = '${filename}', phone = '${userPhoneNumber}', tp = '${type}', time = '${time}'`,
      );

      let [accounts] = await connection.query(
        "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
        [userPhoneNumber, type],
      );

      const account = accounts?.[0];

      if (account === undefined || account === null) {
        return {
          isCreated: false,
        };
      }

      return {
        isCreated: true,
        userPhoneNumber: account.phone,
        upiImage: account.upi_image,
        type,
      };
    });
  },
  async updateUpiImage({ userPhoneNumber, file }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.BANK_CARD;

    const ext = file.originalname.split(".").pop();

    const filename = `${Date.now()}.${ext}`;
    const filepath = path.join(
      path.resolve(),
      "src",
      "public",
      "uploads",
      filename,
    );

    let [rows] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    if (rows.length > 0) {
      if (
        rows[0].upi_image &&
        fs.existsSync(
          path.join(
            path.resolve(),
            "src",
            "public",
            "uploads",
            rows[0].upi_image,
          ),
        )
      ) {
        fs.unlinkSync(
          path.join(
            path.resolve(),
            "src",
            "public",
            "uploads",
            rows[0].upi_image,
          ),
        );
      }
    }

    fs.writeFile(filepath, file.buffer, async (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Failed to save image", error: err });
      }

      await connection.query(
        `UPDATE user_bank SET stk = '', name_bank ='', name_user = '', tinh = '', sdt = '', chi_nhanh = '', aadhaar = '', pan = '',   upi_image = '${filename}' WHERE phone = '${userPhoneNumber}' AND tp = '${type}'`,
      );

      let [accounts] = await connection.query(
        "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
        [userPhoneNumber, type],
      );

      const account = accounts?.[0];

      if (account === undefined || account === null) {
        return {
          isAvailable: false,
        };
      }

      return {
        isAvailable: true,
        userPhoneNumber: account.phone,
        upiImage: account.upi_image,
        type,
      };
    });
  },

  //
  async getUSDTImage({ userPhoneNumber }) {
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;
    let [accounts] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    const account = accounts?.[0];

    if (account === undefined || account === null) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      id: account.id,
      userPhoneNumber: account.phone,
      usdtImage: account.usdt_image,
      type,
    };
  },
  async createUsdtImage({ userPhoneNumber, file }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;

    const ext = file.originalname.split(".").pop();

    const filename = `${Date.now()}.${ext}`;
    const filepath = path.join(
      path.resolve(),
      "src",
      "public",
      "uploads",
      filename,
    );

    fs.writeFile(filepath, file.buffer, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to save image", error: err });
      }

      await connection.query(
        `INSERT INTO user_bank SET usdt_image = '${filename}', phone = '${userPhoneNumber}', tp = '${type}', time = '${time}'`,
      );

      let [accounts] = await connection.query(
        "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
        [userPhoneNumber, type],
      );

      const account = accounts?.[0];

      if (account === undefined || account === null) {
        return {
          isCreated: false,
        };
      }

      return {
        isCreated: true,
        userPhoneNumber: account.phone,
        usdtImage: account.usdt_image,
        type,
      };
    });
  },
  async updateUsdtImage({ userPhoneNumber, file }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;

    const ext = file.originalname.split(".").pop();

    const filename = `${Date.now()}.${ext}`;
    const filepath = path.join(
      path.resolve(),
      "src",
      "public",
      "uploads",
      filename,
    );

    let [rows] = await connection.query(
      "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
      [userPhoneNumber, type],
    );

    if (rows.length > 0) {
      if (
        fs.existsSync(
          path.join(
            path.resolve(),
            "src",
            "public",
            "uploads",
            rows[0].usdt_image,
          ),
        )
      ) {
        fs.unlinkSync(
          path.join(
            path.resolve(),
            "src",
            "public",
            "uploads",
            rows[0].usdt_image,
          ),
        );
      }
    }

    fs.writeFile(filepath, file.buffer, async (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to save image", error: err });
      }

      await connection.query(
        `UPDATE user_bank SET usdt_image = '${filename}' WHERE phone = '${userPhoneNumber}' AND tp = '${type}'`,
      );

      let [accounts] = await connection.query(
        "SELECT * FROM user_bank WHERE `phone` = ? AND `tp` = ?",
        [userPhoneNumber, type],
      );

      const account = accounts?.[0];

      if (account === undefined || account === null) {
        return {
          isAvailable: false,
        };
      }

      return {
        isAvailable: true,
        userPhoneNumber: account.phone,
        usdtImage: account.usdtImage,
        type,
      };
    });
  },
};

const getTodayString = () => {
  return moment().format("YYYY-MM-DD h:mm:ss A");
};
const getOrderId = () => {
  const date = new Date();
  let id_time =
    date.getUTCFullYear() +
    "" +
    date.getUTCMonth() +
    1 +
    "" +
    date.getUTCDate();
  let id_order =
    Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) +
    10000000000000;

  return id_time + "" + id_order;
};

export const withdrawDB = {
  async getWithdrawalById(id) {
    let [withdrawalList] = await connection.query(
      "SELECT * FROM withdraw WHERE `id` = ?",
      [id],
    );

    if (withdrawalList.length === 0) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      withdrawal: withdrawalList.map((item) => {
        if (item.tp === WITHDRAWAL_METHODS_MAP.BANK_CARD) {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            bankName: item.name_bank,
            recipientName: item.name_user,
            bankAccountNumber: item.stk,
            IFSC: item.ifsc,
            upiId: item.sdt,
            type: item.tp,
            time: item.time,
            today: item.today,
            amount: item.money,
            remarks: item.remarks,
          };
        } else if (item.tp === WITHDRAWAL_METHODS_MAP.USDT_ADDRESS) {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            mainNetwork: item.name_bank,
            usdtAddress: item.stk,
            addressAlias: item.sdt,
            type: item.tp,
            time: item.time,
            today: item.today,
            amount: item.money,
            remarks: item.remarks,
          };
        } else {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            bankName: item.name_bank,
            recipientName: item.name_user,
            bankAccountNumber: item.stk,
            IFSC: item.ifsc,
            upiId: item.sdt,
            type: item.tp,
            time: item.time,
            today: item.today,
            amount: item.money,
            remarks: item.remarks,
          };
        }
      })?.[0],
    };
  },
  async getWithdrawalList({ userPhoneNumber, status }) {
    let [withdrawalList] =
      status === undefined
        ? await connection.query("SELECT * FROM withdraw WHERE `phone` = ?", [
            userPhoneNumber,
          ])
        : userPhoneNumber
          ? await connection.query(
              "SELECT * FROM withdraw WHERE `phone` = ? AND `status` = ?",
              [userPhoneNumber, status],
            )
          : await connection.query(
              "SELECT * FROM withdraw WHERE `status` = ?",
              [status],
            );

    if (withdrawalList.length === 0) {
      return {
        isAvailable: false,
      };
    }

    return {
      isAvailable: true,
      withdrawalList: withdrawalList.map((item) => {
        if (item.tp === WITHDRAWAL_METHODS_MAP.BANK_CARD) {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            bankName: item.name_bank,
            recipientName: item.name_user,
            bankAccountNumber: item.stk,
            IFSC: item.ifsc,
            upiId: item.sdt,
            upiImage: item.upi_image,
            receipt: item.receipt,
            type: item.tp,
            time: item.time,
            today: item.today,
            amount: item.money,
            remarks: item.remarks,
          };
        } else if (item.tp === WITHDRAWAL_METHODS_MAP.USDT_ADDRESS) {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            mainNetwork: item.name_bank,
            usdtAddress: item.stk,
            addressAlias: item.sdt,
            type: item.tp,
            receipt: item.receipt,
            time: item.time,
            usdtImage: item.usdt_image,
            today: item.today,
            amount: item.money,
            remarks: item.remarks,
          };
        } else {
          return {
            id: item.id,
            orderId: item.id_order,
            phoneNumber: item.phone,
            status: item.status,
            bankName: item.name_bank,
            recipientName: item.name_user,
            bankAccountNumber: item.stk,
            IFSC: item.ifsc,
            upiId: item.sdt,
            type: item.tp,
            receipt: item.receipt,
            upiImage: item.upi_image,
            usdtImage: item.usdt_image,
            time: item.time,
            today: item.today,
            amount: item.money,
            remarks: item.remarks,
          };
        }
      }),
    };
  },
  async createUSDTWithdrawalRequest({
    userPhoneNumber,
    mainNetwork,
    usdtAddress,
    addressAlias,
    usdtImage,
    amount,
  }) {
    let time = new Date().getTime();
    const type = WITHDRAWAL_METHODS_MAP.USDT_ADDRESS;

    await connection.query(
      `INSERT INTO withdraw SET id_order = '${getOrderId()}', phone = '${userPhoneNumber}', name_bank = '${mainNetwork}', stk = '${usdtAddress}', sdt = '${addressAlias}', usdt_image = '${usdtImage}', tp = '${type}', time = '${time}', today = '${getTodayString()}', money = '${amount}'`,
    );
  },
  async createBankCardWithdrawalRequest({
    userPhoneNumber,
    bankName,
    recipientName,
    bankAccountNumber,
    IFSC,
    upiId,
    upiImage,
    amount,
  }) {
    let time = new Date().getTime(); //phoneNumber
    const type = WITHDRAWAL_METHODS_MAP.BANK_CARD;

    await connection.query(
      `INSERT INTO withdraw SET id_order = '${getOrderId()}', phone = '${userPhoneNumber}', name_bank = '${bankName}', name_user = '${recipientName}', stk = '${bankAccountNumber}', ifsc = '${IFSC}', sdt = '${upiId}', tp = '${type}',  upi_image = '${upiImage}', time = '${time}', today = '${getTodayString()}', money = '${amount}'`,
    );
  },
  async changeWithdrawalStatus({ status, id }) {
    await connection.query(
      `UPDATE users SET status = '${status}' WHERE id = ${id}`,
    );
  },
};

const gamesDB = {
  async getTotalBettingAmount({ userPhoneNumber }) {
    const [gameWingo] = await connection.query(
      "SELECT SUM(money) as totalBettingAmount FROM minutes_1 WHERE phone = ?",
      [userPhoneNumber],
    );
    const gameWingoBettingAmount = gameWingo[0].totalBettingAmount;

    const [gameK3] = await connection.query(
      "SELECT SUM(money) as totalBettingAmount FROM result_k3 WHERE phone = ?",
      [userPhoneNumber],
    );
    const gameK3BettingAmount = gameK3[0].totalBettingAmount;

    const [game5D] = await connection.query(
      "SELECT SUM(money) as totalBettingAmount FROM result_5d WHERE phone = ?",
      [userPhoneNumber],
    );
    const game5DBettingAmount = game5D[0].totalBettingAmount;

    return gameWingoBettingAmount + gameK3BettingAmount + game5DBettingAmount;
  },
};

const depositDB = {
  async getTotalDeposit({ userPhoneNumber }) {
    const [deposit] = await connection.query(
      "SELECT SUM(money) as totalDepositAmount FROM recharge WHERE phone = ? AND status = 1",
      [userPhoneNumber],
    );
    const totalDepositAmount = deposit[0].totalDepositAmount;

    return totalDepositAmount;
  },
};

const withdrawalController = {
  addBankCard,
  getBankCardInfo,
  addUSDTAddress,
  getUSDTAddressInfo,
  createWithdrawalRequest,
  listWithdrawalRequests,
  listWithdrawalHistory,
  approveOrDenyWithdrawalRequest,
  addBankCardPage,
  addUSDTAddressPage,
  selectBankPage,
  approveAndInitiateAquapayWithdrawalRequest,
  verifyAquapayWithdrawalRequest,
};

export default withdrawalController;
