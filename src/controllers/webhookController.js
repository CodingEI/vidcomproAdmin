import connection from "../config/connectDB.js";
import adminController from "./adminController.js";

const updateRecharge = async (req, res) => {
  const timeNow = new Date();
  if (req.query.key != process.env.WEBHOOK_KEY) {
    return res.status(200).json({
      message: "Failed! Invalid key.",
      status: false,
      timeStamp: timeNow,
    });
  }

  if (!req.body.utr_no || !req.body.status) {
    return res.status(200).json({
      message: "Failed!",
      status: false,
      timeStamp: timeNow,
    });
  }
  if (req.body.status == "success") {
    const [info] = await connection.query(
      `SELECT * FROM recharge WHERE utr = ? LIMIT 1`,
      [req.body.utr_no],
    );

    if (info.length === 1) {
      const [user] = await connection.query(
        `SELECT * FROM users WHERE phone = ? LIMIT 1`,
        [info[0].phone],
      );

      await adminController.addUserAccountBalance({
        money: info[0].money,
        phone: user[0].phone,
        invite: user[0].invite,
        rechargeId: info[0].id,
      });

      return res.status(200).json({
        message: "Successful application confirmation",
        status: true,
        datas: {},
      });
    }

    return res.status(200).json({});
  } else {
    return res.status(200).json({});
  }
};

const webhookController = {
  updateRecharge,
};

export default webhookController;
