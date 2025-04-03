import connection from "../config/connectDB.js";

const homePage = async (req, res) => {
  const [settings] = await connection.query("SELECT `app` FROM admin_ac");
  let app = settings[0].app;
  const [banners] = await connection.execute("SELECT * FROM banners");
  const homscreenBanners = banners.filter(
    (banner) => banner.type === "homescreen",
  );
  const popupbanner = banners.find((banner) => banner.type == "popup");

  return res.render("home/index.ejs", {
    app,
    homscreenBanners,
    popupbanner: popupbanner || null,
  });
};

const activityPage = async (req, res) => {
  const [activityBanners] = await connection.execute(
    "SELECT * FROM banners WHERE type = 'activity'",
  );
  return res.render("checkIn/activity.ejs", {
    activityBanners,
  });
};

const supportPage = async (req, res) => {
  let auth = req.cookies.auth;

  const [users] = await connection.query(
    "SELECT `level`, `ctv` FROM users WHERE token = ?",
    [auth],
  );

  let telegram = "";
  if (users.length == 0) {
    let [settings] = await connection.query(
      "SELECT `telegram`, `cskh` FROM admin_ac",
    );
    telegram = settings[0].telegram;
  } else {
    if (users[0].level != 0) {
      var [settings] = await connection.query("SELECT * FROM admin_ac");
    } else {
      var [check] = await connection.query(
        "SELECT `telegram` FROM point_list WHERE phone = ?",
        [users[0].ctv],
      );
      if (check.length == 0) {
        var [settings] = await connection.query("SELECT * FROM admin_ac");
      } else {
        var [settings] = await connection.query(
          "SELECT `telegram` FROM point_list WHERE phone = ?",
          [users[0].ctv],
        );
      }
    }
    telegram = settings[0].telegram;
  }

  return res.render("member/support.ejs", { telegram });
};

const attendancePage = async (req, res) => {
  return res.render("checkIn/attendance.ejs");
};
const firstDepositBonusPage = async (req, res) => {
  return res.render("checkIn/firstDepositBonus.ejs");
};
const promotionRebateRatioPage = async (req, res) => {
  return res.render("promotion/rebateRadio.ejs");
};

const rebatePage = async (req, res) => {
  return res.render("checkIn/rebate.ejs");
};

const vipPage = async (req, res) => {
  return res.render("checkIn/vip.ejs");
};
const newHot = async (req, res) => {
  return res.render("checkIn/newHot.ejs");
};
const youtube = async (req, res) => {
  return res.render("checkIn/youtube.ejs");
};
const program = async (req, res) => {
  return res.render("checkIn/program.ejs");
};
const winzo = async (req, res) => {
  return res.render("checkIn/winzo.ejs");
};
const agent = async (req, res) => {
  return res.render("checkIn/agent.ejs");
};
const mystery = async (req, res) => {
  return res.render("checkIn/mystery.ejs");
};
const dailyCheck = async (req, res) => {
  return res.render("checkIn/dailyCheck.ejs");
};

const jackpotPage = async (req, res) => {
  return res.render("checkIn/jackpot.ejs");
};

const dailytaskPage = async (req, res) => {
  return res.render("checkIn/dailytask.ejs");
};

const invibonusPage = async (req, res) => {
  return res.render("checkIn/invibonus.ejs");
};
const invitationRulesPage = async (req, res) => {
  return res.render("checkIn/invitationRules.ejs");
};

const jackpotRulesPage = async (req, res) => {
  return res.render("checkIn/rules.ejs");
};

const aviatorBettingRewardPage = async (req, res) => {
  return res.render("checkIn/aviator_betting_reward.ejs");
};
const socialVideoAwardPagePage = async (req, res) => {
  return res.render("checkIn/social_video_award.ejs");
};

const jackpotWiningStarPage = async (req, res) => {
  return res.render("checkIn/wining_star.ejs");
};

const checkInPage = async (req, res) => {
  return res.render("checkIn/checkIn.ejs");
};

const checkDes = async (req, res) => {
  return res.render("checkIn/checkDes.ejs");
};

const checkRecord = async (req, res) => {
  return res.render("checkIn/checkRecord.ejs");
};

const addBank = async (req, res) => {
  return res.render("wallet/addbank.ejs");
};

