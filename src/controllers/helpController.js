import connection from "../config/connectDB.js";
import path from "path";
import fs from "fs";

const submitQuery = async (req, res) => {
  try {
    let auth = req.cookies.auth;

    const [[user]] = await connection.query(
      "SELECT `phone` FROM users WHERE token = ? AND veri = 1  LIMIT 1",
      [auth],
    );

    // const payload = JSON.parse(json_string); // Convert string to JSON object
    // Extract data from request body (JSON)
    const { uid, query_type, query_details } = req.body;
    // Check if file is uploaded
    const file = req.file;
    // Validate required fields
    if (!uid || !query_type || !query_details) {
      return res
        .status(400)
        .json({ error: "uid, query_type, and query_details are required." });
    }
    // Checking if the file is not empty
    let fileData;
    let file_name;
    if (!file?.file) {
      fileData = file.buffer; // File data is in memory
      // Prepare file details
      //  storage_path = file ? "/uploads/" + file.filename : null;
      const filepath = path.join(
        path.resolve(),
        "src",
        "public",
        "uploads",
        file.originalname,
      );

      fs.writeFileSync(filepath, file.buffer);
      file_name = file ? file.originalname : null;
    }
    // Insert data into help_table
    await connection.execute(
      `INSERT INTO help_table (uid, phone, query_type, query_details,file_name, status) 
       VALUES (?, ? , ?, ?, ?, ?)`,
      [uid, user.phone, query_type, query_details, file_name, "pending"],
    );
    res.status(200).json({
      message: "Query submitted successfully",
      success: true,
    });
  } catch (err) {
    console.error("Error submitting query:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Function to get all submitted queries with status 'active'
 */
async function getAllSubmitedQuery(req, res) {
  try {
    // Fetch all active queries
    const [rows] = await connection.execute(
      `SELECT * FROM help_table WHERE status = 'pending'`,
    );
    // Convert binary file_data to Base64 and add image_url to each object
    const modifiedRows = rows.map((row) => {
      if (row.file_data) {
        row.image_url = `data:image/png;base64,${row.file_data.toString("base64")}`;
      } else {
        row.image_url = null;
      }
      return row;
    });
    res.status(200).json({
      message: "Fetched all active queries successfully",
      data: modifiedRows, // Send the modified rows with Base64 image
    });
  } catch (error) {
    console.error("Error fetching submitted queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const getUserQueries = async (req, res, next) => {
  try {
    let auth = req.cookies.auth;

    const [[user]] = await connection.query(
      "SELECT `phone` FROM users WHERE token = ? AND veri = 1  LIMIT 1 ",
      [auth],
    );
    const [data] = await connection.execute(
      "SELECT * FROM help_table WHERE phone = ? ORDER by ID DESC",
      [user.phone],
    );
    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.log("error occured");
  }
};
async function respondQuery(req, res) {
  try {
    await connection.execute(
      `UPDATE  help_table SET response = ? , status = 'resolved' WHERE id = ? AND status = 'pending'`,
      [req.body.message || "", req.body.id],
    );

    return res.status(200).json({
      status: true,
      message: "Data submitted successfully.",
    });
  } catch (error) {
    console.error("Error fetching submitted queries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
const helpController = {
  submitQuery,
  getAllSubmitedQuery,
  respondQuery,
  getUserQueries,
};

export default helpController;
