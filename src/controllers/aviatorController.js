import connection from "../config/connectDB.js";

const aviatorPage = async (req, res) => {
  const [user] = await connection.query(
    "SELECT `id`, `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
    [req.cookies.auth],
  );
  const [settingsRes] = await connection.query(
    "SELECT * FROM aviator_settings",
  );
  const [myBets] = await connection.execute(
    `SELECT * FROM aviator_userbets 
             WHERE userid = ? AND status = 1 
             ORDER BY id DESC LIMIT 15`,
    [user[0].id],
  );
  let settings = {};
  settingsRes.forEach((set) => {
    settings[set.category] = set.value;
  });
  let gameId = await currentId();
  const [allResults] = await connection.execute(
    "SELECT* FROM aviator_gameresults ORDER BY created_at DESC LIMIT 15",
  );

  return res.render("bet/aviator/aviator.ejs", {
    wallet: user[0].money,
    user: user,
    settings,
    gameId,
    myBets,
    allResults,
  });
};

const crashPlane = async (req, res) => {
  return 1;
};

const currentId = async () => {
  const [results] = await connection.execute(
    "SELECT id FROM aviator_gameresults ORDER BY id DESC LIMIT 1",
  );
  if (results.length > 0) {
    return results[0].id;
  } else {
    return 0;
  }
};

const getNewGeneratedGameId = async (req, res) => {
  await connection.execute(
    "UPDATE aviator_settings SET value = '0' WHERE category = 'game_status'",
  );
  req.session.gamegenerate = "1";
  const id = await currentId();
  return res.status(200).json({ id });
};

const getCurrentlyBet = async (req, res) => {
  const query = `
            SELECT aviator_userbets.userid, aviator_userbets.amount
            FROM aviator_userbets
            JOIN users ON users.id = aviator_userbets.userid
            WHERE aviator_userbets.gameid = ?
        `;
  const currentGameId = await currentId();
  const [results] = await connection.execute(query, [currentGameId]);
  let currentGameBet = results;

  const randomBetsCount = Math.floor(Math.random() * 400) + 400; // Random number between 400 and 900

  for (let i = 0; i < randomBetsCount; i++) {
    currentGameBet.push({
      userid: Math.floor(Math.random() * (50000 - 10000 + 1)) + 10000,
      amount: Math.floor(Math.random() * (9999 - 999 + 1)) + 999,
      image: `/aviator/images/avtar/av-${Math.floor(Math.random() * 72) + 1}.png`,
    });
  }

  // Prepare the response
  const currentGame = { id: currentGameId };
  const currentGameBetCount = currentGameBet.length;
  const response = {
    currentGame,
    currentGameBet,
    currentGameBetCount,
  };

  // Return the JSON response
  res.json(response);
};