const selectBank = async (req, res) => {
  return res.render("wallet/selectBank.ejs");
};
const invitationRecord = async (req, res) => {
  return res.render("checkIn/invitationRecord.ejs");
};
const rechargeAwardCollectionRecord = async (req, res) => {
  return res.render("checkIn/rechargeAwardCollectionRecord.ejs");
};
const attendanceRecordPage = async (req, res) => {
  return res.render("checkIn/attendanceRecord.ejs");
};
const attendanceRulesPage = async (req, res) => {
  return res.render("checkIn/attendanceRules.ejs");
};

const changeAvatarPage = async (req, res) => {
  return res.render("member/change_avatar.ejs");
};

// promotion
const promotionPage = async (req, res) => {
  return res.render("promotion/promotion.ejs");
};

const subordinatesPage = async (req, res) => {
  return res.render("promotion/subordinates.ejs");
};

const promotion1Page = async (req, res) => {
  return res.render("promotion/promotion1.ejs");
};

const promotionmyTeamPage = async (req, res) => {
  return res.render("promotion/myTeam.ejs");
};

const promotionDesPage = async (req, res) => {
  return res.render("promotion/promotionDes.ejs");
};

const comhistoryPage = async (req, res) => {
  return res.render("promotion/comhistory.ejs");
};

const tutorialPage = async (req, res) => {
  return res.render("promotion/tutorial.ejs");
};

const bonusRecordPage = async (req, res) => {
  return res.render("promotion/bonusrecord.ejs");
};

const previousQueriesPage = async (req, res, next) => {
  return res.render("member/previousQueries.ejs");
};

// wallet

const transactionhistoryPage = async (req, res) => {
  return res.render("wallet/transactionhistory.ejs");
};
const gameHistoryPage = async (req, res) => {
  return res.render("member/game_history.ejs");
};

const walletPage = async (req, res) => {
  return res.render("wallet/index.ejs");
};

const rechargePage = async (req, res) => {
  const [[setting]] = await connection.execute(
    "SELECT financial_setting FROM admin_ac WHERE id = 1",
  );
  const usdtExchangeRate = JSON.parse(
    setting.financial_setting,
  ).usdtExchangeRate;
  return res.render("wallet/recharge.ejs", {
    MINIMUM_MONEY_USDT: process.env.MINIMUM_MONEY_USDT,
    MINIMUM_MONEY_INR: process.env.MINIMUM_MONEY_INR,
    USDT_INR_EXCHANGE_RATE: usdtExchangeRate,
  });
};

const rechargerecordPage = async (req, res) => {
  return res.render("wallet/rechargerecord.ejs");
};

const withdrawalPage = async (req, res) => {
  const [[setting]] = await connection.execute(
    "SELECT financial_setting FROM admin_ac WHERE id = 1",
  );
  const parsedJson = JSON.parse(setting.financial_setting);
  const usdtExchangeRate = parsedJson.usdtExchangeRate;
  const inrCharge = parsedJson.adminWithdrawalCharges;
  const usdtCharge = parsedJson.adminUsdtWithdrawalCharges;
  return res.render("wallet/withdrawal.ejs", {
    MINIMUM_MONEY_USDT: process.env.MINIMUM_WITHDRAWAL_MONEY_USDT,
    MINIMUM_MONEY_INR: process.env.MINIMUM_WITHDRAWAL_MONEY_INR,
    USDT_INR_EXCHANGE_RATE: usdtExchangeRate,
    inrCharge,
    usdtCharge,
  });
};

const withdrawalrecordPage = async (req, res) => {
  return res.render("wallet/withdrawalrecord.ejs");
};
const transfer = async (req, res) => {
  return res.render("wallet/transfer.ejs");
};

// member page
const mianPage = async (req, res) => {
  let auth = req.cookies.auth;
  const [user] = await connection.query(
    "SELECT `level` FROM users WHERE `token` = ? ",
    [auth],
  );
  const [settings] = await connection.query("SELECT `cskh` FROM admin_ac");
  let cskh = settings[0].cskh;
  let level = user[0].level;
  return res.render("member/index.ejs", { level, cskh });
};

const settingsPage = async (req, res) => {
  let auth = req.cookies.auth;
  const [user] = await connection.query(
    "SELECT * FROM users WHERE `token` = ? ",
    [auth],
  );

  return res.render("member/settings.ejs", {
    NICKNAME: user[0].name_user,
    USER_ID: user[0].id_user,
  });
};

const aboutPage = async (req, res) => {
  return res.render("member/about/index.ejs");
};

const guidePage = async (req, res) => {
  return res.render("member/guide.ejs");
};

const feedbackPage = async (req, res) => {
  return res.render("member/feedback.ejs");
};

const notificationPage = async (req, res) => {
  return res.render("member/notification.ejs");
};

const loginNotificationPage = async (req, res) => {
  return res.render("member/login_notification.ejs");
};

const recordsalary = async (req, res) => {
  return res.render("member/about/recordsalary.ejs");
};

const privacyPolicy = async (req, res) => {
  return res.render("member/about/privacyPolicy.ejs");
};

const newtutorial = async (req, res) => {
  return res.render("member/newtutorial.ejs");
};

const forgot = async (req, res) => {
  let auth = req.cookies.auth;
  const [user] = await connection.query(
    "SELECT `time_otp` FROM users WHERE token = ? ",
    [auth],
  );
  let time = user[0].time_otp;
  return res.render("member/forgot.ejs", { time });
};

const redenvelopes = async (req, res) => {
  return res.render("member/redenvelopes.ejs");
};
const newGift = async (req, res) => {
  return res.render("checkIn/newGift.ejs");
};

const riskAgreement = async (req, res) => {
  return res.render("member/about/riskAgreement.ejs");
};

const myProfilePage = async (req, res) => {
  return res.render("member/myProfile.ejs");
};

const getSalaryRecord = async (req, res) => {
  const auth = req.cookies.auth;

  const [rows] = await connection.query(`SELECT * FROM users WHERE token = ?`, [
    auth,
  ]);
  let rowstr = rows[0];
  if (!rows) {
    return res.status(200).json({
      message: "Failed",
      status: false,
    });
  }
  const [getPhone] = await connection.query(
    `SELECT * FROM salary WHERE phone = ? ORDER BY time DESC`,
    [rowstr.phone],
  );

  console.log("asdasdasd : " + [rows.phone]);
  return res.status(200).json({
    message: "Success",
    status: true,
    data: {},
    rows: getPhone,
  });
};

const claimAttendancePage = async (req, res, next) => {
  const [[setting]] = await connection.execute(
    "SELECT financial_setting FROM admin_ac LIMIT 1",
  );
  const parsed = JSON.parse(setting.financial_setting);

  const startsAt = parsed.attendanceStartTime;
  const endsAt = parsed.attendanceEndTime;

  const now = new Date();
  const [startHours, startMinutes] = startsAt.split(":").map(Number);
  const [endHours, endMinutes] = endsAt.split(":").map(Number);

  const startTime = new Date();
  startTime.setHours(startHours, startMinutes, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHours, endMinutes, 0, 0);

  let timeLeft = 0;
  if (now >= startTime && now <= endTime) {
    timeLeft = Math.floor((endTime - now) / 1000);
  }

  return res.render("checkIn/claimAttendance.ejs", {
    timeRemains: timeLeft,
  });
};

const homeController = {
  gameHistoryPage,
  homePage,
  checkInPage,
  invibonusPage,
  rebatePage,
  jackpotPage,
  vipPage,
  activityPage,
  dailytaskPage,
  promotionPage,
  subordinatesPage,
  promotion1Page,
  walletPage,
  mianPage,
  myProfilePage,
  promotionmyTeamPage,
  promotionDesPage,
  comhistoryPage,
  tutorialPage,
  bonusRecordPage,
  rechargePage,
  rechargerecordPage,
  withdrawalPage,
  withdrawalrecordPage,
  aboutPage,
  privacyPolicy,
  riskAgreement,
  newGift,
  newtutorial,
  redenvelopes,
  forgot,
  checkDes,
  newHot,
  dailyCheck,
  winzo,
  agent,
  youtube,
  program,
  mystery,
  checkRecord,
  addBank,
  transfer,
  recordsalary,
  getSalaryRecord,
  transactionhistoryPage,
  jackpotRulesPage,
  jackpotWiningStarPage,
  attendancePage,
  firstDepositBonusPage,
  aviatorBettingRewardPage,
  socialVideoAwardPagePage,
  promotionRebateRatioPage,
  settingsPage,
  guidePage,
  feedbackPage,
  notificationPage,
  loginNotificationPage,
  selectBank,
  invitationRecord,
  rechargeAwardCollectionRecord,
  attendanceRecordPage,
  attendanceRulesPage,
  changeAvatarPage,
  invitationRulesPage,
  supportPage,
  claimAttendancePage,
  previousQueriesPage,
};

export default homeController;