const increamentor = async (req, res) => {
  try {
    const [gameStatusData] = await connection.execute(
      "SELECT * FROM aviator_settings WHERE category = 'game_status' LIMIT 1",
    );

    if (gameStatusData.length === 0) {
      return res.status(404).json({ error: "Game status not found." });
    }

    let resValue = 0;

    const currentGameId = await currentId(); // Fetch current game ID

    const [[totalBet]] = await connection.execute(
      "SELECT COUNT(*) as total FROM aviator_userbets WHERE gameid = ?",
      [currentGameId],
    );
    const [[totalAmount]] = await connection.execute(
      "SELECT SUM(amount) as total FROM aviator_userbets WHERE gameid = ?",
      [currentGameId],
    );

    let increamentSpeedMs;
    const userDidBet = parseInt(req.query.q) === 1;

    // If no bets were placed
    if (!userDidBet) {
      resValue = 10 + Math.random() * (50 - 10); // Generate random number between 100 and 1000
      increamentSpeedMs = 1 + Math.random() * (20 - 1);
    } else {
      // const randomResults = [
      //   1.05, 1.09, 1.1, 1.13, 1.15, 1.16, 1.17, 1.18, 1.2, 1.25,
      // ];
      // resValue =
      //   randomResults[Math.floor(Math.random() * randomResults.length)]; // Select random result
      resValue = 1.0;
      increamentSpeedMs = 100;
    }

    const response = {
      status: true,
      result: resValue,
      increamentSpeedMs,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in increamentor:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};
const gameover = async (req, res) => {
  try {
    let [userData] = await connection.query(
      "SELECT `id`, `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
      [req.cookies.auth],
    );
    const user = userData[0];

    req.session.result = null;

    const lastTime = parseFloat(req.body.last_time).toFixed(2);
    const gameId = await currentId();

    await connection.execute(
      `UPDATE aviator_gameresults SET result = ? WHERE id = ?`,
      [lastTime, gameId],
    );

    const [allUserBets] = await connection.execute(
      `SELECT * FROM aviator_userbets WHERE gameid = ? AND status = 0`,
      [gameId],
    );

    //  Iterate over each user bet and calculate final amount
    for (const userBet of allUserBets) {
      let result =
        parseFloat(req.body.last_time) <= 1.2 ? 0 : req.body.last_time;
      const finalAmount = parseFloat(userBet.amount) * parseFloat(result);

      await connection.execute(
        `UPDATE aviator_userbets SET status = 1 WHERE id = ?`,
        [userBet.id],
      );
    }

    await connection.execute(
      `UPDATE aviator_settings SET value = '0' WHERE category = 'game_status'`,
    );
    req.session.gamegenerate = "0";

    await connection.execute(
      `INSERT INTO aviator_gameresults (result) VALUES ('pending')`,
    );

    const updatedWallet = user.money;
    return res.status(200).json(updatedWallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Game over operation failed" });
  }
};

const betNow = async (req, res) => {
  let [userData] = await connection.query(
    "SELECT `id`, `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
    [req.cookies.auth],
  );
  const user = userData[0];
  let status = false;
  let message = "Something went wrong!";
  const returnBets = [];
  const userId = user.id;

  try {
    const allBets = req.body.all_bets; // Assuming all_bets is sent in the request body
    let updatedUserWalletBalance;
    for (let i = 0; i < allBets.length; i++) {
      const betAmount = parseFloat(allBets[i].bet_amount);
      const betType = allBets[i].bet_type;
      const sectionNo = allBets[i].section_no;
      const gameId = await currentId();

      const walletBalance = user.money;

      if (betAmount < walletBalance) {
        const [result] = await connection.execute(
          `INSERT INTO aviator_userbets (userid, amount, type, gameid, section_no) VALUES (?, ?, ?, ?, ?)`,
          [userId, betAmount, betType, gameId, sectionNo],
        );

        console.log("result----", result)

        const betId = result.insertId;
        returnBets.push({ bet_id: betId });

        updatedUserWalletBalance = user.money - betAmount;
        await connection.query("UPDATE users SET money = ? WHERE id = ? ", [
          updatedUserWalletBalance,
          userId,
        ]);
        message = "";
        status = true;
      } else {
        message = "Insufficient funds!!";
        break;
      }
    }

    const data = {
      wallet_balance: updatedUserWalletBalance, // Get updated wallet balance
      return_bets: returnBets,
    };
    console.log("data----", data)

    const response = {
      isSuccess: status,
      data: data,
      message: message,
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const myBetsHistory = async (req, res) => {
  let [userData] = await connection.query(
    "SELECT `id`, `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
    [req.cookies.auth],
  );
  const user = userData[0];
  try {
    const userId = user.id;

    const [userBets] = await connection.execute(
      `SELECT * FROM aviator_userbets 
             WHERE userid = ? AND status = 1
             ORDER BY id DESC LIMIT 15`,
      [userId],
    );

    return res.status(200).json(userBets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const cashout = async (req, res) => {
  let [userData] = await connection.query(
    "SELECT `id`, `phone`, `code`, `invite`, `level`, `money` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
    [req.cookies.auth],
  );

  const user = userData[0];

  let cashOutAmount = 0;
  let status = false;
  let message = "";
  const data = {};

  try {
    const { game_id, bet_id, win_multiplier } = req.query;

    let result;
    const [[data]] = await connection.execute(
      "SELECT * FROM aviator_gameresults WHERE id = ? LIMIT 1",
      [game_id],
    );
    if (data && data.result != "pending" && data.result != "") {
      result = data.result;
    } else {
      result = 0;
    }

    result = result == 0 ? win_multiplier : result; // Check if result is 0 and set it to win_multiplier

    // if (parseFloat(result) <= 1.2) {
    //   result = 0;
    // }

    const [[userBet]] = await connection.execute(
      "SELECT * FROM aviator_userbets WHERE id = ? LIMIT 1",
      [bet_id],
    );

    const betAmount = parseFloat(userBet.amount);
    cashOutAmount = betAmount * parseFloat(result);

    await connection.execute(
      "UPDATE users SET withdrawable_money = withdrawable_money + ? WHERE id = ?",
      [cashOutAmount, user.id],
    );

    const [[updatedUserData]] = await connection.execute(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [user.id],
    );

    data.wallet_balance = parseFloat(updatedUserData.money);
    data.cash_out_amount = cashOutAmount;

    await connection.execute(
      `UPDATE aviator_userbets SET status = 1, cashout_multiplier = ? WHERE id = ?`,
      [win_multiplier, bet_id],
    );

    status = true;

    const response = { isSuccess: status, data: data, message: message };
    return res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const aviatorController = {
  aviatorPage,
  crashPlane,
  currentId,
  getNewGeneratedGameId,
  getCurrentlyBet,
  increamentor,
  gameover,
  betNow,
  myBetsHistory,
  cashout,
};

export default aviatorController;
